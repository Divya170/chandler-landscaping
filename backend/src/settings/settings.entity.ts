import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Singleton row (id = 1): business details, client-approved copy slots and the comp's feature flags. */
@Entity('settings')
export class Settings {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 120, default: 'Chandler Landscaping' })
  businessName: string;

  /** Point of contact named on Home, About and FAQs. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addressLine1: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addressLine2: string | null;

  /** Short service-area label in the hero kicker ("New York, NY"). */
  @Column({ type: 'varchar', length: 80, nullable: true })
  cityLabel: string | null;

  /** Client-approved introduction in the owner's own words (Home + About). Placeholder shown while empty. */
  @Column({ type: 'text', nullable: true })
  aboutIntro: string | null;

  /** Client-approved business story (About → "What we look after"). */
  @Column({ type: 'text', nullable: true })
  aboutStory: string | null;

  /** Approved photo of the owner / team. Striped placeholder shown while empty. */
  @Column({ type: 'varchar', length: 400, nullable: true })
  aboutImage: string | null;

  /** Client-approved next-step wording on the quote success card. */
  @Column({ type: 'text', nullable: true })
  successMessage: string | null;

  /** Client/legal-approved privacy policy. Plain text: blank line = new paragraph, "## " starts a heading. Empty = no /privacy page content. */
  @Column({ type: 'text', nullable: true })
  privacyPolicy: string | null;

  /** Where new-enquiry alert emails are sent (needs SMTP_* in backend/.env). */
  @Column({ type: 'varchar', length: 254, nullable: true })
  notifyEmail: string | null;

  /** data-props.showContentFlags — dashed "awaiting confirmation" notes. */
  @Column({ type: 'boolean', default: true })
  showContentFlags: boolean;

  /** data-props.mobileQuoteBar — sticky Request a Quote / Call bar on small screens. */
  @Column({ type: 'boolean', default: true })
  mobileQuoteBar: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
