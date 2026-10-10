import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LeadFile } from './lead-file.entity';

export const LEAD_STATUSES = ['New', 'In Review', 'Contacted', 'Closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** A quote request from /contact. */
@Entity('leads')
@Index(['status', 'createdAt'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference shown on the success card, e.g. CL-K3F9QZ. */
  @Column({ type: 'varchar', length: 16, unique: true })
  reference: string;

  @Column({ type: 'varchar', length: 20, default: 'New' })
  status: LeadStatus;

  /** Unread until an admin opens it (the comp's unread dot). */
  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  /** Service key, or null for "Not sure yet". */
  @Column({ type: 'varchar', length: 60, nullable: true })
  service: string | null;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  /** Optional preferred date (YYYY-MM-DD) — a planning hint, not a booking. */
  @Column({ type: 'varchar', length: 10, nullable: true })
  preferredDate: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  /** When the visitor ticked the consent box. */
  @Column({ type: 'datetime' })
  consentAt: Date;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @OneToMany(() => LeadFile, (f) => f.lead, { cascade: true })
  files: LeadFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
