'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/admin/AdminShell';
import { ImageField } from '@/components/admin/ImageField';
import { adminApi, ApiError } from '@/lib/api-client';
import type { AdminSettings } from '@/lib/types';

type Field = { k: keyof AdminSettings; label: string; help?: string; type?: string; area?: boolean; rows?: number };

const DETAILS: Field[] = [
  { k: 'businessName', label: 'Business name' },
  { k: 'contactName', label: 'Point of contact', help: 'Named on Home and About. Leave blank to hide.' },
  { k: 'phone', label: 'Public phone', help: 'Header menu, footer, quote bar, Contact and calls to action. Leave blank to hide.', type: 'tel' },
  { k: 'email', label: 'Public email', type: 'email' },
  { k: 'addressLine1', label: 'Address line 1' },
  { k: 'addressLine2', label: 'Address line 2 (city, state, ZIP)' },
  { k: 'cityLabel', label: 'Area label', help: 'Shown in the Home hero: "Residential outdoor care · New York, NY".' },
  { k: 'notifyEmail', label: 'Notification email', help: 'New quote requests are emailed here once the server has its email (SMTP) details set. Leave blank to switch alerts off.', type: 'email' },
];
const COPY: Field[] = [
  { k: 'aboutIntro', label: 'Business introduction', help: 'A sentence or two in the owner’s own words — Home and About. Leave blank to show the placeholder (while content flags are on).', area: true },
  { k: 'aboutStory', label: 'Business story', help: 'About → "What we look after".', area: true },
  { k: 'successMessage', label: 'Next-step wording after a quote request', help: 'Shown on the "Request received" card, e.g. how and when you’ll follow up.', area: true },
];
const POLICY: Field = {
  k: 'privacyPolicy', label: 'Privacy policy text', rows: 16, area: true,
  help: 'Use the wording the client (or their adviser) has approved. Leave a blank line between paragraphs, start a line with “## ” for a heading and with “- ” for a list item. The /privacy page and its footer and form links appear once this is filled in.',
};
const FLAGS: { k: 'showContentFlags' | 'mobileQuoteBar'; label: string; help: string }[] = [
  { k: 'showContentFlags', label: 'Show content flags', help: 'The dashed "Awaiting client confirmation" and "[Client-approved …]" notes. Turn off before launch.' },
  { k: 'mobileQuoteBar', label: 'Mobile quote bar', help: 'Sticky "Request a Quote" / "Call" bar on phones and small tablets (hidden on the quote page).' },
];
const KEYS = [...DETAILS, ...COPY].map((f) => f.k).concat(['privacyPolicy', 'aboutImage', 'showContentFlags', 'mobileQuoteBar']);

export default function AdminSettingsPage() {
  const toast = useToast();
  const [s, setS] = useState<AdminSettings | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fill = (d: AdminSettings) => setForm(Object.fromEntries(KEYS.map((k) => [k, typeof d[k] === 'boolean' ? (d[k] as boolean) : ((d[k] as string | null) ?? '')])));
  const load = () => {
    setError('');
    adminApi<AdminSettings>('/admin/settings').then((d) => { setS(d); fill(d); }).catch((e: ApiError) => setError(e.message));
  };
  useEffect(load, []);

  const dirty = !!s && KEYS.some((k) => {
    const cur = s[k] ?? '';
    return cur !== form[k];
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErrors({}); setSaved(false);
    try {
      const d = await adminApi<AdminSettings>('/admin/settings', { method: 'PATCH', body: JSON.stringify(form) });
      setS(d); fill(d); setSaved(true);
      toast({ text: 'Settings saved.', kind: 'ok', link: { href: '/', label: 'View website ↗' } });
    } catch (ex) {
      const a = ex as ApiError;
      setErrors(a.errors);
      if (!Object.keys(a.errors).length) toast({ text: a.message, kind: 'err' });
    } finally { setSaving(false); }
  };

  const text = (f: Field) => (
    <div key={f.k}>
      <label htmlFor={`s-${f.k}`} className="admin-label">{f.label}</label>
      {f.area
        ? <textarea id={`s-${f.k}`} rows={f.rows || 4} className="admin-input" value={String(form[f.k] ?? '')} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} aria-invalid={!!errors[f.k]} />
        : <input id={`s-${f.k}`} type={f.type || 'text'} className="admin-input" value={String(form[f.k] ?? '')} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} aria-invalid={!!errors[f.k]} />}
      {f.help && <p className="help" style={{ marginTop: 4 }}>{f.help}</p>}
      {errors[f.k] && <p className="field-error">⚠ {errors[f.k]}</p>}
    </div>
  );

  return (
    <>
      <p className="eyebrow admin">Admin</p>
      <h1 id="main-h" tabIndex={-1} className="admin-h1" style={{ marginBottom: 20 }}>Settings</h1>
      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', gap: 12 }}><span>{error}</span><button type="button" className="small-btn" onClick={load}>Try again</button></div>
      ) : !s ? (
        <div className="stack" style={{ gap: 10, maxWidth: 720 }} aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skel" style={{ height: 56 }} />)}</div>
      ) : (
        <form onSubmit={save} noValidate className="stack" style={{ gap: 24, maxWidth: 760 }}>
          {saved && !dirty && (
            <div className="alert-ok row" role="status" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <span>Your changes are live on the website.</span>
              <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>View website ↗</a>
            </div>
          )}
          <section className="panel stack" style={{ padding: 20, gap: 16 }}>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--green)' }}>Business details</h2>
            {DETAILS.map(text)}
          </section>
          <section className="panel stack" style={{ padding: 20, gap: 16 }}>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--green)' }}>Client-approved copy</h2>
            {COPY.map(text)}
            <ImageField id="s-aboutImage" label="Photo of the owner or team" value={String(form.aboutImage ?? '')} onChange={(url) => setForm({ ...form, aboutImage: url })} error={errors.aboutImage} />
            <p className="help" style={{ marginTop: -8 }}>Home and About show a striped placeholder until an approved photo is added.</p>
          </section>
          <section className="panel stack" style={{ padding: 20, gap: 16 }}>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--green)' }}>Privacy policy</h2>
            {text(POLICY)}
            {s.privacyPolicy && <a href="/privacy" target="_blank" rel="noopener noreferrer" className="help" style={{ fontWeight: 600 }}>View the published page ↗</a>}
          </section>
          <section className="panel stack" style={{ padding: 20, gap: 12 }}>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--green)' }}>Site options</h2>
            {FLAGS.map((f) => (
              <label key={f.k} className="switch">
                <input type="checkbox" checked={!!form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.checked })} />
                <span><strong>{f.label}</strong><br /><span className="help">{f.help}</span></span>
              </label>
            ))}
          </section>
          <div className="row" style={{ gap: 12, alignItems: 'center' }}>
            <button type="submit" className="small-btn primary" style={{ minHeight: 48, padding: '0 24px' }} disabled={saving || !dirty}>
              {saving && <span className="spinner" aria-hidden="true" />}{saving ? 'Saving…' : 'Save settings'}
            </button>
            {dirty && <span className="help">You have unsaved changes.</span>}
          </div>
        </form>
      )}
    </>
  );
}
