import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldErrors, optional, str, throwIfErrors } from '../common/errors';
import { emailOk } from '../inquiries/inquiry.validation';
import { Settings } from './settings.entity';

const IMAGE_RE = /^(\/(assets|media)\/[\w.\-\/]+|https?:\/\/\S+)$/;

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Settings) private readonly repo: Repository<Settings>) {}

  async get(): Promise<Settings> {
    let s = await this.repo.findOne({ where: { id: 1 } });
    if (!s) s = await this.repo.save(this.repo.create({ id: 1 }));
    return s;
  }

  toPublic(s: Settings) {
    return {
      businessName: s.businessName,
      contactName: s.contactName,
      phone: s.phone,
      phoneHref: s.phone ? 'tel:+' + s.phone.replace(/\D/g, '') : null,
      email: s.email,
      address: [s.addressLine1, s.addressLine2].filter(Boolean) as string[],
      cityLabel: s.cityLabel,
      aboutIntro: s.aboutIntro,
      aboutStory: s.aboutStory,
      aboutImage: s.aboutImage,
      successMessage: s.successMessage,
      hasPrivacyPolicy: !!s.privacyPolicy?.trim(),
      showContentFlags: s.showContentFlags,
      mobileQuoteBar: s.mobileQuoteBar,
    };
  }

  /** Public text of the privacy policy (kept out of /settings so it isn't shipped inside every page's props). */
  async privacyPolicy() {
    const s = await this.get();
    return { text: s.privacyPolicy?.trim() || null };
  }

  async update(body: Record<string, unknown>): Promise<Settings> {
    const s = await this.get();
    const errors: FieldErrors = {};
    const textFields: [keyof Settings, number][] = [
      ['businessName', 120], ['contactName', 120], ['phone', 40], ['email', 254], ['addressLine1', 200], ['addressLine2', 200],
      ['cityLabel', 80], ['aboutIntro', 1500], ['aboutStory', 4000], ['aboutImage', 400], ['successMessage', 600], ['notifyEmail', 254], ['privacyPolicy', 20000],
    ];
    for (const [k, max] of textFields) {
      if (!(k in body)) continue;
      const v = optional(body[k]);
      if (v && v.length > max) errors[k] = `Keep this under ${max.toLocaleString('en-US')} characters.`;
      (s as any)[k] = v;
    }
    if ('businessName' in body && !str(body.businessName).trim()) errors.businessName = 'Enter the business name.';
    if (s.email && !emailOk(s.email)) errors.email = 'Enter an email in the format name@example.com.';
    if (s.notifyEmail && !emailOk(s.notifyEmail)) errors.notifyEmail = 'Enter an email in the format name@example.com.';
    if (s.phone) {
      const d = s.phone.replace(/\D/g, '').length;
      if (!/^[\d\s()+.\-]+$/.test(s.phone) || d < 7 || d > 15) errors.phone = 'Check the number — it should have 7 to 15 digits.';
    }
    if (s.aboutImage && !IMAGE_RE.test(s.aboutImage)) errors.aboutImage = 'Upload an image or use a /media/… or https:// address.';
    for (const flag of ['showContentFlags', 'mobileQuoteBar'] as const) {
      if (flag in body) (s as any)[flag] = body[flag] === true || body[flag] === 'true';
    }
    throwIfErrors(errors);
    return this.repo.save(s);
  }
}
