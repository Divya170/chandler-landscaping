/**
 * Client-side mirror of backend/src/inquiries/inquiry.validation.ts (copied from the comp's
 * Component.validate) — for instant feedback only. The NestJS API re-validates everything.
 */
export const FIELDS = ['name', 'phone', 'email', 'location', 'date', 'details', 'consent'] as const;

export interface QuoteForm {
  name: string; phone: string; email: string; service: string; location: string; date: string; details: string; website: string; consent: boolean;
}
export const blankForm = (): QuoteForm => ({ name: '', phone: '', email: '', service: '', location: '', date: '', details: '', website: '', consent: false });

/** Local "today" as YYYY-MM-DD (matches the date input). */
export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export function validate(k: string, f: QuoteForm): string {
  const raw = (f as unknown as Record<string, unknown>)[k];
  const v = (raw == null ? '' : String(raw)).trim();
  switch (k) {
    case 'name': return !v ? 'Enter your full name.' : v.length < 2 ? 'Name looks too short.' : '';
    case 'phone': {
      if (!v) return 'Enter a phone number we can reach you on.';
      if (!/^[\d\s()+.\-]+$/.test(v)) return 'Use only digits, spaces, brackets, + or -.';
      const d = v.replace(/\D/g, '').length;
      return d < 7 || d > 15 ? 'Check the number — it should have 7 to 15 digits.' : '';
    }
    case 'email': return !v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email in the format name@example.com.';
    case 'location': return !v ? 'Enter the property address, or neighborhood and ZIP code.' : '';
    case 'date': return v && v < todayISO() ? 'Choose today or a future date.' : '';
    case 'details': return v.length > 1000 ? 'Keep the description under 1,000 characters.' : '';
    case 'consent': return f.consent ? '' : 'Please confirm so we can use your details to reply.';
  }
  return '';
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
