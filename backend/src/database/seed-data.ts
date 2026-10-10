/** Launch content copied verbatim from design-source/Chandler Landscaping.dc.html. */
const img = (n: string) => `/assets/${n}.webp`;

/** Bracketed "[Confirmed …]" placeholders from the comp are left blank — the site shows "awaiting confirmation" until filled. */
export const SEED_SERVICES = [
  {
    key: 'lawn',
    fields: {
      title: 'Landscaping & lawn maintenance', tag: 'Lawn', ratio: '1/1', ratioLg: '4/5', image: img('service-lawn'), focal: '38% 50%',
      alt: 'Lawn being mowed into neat stripes in front of a house with planted beds',
      short: 'Ongoing care that keeps lawns and planted areas tidy through the season.',
      body: 'For homeowners who want the lawn and beds kept in order without managing every detail themselves. Tell us roughly how large the space is and how often you’d like it looked after.',
      includes: '', notes: '',
    },
  },
  {
    key: 'cleanup',
    fields: {
      title: 'Garden cleanup', tag: 'Cleanup', ratio: '1/1', ratioLg: '5/4', image: img('cleanup-after'), focal: '50% 50%',
      alt: 'Back garden after a cleanup: ivy trimmed flat, paving cleared and lawn cut',
      short: 'A reset for overgrown or end-of-season gardens — clearing and tidying beds and borders.',
      body: 'Useful before a sale, after a busy season, or when a garden has got away from you. Photos of the current state help a lot here, as does any date you’re working towards.',
      includes: '', notes: '',
    },
  },
  {
    key: 'hedge',
    fields: {
      title: 'Hedge trimming', tag: 'Hedges', ratio: '1/1', ratioLg: '4/5', image: img('service-pruning'), focal: '50% 45%',
      alt: 'Gloved hands pruning a flowering shrub with secateurs',
      short: 'Shaping and tidying hedges and shrubs so boundaries look neat and even.',
      body: 'For boundary hedges, shrubs and screening plants that need shaping or bringing back under control. Let us know the approximate length and height, and whether access is from both sides.',
      includes: '', notes: '',
    },
  },
];

const A = 'Approved', W = 'Awaiting client approval';
export const SEED_FAQS = [
  { question: 'Which services are available?', answer: 'Landscaping and lawn maintenance, garden cleanup, and hedge trimming — see the Services page for details. If you’re not sure your job fits, choose “Not sure yet” on the quote form and describe it.', status: W, onServices: 'No' },
  { question: 'Which locations do you serve?', answer: '[Client-approved service area]', status: W, onServices: 'No' },
  { question: 'How can I request a quote?', answer: 'Use the Request a Quote form, call +1 (617) 722-6832, or email beau.chandler@yahoo.com.', status: A, onServices: 'No' },
  { question: 'What information should I provide?', answer: 'Your name, phone number, email and property location, plus a short description of the work: roughly how big the area is, its current condition, and anything about access.', status: A, onServices: 'Yes' },
  { question: 'Can I share photographs of my garden?', answer: 'Yes. You can attach up to 5 photos (JPEG, PNG or WebP, up to 10 MB each) to your quote request.', status: A, onServices: 'Yes' },
  { question: 'Can I request a preferred date?', answer: 'Yes, there’s an optional preferred-date field on the form. It helps with planning but isn’t a booking — any date is confirmed with you directly.', status: A, onServices: 'Yes' },
  { question: 'How will you follow up?', answer: '[Client-approved follow-up method]', status: W, onServices: 'No' },
  { question: 'What happens after I submit an enquiry?', answer: 'Your request is saved and you’ll see a reference number on screen. [Client-approved next-step wording]', status: W, onServices: 'No' },
].map((fields) => ({ fields }));

export const SEED_VALUE_POINTS = [
  { title: 'Start with your space', body: 'Every garden is different. Describe the area, its current condition and what you’d like done.' },
  { title: 'Choose a service — or don’t', body: 'Pick a listed service, or select “Not sure yet” and explain the job in your own words.' },
  { title: 'Photos help', body: 'Attach a few pictures with your request so the work is easier to understand.' },
].map((fields) => ({ fields }));

export const SEED_CTA_STEPS = ['The service you need, or “not sure yet”', 'Where the property is', 'Details and photos of the space'].map((text) => ({ fields: { text } }));

export const SEED_STEPS = [
  { title: 'Choose or describe the service', body: 'Pick from the services listed, or describe the job if you’re not sure what it’s called.' },
  { title: 'Share property and project details', body: 'Location, the condition of the space, and photos if you have them.' },
  { title: 'Submit for follow-up', body: 'Your enquiry is saved with a reference number and reviewed by the business.' },
].map((fields) => ({ fields }));

export const SEED_GUIDANCE = [
  'The service you think you need — or “Not sure yet”',
  'Where the property is',
  'A short description of the space and the job',
  'A few photos, if you have them',
].map((text) => ({ fields: { text } }));

export const SEED_BEFORE_AFTER = [
  {
    fields: {
      title: 'An overgrown back garden, cleared.',
      body: 'The same garden, photographed from the same spot before and after a cleanup.',
      beforeImage: img('cleanup-before'),
      beforeAlt: 'Before: narrow back garden overgrown with ivy, weeds and long grass, with weeds pushing through the paving',
      beforeCaption: 'Ivy, weeds and long grass covering the path and paving.',
      afterImage: img('cleanup-after'),
      afterAlt: 'After: the same garden with the ivy wall trimmed flat, weeds cleared, paving visible and the lawn cut short',
      afterCaption: 'Ivy trimmed back, beds and paving cleared, lawn cut.',
    },
  },
];

export const SEED_GALLERY = [
  { title: 'Front lawn and flower beds', category: 'lawn', imageUrl: img('hero-garden'), focal: '50% 60%', size: 'large' as const, alt: 'Striped front lawn curving around flowering beds toward a grey house with a porch' },
  { title: 'Back garden after cleanup', category: 'cleanup', imageUrl: img('cleanup-after'), focal: '50% 50%', size: 'large' as const, alt: 'Narrow back garden after a cleanup, with trimmed ivy wall, cleared paving and cut lawn' },
  { title: 'Shaded back lawn', category: 'lawn', imageUrl: img('garden-backyard'), focal: '50% 55%', size: 'wide' as const, alt: 'Back lawn under two large trees with a stone path to a brick cottage porch' },
  { title: 'Shrub pruning', category: 'hedge', imageUrl: img('service-pruning'), focal: '50% 45%', size: 'standard' as const, alt: 'Gloved hands pruning a flowering shrub with secateurs' },
  { title: 'Lawn mowing', category: 'lawn', imageUrl: img('service-lawn'), focal: '40% 50%', size: 'standard' as const, alt: 'Lawn mowed into neat stripes in front of a beige house' },
];

/** Contact details exactly as supplied in the comp. Client-approved copy slots start empty (placeholders shown). */
export const SEED_SETTINGS = {
  businessName: 'Chandler Landscaping',
  contactName: 'Beau Chandler',
  phone: '+1 (617) 722-6832',
  email: 'beau.chandler@yahoo.com',
  addressLine1: '1000 5th Ave',
  addressLine2: 'New York, NY 10028',
  cityLabel: 'New York, NY',
  aboutIntro: null,
  aboutStory: null,
  aboutImage: null,
  successMessage: null,
  notifyEmail: 'beau.chandler@yahoo.com',
  showContentFlags: true,
  mobileQuoteBar: true,
};
