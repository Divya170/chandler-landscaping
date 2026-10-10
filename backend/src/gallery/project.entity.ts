import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const TILE_SIZES = ['standard', 'wide', 'large'] as const;
export type TileSize = (typeof TILE_SIZES)[number];

/** A photo in the Our Work gallery, filed under a service. */
@Entity('gallery_items')
@Index(['published', 'sortOrder'])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  /** Caption, e.g. "Front lawn and flower beds". */
  @Column({ type: 'varchar', length: 120 })
  title: string;

  /** Service key (content block `service`) used for the filter chips. */
  @Column({ type: 'varchar', length: 60 })
  category: string;

  @Column({ type: 'varchar', length: 400 })
  imageUrl: string;

  @Column({ type: 'varchar', length: 300 })
  alt: string;

  /** CSS object-position, e.g. "50% 60%". */
  @Column({ type: 'varchar', length: 20, default: '50% 50%' })
  focal: string;

  /** Tile size in the mosaic: standard 1×1, wide 2×1, large 2×2. */
  @Column({ type: 'varchar', length: 10, default: 'standard' })
  size: TileSize;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
