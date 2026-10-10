import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { FieldErrors, str, throwIfErrors } from '../common/errors';
import { ContentBlock } from './content-block.entity';
import { CONTENT_SCHEMAS, schemaFor } from './content.schemas';

export const UNSURE = { id: 'unsure', title: 'Not sure yet' };
const KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_RE = /^(\/(assets|media)\/[\w.\-\/]+|https?:\/\/\S+)$/;
const FILE_RE = /^(\/media\/[\w.\-\/]+\.pdf|https?:\/\/\S+)$/i;

export interface PublicBlock {
  id: number;
  key: string | null;
  [field: string]: unknown;
}

@Injectable()
export class ContentService {
  constructor(@InjectRepository(ContentBlock) private readonly repo: Repository<ContentBlock>) {}

  private toPublic(b: ContentBlock): PublicBlock {
    return { ...b.fields, id: b.id, key: b.key };
  }

  private assertType(type: string) {
    const schema = schemaFor(type);
    if (!schema) throw new NotFoundException({ message: `Unknown content type "${type}".` });
    return schema;
  }

  async listPublished(type: string): Promise<PublicBlock[]> {
    this.assertType(type);
    const rows = await this.repo.find({ where: { type, published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    return rows.map((r) => this.toPublic(r));
  }

  /** Everything the public site needs in one request, keyed by each schema's bundleKey. */
  async bundle() {
    const rows = await this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const out: Record<string, PublicBlock[]> = {};
    for (const s of CONTENT_SCHEMAS) out[s.bundleKey] = rows.filter((r) => r.type === s.type).map((r) => this.toPublic(r));
    return out;
  }

  /** Published services as slug → title, in display order (project categories + enquiry project types). */
  async serviceMap(): Promise<Record<string, string>> {
    const rows = await this.repo.find({ where: { type: 'service', published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const map: Record<string, string> = {};
    rows.forEach((r) => r.key && (map[r.key] = String(r.fields.title ?? r.key)));
    return map;
  }

  /** Quote-form service options — also the server-side allow-list. Empty / "unsure" means "Not sure yet". */
  async serviceIds(): Promise<string[]> {
    return Object.keys(await this.serviceMap());
  }

  /** Name lookup covering unpublished services too (admin display of older enquiries). */
  async serviceNameMap(): Promise<Record<string, string>> {
    const rows = await this.repo.find({ where: { type: 'service' } });
    const map: Record<string, string> = { [UNSURE.id]: UNSURE.title };
    rows.forEach((r) => r.key && (map[r.key] = String(r.fields.title ?? r.key)));
    return map;
  }

  // ───────── admin ─────────
  schemas() {
    return CONTENT_SCHEMAS;
  }

  async adminList(type: string, q?: string) {
    this.assertType(type);
    const rows = await this.repo.find({ where: { type }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const term = (q || '').trim().toLowerCase();
    return term ? rows.filter((r) => JSON.stringify(r.fields).toLowerCase().includes(term) || (r.key || '').includes(term)) : rows;
  }

  private async validate(type: string, body: Record<string, unknown>, id?: number) {
    const schema = this.assertType(type);
    const errors: FieldErrors = {};
    const fields: Record<string, unknown> = {};
    const input = (body.fields && typeof body.fields === 'object' ? body.fields : {}) as Record<string, unknown>;

    for (const f of schema.fields) {
      if (f.kind === 'list') {
        const list = Array.isArray(input[f.name]) ? (input[f.name] as unknown[]) : [];
        const clean = list.map((x) => str(x).trim()).filter(Boolean);
        if (f.max && clean.some((x) => x.length > f.max!)) errors[f.name] = `Keep each item under ${f.max} characters.`;
        if (clean.length > 20) errors[f.name] = 'Add up to 20 items.';
        fields[f.name] = clean;
        continue;
      }
      const v = str(input[f.name]).trim();
      if (f.required && !v) errors[f.name] = `Enter ${f.label.toLowerCase()}.`;
      else if (f.max && v.length > f.max) errors[f.name] = `Keep this under ${f.max} characters.`;
      else if (f.kind === 'image' && v && !IMAGE_RE.test(v)) errors[f.name] = 'Upload an image or use a /assets/… or https:// address.';
      else if (f.kind === 'file' && v && !FILE_RE.test(v)) errors[f.name] = 'Upload a PDF or use an https:// address.';
      else if (f.kind === 'select' && v && !(f.options || []).includes(v)) errors[f.name] = 'Choose an option from the list.';
      fields[f.name] = v;
    }

    let key: string | null = null;
    if (schema.hasKey) {
      key = str(body.key).trim().toLowerCase();
      if (!key) errors.key = 'Enter a short id, e.g. "lawn".';
      else if (!KEY_RE.test(key) || key.length > 60) errors.key = 'Use lowercase letters, numbers and dashes only.';
      else if (key === UNSURE.id) errors.key = '"unsure" is reserved for the "Not sure yet" option.';
      else if (await this.repo.findOne({ where: { type, key, ...(id ? { id: Not(id) } : {}) } })) errors.key = 'Another entry already uses this id.';
    }
    throwIfErrors(errors);
    return { fields, key };
  }

  async create(type: string, body: Record<string, unknown>) {
    const { fields, key } = await this.validate(type, body);
    const last = await this.repo.findOne({ where: { type }, order: { sortOrder: 'DESC' } });
    return this.repo.save(this.repo.create({ type, key, fields, published: body.published !== false, sortOrder: (last?.sortOrder ?? -1) + 1 }));
  }

  async update(id: number, body: Record<string, unknown>) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException({ message: 'That item no longer exists.' });
    if (body.fields === undefined && typeof body.published === 'boolean') {
      row.published = body.published;
      return this.repo.save(row);
    }
    const { fields, key } = await this.validate(row.type, body, id);
    row.fields = fields;
    row.key = key;
    if (typeof body.published === 'boolean') row.published = body.published;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException({ message: 'That item no longer exists.' });
    await this.repo.remove(row);
    return { ok: true };
  }

  async reorder(type: string, ids: unknown) {
    this.assertType(type);
    if (!Array.isArray(ids) || !ids.every((x) => Number.isInteger(x))) throw new BadRequestException({ message: 'ids must be a list of numbers.' });
    const rows = await this.repo.find({ where: { type } });
    const pos = new Map((ids as number[]).map((id, i) => [id, i]));
    rows.forEach((r) => (r.sortOrder = pos.has(r.id) ? pos.get(r.id)! : ids.length + r.sortOrder));
    await this.repo.save(rows);
    return this.adminList(type);
  }

  // used by the seeder
  countType(type: string) {
    return this.repo.count({ where: { type } });
  }
  async insertMany(type: string, items: { key?: string; fields: Record<string, unknown> }[]) {
    await this.repo.save(items.map((it, i) => this.repo.create({ type, key: it.key ?? null, fields: it.fields, sortOrder: i, published: true })));
  }
}
