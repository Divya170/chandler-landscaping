import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * One polymorphic table for every simple CMS collection on the site
 * (services, hero slides, principles, enquiry steps, FAQs, quote next-steps, before/after).
 * `type` is the discriminator; `fields` holds the type-specific values (see content.schemas.ts).
 */
@Entity('content_blocks')
@Index(['type', 'sortOrder'])
export class ContentBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40 })
  type: string;

  /** Stable slug for types that need one (e.g. service id `lawn`, used in URLs & enquiries). */
  @Column({ type: 'varchar', length: 60, nullable: true })
  key: string | null;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @Column({ type: 'simple-json' })
  fields: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
