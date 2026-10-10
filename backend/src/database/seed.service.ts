import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentService } from '../content/content.service';
import { GalleryService } from '../gallery/gallery.service';
import { Settings } from '../settings/settings.entity';
import {
  SEED_BEFORE_AFTER, SEED_CTA_STEPS, SEED_FAQS, SEED_GALLERY, SEED_GUIDANCE, SEED_SERVICES, SEED_SETTINGS, SEED_STEPS, SEED_VALUE_POINTS,
} from './seed-data';

/** Idempotent first-boot seed: each collection is filled only while it is empty. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    private readonly content: ContentService,
    private readonly gallery: GalleryService,
    @InjectRepository(Settings) private readonly settings: Repository<Settings>,
  ) {}

  async onApplicationBootstrap() {
    const seeded: string[] = [];
    if (!(await this.settings.findOne({ where: { id: 1 } }))) {
      await this.settings.save(this.settings.create({ id: 1, ...SEED_SETTINGS }));
      seeded.push('settings');
    }
    const sets: [string, { key?: string; fields: Record<string, unknown> }[]][] = [
      ['service', SEED_SERVICES], ['faq', SEED_FAQS], ['value-point', SEED_VALUE_POINTS], ['cta-step', SEED_CTA_STEPS],
      ['process-step', SEED_STEPS], ['guidance', SEED_GUIDANCE], ['before-after', SEED_BEFORE_AFTER],
    ];
    for (const [type, items] of sets) {
      if ((await this.content.countType(type)) === 0) {
        await this.content.insertMany(type, items);
        seeded.push(type);
      }
    }
    if ((await this.gallery.count()) === 0) {
      await this.gallery.insertMany(SEED_GALLERY);
      seeded.push('gallery');
    }
    if (seeded.length) this.logger.log(`Seeded: ${seeded.join(', ')}`);
  }
}
