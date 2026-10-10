export interface PublicSettings {
  businessName: string;
  contactName: string | null;
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  address: string[];
  cityLabel: string | null;
  aboutIntro: string | null;
  aboutStory: string | null;
  aboutImage: string | null;
  successMessage: string | null;
  hasPrivacyPolicy: boolean;
  showContentFlags: boolean;
  mobileQuoteBar: boolean;
}

export interface Service {
  id: number; key: string; title: string; tag: string; short: string; body: string; includes?: string; notes?: string;
  image: string; alt: string; focal?: string; ratio?: string; ratioLg?: string;
}
export interface Faq { id: number; question: string; answer: string; status?: string; onServices?: string }
export interface TitledItem { id: number; title: string; body: string }
export interface TextItem { id: number; text: string }
export interface BeforeAfter {
  id: number; title: string; body: string;
  beforeImage: string; beforeAlt: string; beforeCaption?: string; afterImage: string; afterAlt: string; afterCaption?: string;
}

export interface ContentBundle {
  services: Service[];
  faqs: Faq[];
  valuePoints: TitledItem[];
  ctaSteps: TextItem[];
  steps: TitledItem[];
  guidance: TextItem[];
  beforeAfter: BeforeAfter[];
}

export type TileSize = 'standard' | 'wide' | 'large';
export interface GalleryItem { id: number; title: string; category: string; categoryLabel: string; imageUrl: string; alt: string; focal: string; size: TileSize }
export interface GalleryResponse { total: number; categories: { key: string; label: string; count: number }[]; items: GalleryItem[] }

export interface FormOptions {
  services: { id: string; title: string }[];
  unsure: { id: string; title: string };
  statuses: string[];
  labels: Record<string, string>;
  photos: { max: number; maxMb: number; extensions: string[]; types: string[] };
}

// ───── admin ─────
export interface LeadRow { id: string; reference: string; name: string; location: string; status: string; read: boolean; createdAt: string; serviceLabel: string }
export interface LeadList {
  items: LeadRow[]; total: number; page: number; pages: number; pageSize: number;
  counts: Record<string, number>; unread: number; totalAll: number;
}
export interface LeadDetail {
  id: string; reference: string; status: string; read: boolean; name: string; phone: string; email: string; service: string | null; serviceLabel: string;
  location: string; preferredDate: string | null; details: string | null; consentAt: string; adminNotes: string | null; createdAt: string; updatedAt: string;
  files: { id: string; name: string; mime: string; bytes: number; url: string }[];
}

export interface AdminSettings {
  id: number; businessName: string; contactName: string | null; phone: string | null; email: string | null;
  addressLine1: string | null; addressLine2: string | null; cityLabel: string | null;
  aboutIntro: string | null; aboutStory: string | null; aboutImage: string | null; successMessage: string | null; notifyEmail: string | null; privacyPolicy: string | null;
  showContentFlags: boolean; mobileQuoteBar: boolean; updatedAt: string;
}

export type FieldKind = 'text' | 'textarea' | 'image' | 'list' | 'file' | 'select';
export interface FieldDef { name: string; label: string; kind: FieldKind; required?: boolean; max?: number; help?: string; options?: string[] }
export interface ContentSchema {
  type: string; label: string; singular: string; description: string; hasKey?: boolean; keyHelp?: string; titleField: string; page: string; fields: FieldDef[];
}
export interface ContentRow { id: number; type: string; key: string | null; sortOrder: number; published: boolean; fields: Record<string, unknown>; updatedAt: string }
export interface AdminGalleryItem {
  id: number; title: string; category: string; imageUrl: string; alt: string; focal: string; size: TileSize; sortOrder: number; published: boolean; updatedAt: string;
}
