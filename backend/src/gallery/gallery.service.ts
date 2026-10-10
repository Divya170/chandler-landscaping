import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldErrors, str, throwIfErrors } from '../common/errors';
import { ContentService } from '../content/content.service';
import { Project, TILE_SIZES, TileSize } from './project.entity';

const IMAGE_RE = /^(\/(assets|media)\/[\w.\-\/]+|https?:\/\/\S+)$/;
const FOCAL_RE = /^(\d{1,3}%|center|left|right|top|bottom)( (\d{1,3}%|center|top|bottom))?$/;

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
    private readonly content: ContentService,
  ) {}

  /** Filter categories = published services, labelled by their short tag ("Lawn", "Cleanup", "Hedges"). */
  private async categoryLabels(): Promise<{ key: string; label: string }[]> {
    const services = await this.content.listPublished('service');
    return services.map((s) => ({ key: String(s.key), label: String(s.tag || s.title) }));
  }

  async publicList(category?: string) {
    const [all, cats] = await Promise.all([
      this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' } }),
      this.categoryLabels(),
    ]);
    const label = Object.fromEntries(cats.map((c) => [c.key, c.label]));
    const cat = (category || '').trim();
    const items = cat && cat !== 'all' ? all.filter((p) => p.category === cat) : all;
    return {
      total: all.length,
      // Every published service is offered as a filter, as in the comp — empty ones show "No approved photos in this category yet."
      categories: cats.map((c) => ({ ...c, count: all.filter((p) => p.category === c.key).length })),
      items: items.map(({ id, title, category: c, imageUrl, alt, focal, size }) => ({
        id, title, category: c, categoryLabel: label[c] || c, imageUrl, alt, focal, size,
      })),
    };
  }

  async adminList(q?: string, category?: string) {
    const term = (q || '').trim().toLowerCase();
    const rows = await this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
    return rows.filter(
      (p) => (!category || category === 'all' || p.category === category) && (!term || `${p.title} ${p.alt}`.toLowerCase().includes(term)),
    );
  }

  async categories() {
    return this.categoryLabels();
  }

  private async validate(body: Record<string, unknown>) {
    const errors: FieldErrors = {};
    const keys = (await this.categoryLabels()).map((c) => c.key);
    const title = str(body.title).trim();
    const category = str(body.category).trim();
    const imageUrl = str(body.imageUrl).trim();
    const alt = str(body.alt).trim();
    const focal = str(body.focal).trim() || '50% 50%';
    const size = (str(body.size).trim() || 'standard') as TileSize;
    if (!title) errors.title = 'Enter a caption.';
    else if (title.length > 120) errors.title = 'Keep this under 120 characters.';
    if (!keys.includes(category)) errors.category = 'Choose a service category.';
    if (!imageUrl) errors.imageUrl = 'Upload an image.';
    else if (!IMAGE_RE.test(imageUrl)) errors.imageUrl = 'Upload an image or use a /assets/… or https:// address.';
    if (!alt) errors.alt = 'Describe the image for screen-reader users.';
    else if (alt.length > 300) errors.alt = 'Keep this under 300 characters.';
    if (!FOCAL_RE.test(focal)) errors.focal = 'Use a position like "50% 60%" or "center".';
    if (!TILE_SIZES.includes(size)) errors.size = 'Choose a tile size.';
    throwIfErrors(errors);
    return { title, category, imageUrl, alt, focal, size, published: body.published !== false };
  }

  async create(body: Record<string, unknown>) {
    const data = await this.validate(body);
    const last = await this.repo.findOne({ where: {}, order: { sortOrder: 'DESC' } });
    return this.repo.save(this.repo.create({ ...data, sortOrder: (last?.sortOrder ?? -1) + 1 }));
  }

  async update(id: number, body: Record<string, unknown>) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException({ message: 'That photo no longer exists.' });
    if (Object.keys(body).length === 1 && typeof body.published === 'boolean') {
      row.published = body.published;
      return this.repo.save(row);
    }
    Object.assign(row, await this.validate({ ...row, ...body }));
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException({ message: 'That photo no longer exists.' });
    await this.repo.remove(row);
    return { ok: true };
  }

  async reorder(ids: unknown) {
    if (!Array.isArray(ids) || !ids.every((x) => Number.isInteger(x))) throw new BadRequestException({ message: 'ids must be a list of numbers.' });
    const rows = await this.repo.find();
    const pos = new Map((ids as number[]).map((id, i) => [id, i]));
    rows.forEach((r) => (r.sortOrder = pos.has(r.id) ? pos.get(r.id)! : ids.length + r.sortOrder));
    await this.repo.save(rows);
    return this.adminList();
  }

  count() {
    return this.repo.count();
  }
  async insertMany(items: Pick<Project, 'title' | 'category' | 'imageUrl' | 'alt' | 'focal' | 'size'>[]) {
    await this.repo.save(items.map((it, i) => this.repo.create({ ...it, sortOrder: i, published: true })));
  }
}
