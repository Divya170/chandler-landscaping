import { FieldErrors, str } from '../common/errors';

/**
 * Quote-form rules copied verbatim from the design comp (Component.validate) — the source of truth.
 * frontend/lib/validation.ts mirrors these for instant feedback.
 */
export const LABELS = {
  name: 'Full name', phone: 'Phone number', email: 'Email address', location: 'Property location',
  date: 'Preferred date', details: 'Project details', consent: 'Agreement',
};
export const MAX_PHOTOS = 5;
export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const emailOk = (v: string) => EMAIL_RE.test(v.trim());

/** Today as YYYY-MM-DD, one day of grace so a visitor's "today" is accepted from any time zone. */
const earliestDate = () => new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);

export interface QuoteInput {
  name: string; phone: string; email: string; service: string | null; location: string;
  preferredDate: string | null; details: string | null;
}

export function validateQuote(body: Record<string, unknown>, serviceIds: string[]): { errors: FieldErrors; data: QuoteInput } {
  const e: FieldErrors = {};
  const v = (k: string) => str(body[k]).trim();
  const name = v('name'), phone = v('phone'), email = v('email'), service = v('service'), location = v('location'), date = v('date');
  const details = v('details');
  const consent = body.consent === true || body.consent === 'true' || body.consent === 'on';

  if (!name) e.name = 'Enter your full name.';
  else if (name.length < 2) e.name = 'Name looks too short.';
  else if (name.length > 120) e.name = 'Keep your name under 120 characters.';

  if (!phone) e.phone = 'Enter a phone number we can reach you on.';
  else if (!/^[\d\s()+.\-]+$/.test(phone)) e.phone = 'Use only digits, spaces, brackets, + or -.';
  else {
    const d = phone.replace(/\D/g, '').length;
    if (d < 7 || d > 15 || phone.length > 30) e.phone = 'Check the number — it should have 7 to 15 digits.';
  }

  if (!email) e.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(email) || email.length > 200) e.email = 'Enter an email in the format name@example.com.';

  if (service && service !== 'unsure' && !serviceIds.includes(service)) e.service = 'Choose a service from the list, or “Not sure yet”.';

  if (!location) e.location = 'Enter the property address, or neighborhood and ZIP code.';
  else if (location.length > 200) e.location = 'Keep the location under 200 characters.';

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) e.date = 'Enter a valid date.';
    else if (date < earliestDate()) e.date = 'Choose today or a future date.';
  }

  if (details.length > 1000) e.details = 'Keep the description under 1,000 characters.';
  if (!consent) e.consent = 'Please confirm so we can use your details to reply.';

  return {
    errors: e,
    data: {
      name, phone, email: email.toLowerCase(), service: service && service !== 'unsure' ? service : null,
      location, preferredDate: date || null, details: details || null,
    },
  };
}
