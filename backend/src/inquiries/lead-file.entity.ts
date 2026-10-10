import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lead } from './lead.entity';

/** Photo attached to a quote request. Stored privately; served only via short-lived signed URLs. */
@Entity('lead_files')
export class LeadFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  leadId: string;

  @ManyToOne(() => Lead, (l) => l.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 120 })
  storageKey: string;

  @Column({ type: 'varchar', length: 40 })
  mime: string;

  @Column({ type: 'integer' })
  bytes: number;

  @CreateDateColumn()
  createdAt: Date;
}
