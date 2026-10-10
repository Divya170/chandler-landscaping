import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource, Repository } from 'typeorm';
import { optional, str, throwIfErrors } from '../common/errors';
import { MAX_FILE_BYTES, verifyFile } from '../common/file-signature';
import { config } from '../config';
import { ContentService, UNSURE } from '../content/content.service';
import { buildLeadEmail, oneLine } from '../mail/lead-email';
import { MailService } from '../mail/mail.service';
import { SettingsService } from '../settings/settings.service';
import { LABELS, MAX_PHOTOS, PHOTO_EXTENSIONS, QuoteInput, validateQuote } from './inquiry.validation';
import { LeadFile } from './lead-file.entity';
import { Lead, LEAD_STATUSES, LeadStatus } from './lead.entity';

export interface UploadedPhoto {
  originalname: string;
  buffer: Buffer;
  size: number;
  fieldname: string;
}

const PAGE_SIZE = 12;
const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I — easy to read back over the phone

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger('Quotes');

  constructor(
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(LeadFile) private readonly files: Repository<LeadFile>,
    private readonly dataSource: DataSource,
    private readonly content: ContentService,
    private readonly mail: MailService,
    private readonly settings: SettingsService,
  ) {
    fs.mkdirSync(config.privateUploadDir, { recursive: true });
  }

  async formOptions() {
    const services = await this.content.serviceMap();
    return {
      services: Object.entries(services).map(([id, title]) => ({ id, title })),
      unsure: UNSURE,
      statuses: LEAD_STATUSES,
      labels: LABELS,
      photos: { max: MAX_PHOTOS, maxMb: MAX_FILE_BYTES / 1048576, extensions: PHOTO_EXTENSIONS, types: ['image/jpeg', 'image/png', 'image/webp'] },
    };
  }

  private async newReference(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const bytes = randomBytes(6);
      const ref = 'CL-' + Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
      if (!(await this.leads.findOne({ where: { reference: ref } }))) return ref;
    }
    throw new Error('Could not allocate a reference');
  }

  // ───────── public submission ─────────
  async create(body: Record<string, unknown>, uploads: UploadedPhoto[]) {
    // Honeypot: the comp shows a normal-looking success (reference "—") so bots learn nothing. Nothing is stored.
    if (str(body.website).trim()) {
      this.logger.warn('Honeypot submission discarded');
      return { ok: true, reference: '—' };
    }
    const { errors, data } = validateQuote(body, await this.content.serviceIds());

    const photos = uploads.filter((f) => f.fieldname === 'photos' || f.fieldname === 'photos[]');
    const verified: { file: UploadedPhoto; mime: string; ext: string }[] = [];
    if (photos.length > MAX_PHOTOS) errors.photos = `You can attach up to ${MAX_PHOTOS} photos.`;
    else {
      for (const f of photos) {
        if (f.size > MAX_FILE_BYTES) { errors.photos = `${f.originalname} — larger than 10 MB`; break; }
        const kind = verifyFile(f.originalname, f.buffer, PHOTO_EXTENSIONS);
        if (!kind) { errors.photos = `${f.originalname} — only JPEG, PNG or WebP`; break; }
        verified.push({ file: f, mime: kind.mime, ext: kind.ext });
      }
    }
    throwIfErrors(errors);

    const written: string[] = [];
    try {
      const reference = await this.newReference();
      await this.dataSource.transaction(async (m) => {
        const saved = await m.save(Lead, m.create(Lead, { ...data, reference, status: 'New', read: false, consentAt: new Date() }));
        for (const v of verified) {
          const storageKey = `${randomUUID()}.${v.ext}`;
          fs.writeFileSync(path.join(config.privateUploadDir, storageKey), v.file.buffer);
          written.push(storageKey);
          await m.save(LeadFile, m.create(LeadFile, {
            leadId: saved.id, originalName: v.file.originalname.slice(0, 255), storageKey, mime: v.mime, bytes: v.file.size,
          }));
        }
      });
      this.logger.log(`New quote request ${reference} (${data.service || 'unsure'}) with ${verified.length} photo(s)`);
      // Fire and forget: the visitor's success never waits on (or fails because of) email.
      void this.notifyNewLead(reference, data, verified.length);
      return { ok: true, reference };
    } catch (err) {
      written.forEach((k) => fs.rmSync(path.join(config.privateUploadDir, k), { force: true }));
      throw err;
    }
  }

  /** Emails the "Notification email" from Settings. Logs and swallows every failure. */
  private async notifyNewLead(reference: string, data: QuoteInput, photoCount: number) {
    try {
      const s = await this.settings.get();
      const to = s.notifyEmail?.trim();
      if (!to) { this.logger.warn(`No notification email set in Admin → Settings, so ${reference} was not emailed.`); return; }
      const names = await this.content.serviceNameMap();
      const email = buildLeadEmail(
        {
          reference, name: data.name, phone: data.phone, email: data.email,
          serviceLabel: data.service ? names[data.service] || data.service : UNSURE.title,
          location: data.location, preferredDate: data.preferredDate, details: data.details, photoCount, receivedAt: new Date(),
        },
        `${config.siteUrl}/admin/enquiries`,
        s.businessName,
      );
      // MailService logs a one-time hint and returns false when SMTP isn't configured.
      const ok = await this.mail.send({ to, ...email, replyTo: oneLine(data.email) });
      if (ok) this.logger.log(`Alert for ${reference} sent to ${to}`);
    } catch (err) {
      this.logger.error(`Alert for ${reference} failed: ${(err as Error).message}`);
    }
  }

  // ───────── admin ─────────
  private filtered(query: Record<string, string | undefined>) {
    const qb = this.leads.createQueryBuilder('l');
    const term = (query.q || '').trim().toLowerCase().replace(/[%_]/g, '');
    if (term) {
      qb.andWhere(
        `(LOWER(l.name) LIKE :t OR LOWER(l.email) LIKE :t OR LOWER(l.location) LIKE :t OR LOWER(l.reference) LIKE :t
          OR LOWER(l.phone) LIKE :t OR LOWER(COALESCE(l.details,'')) LIKE :t)`,
        { t: `%${term}%` },
      );
    }
    if (query.status && query.status !== 'All') qb.andWhere('l.status = :status', { status: query.status });
    if (query.service === UNSURE.id) qb.andWhere('l.service IS NULL');
    else if (query.service && query.service !== 'All') qb.andWhere('l.service = :service', { service: query.service });
    if (query.unread === 'true') qb.andWhere('l.read = 0');
    return qb;
  }

  async list(query: Record<string, string | undefined>) {
    const qb = this.filtered(query);
    const total = await qb.getCount();
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, Number(query.page) || 1), pages);
    const rows = await qb.orderBy('l.createdAt', 'DESC').skip((page - 1) * PAGE_SIZE).take(PAGE_SIZE).getMany();
    const names = await this.content.serviceNameMap();
    const countRows: { status: string; n: number }[] = await this.leads
      .createQueryBuilder('l').select('l.status', 'status').addSelect('COUNT(*)', 'n').groupBy('l.status').getRawMany();
    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, Number(countRows.find((r) => r.status === s)?.n || 0)]));
    const unread = await this.leads.count({ where: { read: false } });
    return {
      items: rows.map((l) => ({
        id: l.id, reference: l.reference, name: l.name, location: l.location, status: l.status, read: l.read, createdAt: l.createdAt,
        serviceLabel: l.service ? names[l.service] || l.service : UNSURE.title,
      })),
      total, page, pages, pageSize: PAGE_SIZE, counts, unread, totalAll: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  }

  private sign(fileId: string, exp: number) {
    return createHmac('sha256', config.jwtSecret).update(`${fileId}.${exp}`).digest('hex');
  }

  /** Opening an enquiry marks it read, as in the comp. */
  async detail(id: string, markRead = true) {
    const lead = await this.leads.findOne({ where: { id }, relations: { files: true } });
    if (!lead) throw new NotFoundException({ message: 'That enquiry no longer exists.' });
    if (markRead && !lead.read) {
      lead.read = true;
      await this.leads.update({ id }, { read: true });
    }
    const names = await this.content.serviceNameMap();
    const exp = Math.floor(Date.now() / 1000) + config.signedUrlTtlSeconds;
    const { files, ...rest } = lead;
    return {
      ...rest,
      serviceLabel: lead.service ? names[lead.service] || lead.service : UNSURE.title,
      files: (files || []).map((f) => ({
        id: f.id, name: f.originalName, mime: f.mime, bytes: f.bytes,
        url: `/api/files/${f.id}?exp=${exp}&sig=${this.sign(f.id, exp)}`,
      })),
    };
  }

  async update(id: string, body: Record<string, unknown>) {
    const lead = await this.leads.findOne({ where: { id } });
    if (!lead) throw new NotFoundException({ message: 'That enquiry no longer exists.' });
    if (body.status !== undefined) {
      const status = str(body.status) as LeadStatus;
      if (!LEAD_STATUSES.includes(status)) throwIfErrors({ status: 'Choose a valid status.' });
      lead.status = status;
    }
    if (typeof body.read === 'boolean') lead.read = body.read;
    if (body.adminNotes !== undefined) {
      const notes = optional(body.adminNotes);
      if (notes && notes.length > 4000) throwIfErrors({ adminNotes: 'Keep notes under 4,000 characters.' });
      lead.adminNotes = notes;
    }
    await this.leads.save(lead);
    return this.detail(id, false);
  }

  async remove(id: string) {
    const lead = await this.leads.findOne({ where: { id }, relations: { files: true } });
    if (!lead) throw new NotFoundException({ message: 'That enquiry no longer exists.' });
    const keys = (lead.files || []).map((f) => f.storageKey);
    await this.files.delete({ leadId: id });
    await this.leads.delete({ id });
    keys.forEach((k) => fs.rmSync(path.join(config.privateUploadDir, k), { force: true }));
    return { ok: true };
  }

  async exportCsv(query: Record<string, string | undefined>) {
    const rows = await this.filtered(query).orderBy('l.createdAt', 'DESC').getMany();
    const names = await this.content.serviceNameMap();
    const cols = ['reference', 'createdAt', 'status', 'name', 'phone', 'email', 'service', 'location', 'preferredDate', 'details'] as const;
    const esc = (v: unknown) => {
      let s = v instanceof Date ? v.toISOString() : v == null ? '' : String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // spreadsheet formula-injection guard
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const val = (l: Lead, c: (typeof cols)[number]) => (c === 'service' ? (l.service ? names[l.service] || l.service : UNSURE.title) : l[c]);
    return [cols.join(','), ...rows.map((l) => cols.map((c) => esc(val(l, c))).join(','))].join('\n');
  }

  async signedFile(id: string, exp: string, sig: string) {
    const e = Number(exp);
    if (!e || e < Math.floor(Date.now() / 1000)) throw new ForbiddenException({ message: 'This link has expired. Reopen the enquiry to get a fresh one.' });
    const expected = Buffer.from(this.sign(id, e));
    const given = Buffer.from(String(sig || ''));
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) throw new ForbiddenException({ message: 'Invalid link.' });
    const file = await this.files.findOne({ where: { id } });
    if (!file) throw new NotFoundException({ message: 'File not found.' });
    const full = path.join(config.privateUploadDir, path.basename(file.storageKey));
    if (!fs.existsSync(full)) throw new NotFoundException({ message: 'File not found.' });
    return { file, full };
  }

  assertUuid(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BadRequestException({ message: 'Invalid id.' });
  }
}
