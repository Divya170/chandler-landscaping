/**
 * Field schemas per content type. The admin UI renders its forms from these
 * (GET /api/admin/content/schemas) and ContentService validates against them.
 */
export type FieldKind = 'text' | 'textarea' | 'image' | 'list' | 'file' | 'select';

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  help?: string;
  options?: string[];
}

export interface ContentSchema {
  type: string;
  /** Key in the public GET /api/content bundle. */
  bundleKey: string;
  label: string;
  singular: string;
  description: string;
  /** Public page where this content appears (admin "View on site" link). */
  page: string;
  hasKey?: boolean;
  keyHelp?: string;
  titleField: string;
  fields: FieldDef[];
}

export const RATIOS = ['1/1', '4/5', '5/4', '4/3', '3/4', '16/10'];
export const FAQ_STATUS = ['Approved', 'Awaiting client approval'];
export const YES_NO = ['No', 'Yes'];

export const CONTENT_SCHEMAS: ContentSchema[] = [
  {
    type: 'service', bundleKey: 'services', label: 'Services', singular: 'Service', page: '/services',
    description: 'Shown on Home, Services, About and the footer, offered in the quote form, and used as Our Work filter categories. The first service is featured on Home.',
    hasKey: true,
    keyHelp: 'Lowercase letters, numbers and dashes. Used in links (/services?s=lawn, /contact?service=lawn) and stored on enquiries — avoid changing it once live.',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { name: 'tag', label: 'Short label', kind: 'text', required: true, max: 24, help: 'Used for Our Work filters, e.g. "Lawn".' },
      { name: 'short', label: 'Summary', kind: 'textarea', required: true, max: 220, help: 'One sentence for Home.' },
      { name: 'body', label: 'Description', kind: 'textarea', required: true, max: 900, help: 'Shown on the Services page.' },
      { name: 'includes', label: "What's included", kind: 'textarea', max: 600, help: 'Leave blank until confirmed — the site shows an "awaiting confirmation" note.' },
      { name: 'notes', label: 'Good to know', kind: 'textarea', max: 600, help: 'e.g. visit frequency, green-waste removal, height limits.' },
      { name: 'image', label: 'Image', kind: 'image', required: true },
      { name: 'alt', label: 'Image description (alt text)', kind: 'text', required: true, max: 200 },
      { name: 'focal', label: 'Focal point', kind: 'text', max: 20, help: 'CSS position, e.g. "38% 50%". Defaults to centre.' },
      { name: 'ratio', label: 'Image shape (Home list)', kind: 'select', options: RATIOS },
      { name: 'ratioLg', label: 'Image shape (Services page)', kind: 'select', options: RATIOS },
    ],
  },
  {
    type: 'faq', bundleKey: 'faqs', label: 'FAQs', singular: 'Question', page: '/faqs',
    description: 'The FAQs page. Questions marked "Show on Services" also appear under "Common questions" on Services.',
    titleField: 'question',
    fields: [
      { name: 'question', label: 'Question', kind: 'text', required: true, max: 160 },
      { name: 'answer', label: 'Answer', kind: 'textarea', required: true, max: 1500 },
      { name: 'status', label: 'Approval', kind: 'select', options: FAQ_STATUS, help: '"Awaiting client approval" shows a note while content flags are on.' },
      { name: 'onServices', label: 'Show on Services page', kind: 'select', options: YES_NO },
    ],
  },
  {
    type: 'value-point', bundleKey: 'valuePoints', label: 'How it works (Home)', singular: 'Point', page: '/',
    description: '"Practical care for the garden you already have." on Home.',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { name: 'body', label: 'Text', kind: 'textarea', required: true, max: 300 },
    ],
  },
  {
    type: 'cta-step', bundleKey: 'ctaSteps', label: 'Quote checklist (Home)', singular: 'Item', page: '/',
    description: 'The numbered list in "Tell us about your outdoor space." on Home.',
    titleField: 'text',
    fields: [{ name: 'text', label: 'Text', kind: 'text', required: true, max: 120 }],
  },
  {
    type: 'process-step', bundleKey: 'steps', label: 'Enquiry steps (About)', singular: 'Step', page: '/about',
    description: '"How an enquiry works" on About.',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
      { name: 'body', label: 'Text', kind: 'textarea', required: true, max: 300 },
    ],
  },
  {
    type: 'guidance', bundleKey: 'guidance', label: 'Quote tips (Contact)', singular: 'Tip', page: '/contact',
    description: '"What helps us review your request" beside the quote form.',
    titleField: 'text',
    fields: [{ name: 'text', label: 'Text', kind: 'text', required: true, max: 160 }],
  },
  {
    type: 'before-after', bundleKey: 'beforeAfter', label: 'Before & after', singular: 'Comparison', page: '/our-work',
    description: 'The before/after pair on Our Work. The first published entry is shown.',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Heading', kind: 'text', required: true, max: 120 },
      { name: 'body', label: 'Description', kind: 'textarea', required: true, max: 300 },
      { name: 'beforeImage', label: 'Before image', kind: 'image', required: true },
      { name: 'beforeAlt', label: 'Before — image description', kind: 'text', required: true, max: 240 },
      { name: 'beforeCaption', label: 'Before — caption', kind: 'text', max: 160 },
      { name: 'afterImage', label: 'After image', kind: 'image', required: true },
      { name: 'afterAlt', label: 'After — image description', kind: 'text', required: true, max: 240 },
      { name: 'afterCaption', label: 'After — caption', kind: 'text', max: 160 },
    ],
  },
];

export const schemaFor = (type: string) => CONTENT_SCHEMAS.find((s) => s.type === type);
