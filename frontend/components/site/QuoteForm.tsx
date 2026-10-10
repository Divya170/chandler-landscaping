'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ApiError, postWithProgress } from '@/lib/api-client';
import type { FormOptions, PublicSettings } from '@/lib/types';
import { blankForm, FIELDS, fmtSize, type QuoteForm as QF, todayISO, validate } from '@/lib/validation';

type Key = keyof QF;
interface Pic { key: string; file: File; url: string }

/** Status messages verbatim from the comp. */
const STATUS = {
  network: { title: 'We couldn’t send your request', msg: 'This looks like a connection problem. Your details are still here — please try again.' },
  rate: { title: 'Too many attempts in a short time', msg: 'Please wait a minute, then submit again. Your details have been kept.' },
  upload: { title: 'A photo couldn’t be uploaded', msg: 'Remove the photos and try again, or submit without them. Everything else you entered is still here.' },
  server: { title: 'We couldn’t send your request', msg: 'Something went wrong on our side. Your details are still here — please try again.' },
  check: { title: 'Please check your details', msg: 'Some of the information couldn’t be accepted. Correct the highlighted fields and submit again.' },
};
type StatusKey = keyof typeof STATUS;

export function QuoteForm({ options, settings, initialService }: { options: FormOptions; settings: PublicSettings; initialService?: string }) {
  const pre = initialService && options.services.some((s) => s.id === initialService) ? initialService : '';
  const [form, setForm] = useState<QF>({ ...blankForm(), service: pre });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [pics, setPics] = useState<Pic[]>([]);
  const [fileErr, setFileErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<StatusKey | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [live, setLive] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const sumRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLDivElement>(null);
  const picsRef = useRef<Pic[]>([]);
  picsRef.current = pics;
  useEffect(() => () => picsRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const { max, maxMb, types } = options.photos;
  const labels = options.labels;
  const today = todayISO();

  const setField = (k: Key, val: string | boolean) => {
    const next = { ...form, [k]: val } as QF;
    setForm(next);
    setErrors((e) => (touched[k] || attempted || e[k] ? { ...e, [k]: validate(k, next) } : e));
  };
  const blur = (k: Key) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validate(k, form) }));
  };
  const onConsent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.checked;
    setForm((f) => ({ ...f, consent: c }));
    setErrors((x) => ({ ...x, consent: attempted ? validate('consent', { ...form, consent: c }) : '' }));
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list: File[] = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [...pics];
    const bad: string[] = [];
    for (const f of list) {
      if (next.length >= max) { bad.push(`${f.name} — limit of ${max} photos reached`); continue; }
      if (!types.includes(f.type)) { bad.push(`${f.name} — only JPEG, PNG or WebP`); continue; }
      if (f.size > maxMb * 1048576) { bad.push(`${f.name} — larger than ${maxMb} MB`); continue; }
      next.push({ key: Math.random().toString(36).slice(2), file: f, url: URL.createObjectURL(f) });
    }
    setPics(next);
    setFileErr(bad.join('; '));
    setLive(`${next.length - pics.length} photo(s) added.${bad.length ? ' Some files were not added.' : ''}`);
  };
  const removePic = (key: string) => {
    setPics((p) => { const hit = p.find((x) => x.key === key); if (hit) URL.revokeObjectURL(hit.url); return p.filter((x) => x.key !== key); });
    setFileErr('');
    setLive('Photo removed.');
  };

  const focusLater = (el: React.RefObject<HTMLElement>) => setTimeout(() => el.current?.focus(), 30);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs: Record<string, string> = {};
    FIELDS.forEach((k) => { const m = validate(k, form); if (m) errs[k] = m; });
    setAttempted(true);
    if (Object.keys(errs).length) { setErrors(errs); setStatus(null); focusLater(sumRef); return; }

    setErrors({}); setStatus(null); setSubmitting(true); setProgress(0); setLive('Submitting your quote request…');
    const fd = new FormData();
    (['name', 'phone', 'email', 'service', 'location', 'date', 'details', 'website'] as const).forEach((k) => fd.append(k, form[k]));
    fd.append('consent', form.consent ? 'true' : 'false');
    pics.forEach((p) => fd.append('photos', p.file, p.file.name));
    try {
      const res = await postWithProgress<{ ok: boolean; reference: string }>('/quote-requests', fd, setProgress);
      setSubmitted(res.reference || '—');
      setLive(`Quote request submitted. Reference ${res.reference}.`);
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusLater(okRef);
    } catch (ex) {
      const a = ex as ApiError;
      let key: StatusKey;
      if (a.status === 400 && Object.keys(a.errors).length) {
        const { photos, ...fieldErrs } = a.errors;
        if (photos) setFileErr(photos);
        setErrors(fieldErrs);
        key = photos && !Object.keys(fieldErrs).length ? 'upload' : 'check';
      } else if (a.status === 413) { key = 'upload'; setFileErr(a.message); }
      else if (a.status === 429) key = 'rate';
      else if (a.status === 0) key = 'network';
      else key = 'server';
      setStatus(key);
      setProgress(0);
      setLive(STATUS[key].title);
      focusLater(statusRef);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    pics.forEach((p) => URL.revokeObjectURL(p.url));
    setForm(blankForm()); setTouched({}); setErrors({}); setAttempted(false); setPics([]); setFileErr(''); setStatus(null); setSubmitted(null); setProgress(0);
  };

  const liveRegion = <div aria-live="polite" role="status" className="sr-only">{live}</div>;

  if (submitted) {
    return (
      <>
        {liveRegion}
        <div ref={okRef} tabIndex={-1} role="status" className="success-card">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Request received</p>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,3vw,38px)', lineHeight: 1.12, color: 'var(--green)' }}>
            Thank you for contacting {settings.businessName}. Your quote request has been submitted.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>Reference: <strong>{submitted}</strong></p>
          {settings.successMessage
            ? <p style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{settings.successMessage}</p>
            : settings.showContentFlags && <p className="flag-box">[Client-approved next-step wording]</p>}
          <div className="row" style={{ gap: 12, paddingTop: 8 }}>
            <Link href="/" className="btn btn-primary btn-sm">Back to home</Link>
            <Link href="/services" className="btn btn-outline btn-sm">Explore services</Link>
            <button type="button" className="link-btn" onClick={reset}>Submit another request</button>
          </div>
        </div>
      </>
    );
  }

  const summary = attempted && !status ? FIELDS.filter((k) => errors[k]) : [];
  const fieldProps = (k: Key, describedBy: string[] = []) => ({
    id: `f-${k}`, name: k, className: 'input',
    value: String(form[k] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(k, e.target.value),
    onBlur: blur(k),
    'aria-invalid': errors[k] ? true : false,
    'aria-describedby': [...describedBy, `f-${k}-err`].join(' '),
  });
  const err = (k: string) => (errors[k] ? <p id={`f-${k}-err`} className="field-error">Error: {errors[k]}</p> : null);
  const req = <span className="opt">(required)</span>;
  const opt = <span className="opt">(optional)</span>;

  return (
    <>
      {liveRegion}
      <form onSubmit={submit} noValidate aria-describedby="form-req-note" className="stack" style={{ gap: 24 }}>
        <p id="form-req-note" className="muted" style={{ fontSize: 14 }}>Fields marked “required” must be completed. Everything else is optional.</p>

        {summary.length > 0 && (
          <div ref={sumRef} tabIndex={-1} role="alert" aria-labelledby="sum-h" className="alert-box">
            <h2 id="sum-h">Please check {summary.length === 1 ? 'one field' : `${summary.length} fields`}</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {summary.map((k) => (
                <li key={k}><button type="button" className="err-link" onClick={() => document.getElementById(`f-${k}`)?.focus()}>{labels[k] || k}: {errors[k]}</button></li>
              ))}
            </ul>
          </div>
        )}

        {status && (
          <div ref={statusRef} tabIndex={-1} role="alert" className="alert-box">
            <h2>{STATUS[status].title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.55 }}>{STATUS[status].msg}</p>
            {(settings.phone || settings.email) && (
              <p style={{ fontSize: 15 }}>
                Prefer to talk?{' '}
                {settings.phone && settings.phoneHref && <>Call <a href={settings.phoneHref} style={{ fontWeight: 500 }}>{settings.phone}</a></>}
                {settings.phone && settings.email && ' or '}
                {settings.email && <>email <a href={`mailto:${settings.email}`} style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{settings.email}</a></>}.
              </p>
            )}
          </div>
        )}

        <fieldset style={{ margin: 0, padding: 0, border: 0 }} className="stack">
          <legend className="legend">Your details</legend>
          <div className="stack" style={{ gap: 20 }}>
            <div className="field">
              <label htmlFor="f-name" className="label">Full name {req}</label>
              <input type="text" autoComplete="name" maxLength={120} {...fieldProps('name')} />
              {err('name')}
            </div>
            <div className="pair-fields">
              <div className="field">
                <label htmlFor="f-phone" className="label">Phone number {req}</label>
                <input type="tel" inputMode="tel" autoComplete="tel" maxLength={30} {...fieldProps('phone')} />
                {err('phone')}
              </div>
              <div className="field">
                <label htmlFor="f-email" className="label">Email address {req}</label>
                <input type="email" autoComplete="email" maxLength={200} {...fieldProps('email')} />
                {err('email')}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset style={{ margin: 0, padding: '24px 0 0', border: 0, borderTop: '1px solid var(--rule)' }} className="stack">
          <legend className="legend" style={{ paddingTop: 24, float: 'left', width: '100%' }}>Your project</legend>
          <div className="stack" style={{ gap: 20, clear: 'both' }}>
            <div className="pair-fields">
              <div className="field">
                <label htmlFor="f-service" className="label">Service {opt}</label>
                <select {...fieldProps('service')}>
                  <option value="">{options.unsure.title}</option>
                  {options.services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                {err('service')}
              </div>
              <div className="field">
                <label htmlFor="f-date" className="label">Preferred date {opt}</label>
                <input type="date" min={today} {...fieldProps('date', ['f-date-hint'])} />
                <p id="f-date-hint" className="help">Helps us plan — it isn’t a booking.</p>
                {err('date')}
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-location" className="label">Property location {req}</label>
              <input type="text" autoComplete="street-address" maxLength={200} {...fieldProps('location', ['f-location-hint'])} />
              <p id="f-location-hint" className="help">Street address, or neighborhood and ZIP code.</p>
              {err('location')}
            </div>
            <div className="field">
              <label htmlFor="f-details" className="label">Project details {opt}</label>
              <p id="f-details-hint" className="help">What needs doing, the current condition of the garden, roughly how big the area is, and anything about access.</p>
              <textarea rows={6} maxLength={1000} {...fieldProps('details', ['f-details-hint', 'f-details-count'])} />
              <p id="f-details-count" className="help" style={{ textAlign: 'right' }}>{form.details.length.toLocaleString('en-US')} / 1,000</p>
              {err('details')}
            </div>

            <div className="stack" style={{ gap: 10 }}>
              <span id="f-photos-label" className="label">Photos {opt}</span>
              <p id="f-photos-hint" className="help">Up to {max} images · JPEG, PNG or WebP · {maxMb} MB each</p>
              <input ref={fileRef} id="f-photos" type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onFiles} tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />
              <div>
                <button type="button" className="add-photos" onClick={() => fileRef.current?.click()} aria-describedby="f-photos-label f-photos-hint" disabled={pics.length >= max || submitting}>
                  <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>+</span>Add photos
                </button>
              </div>
              {fileErr && <p role="alert" className="field-error">Upload error: {fileErr}</p>}
              {pics.length > 0 && (
                <ul aria-label="Selected photos" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pics.map((p) => (
                    <li key={p.key} className="file-row">
                      <span style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" />
                        <span className="stack" style={{ minWidth: 0 }}>
                          <span className="ellipsis" style={{ fontSize: 14, fontWeight: 500 }}>{p.file.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtSize(p.file.size)}</span>
                        </span>
                      </span>
                      <button type="button" onClick={() => removePic(p.key)} disabled={submitting} aria-label={`Remove ${p.file.name}`} className="link-btn" style={{ minHeight: 44, flex: 'none' }}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
              {submitting && pics.length > 0 && (
                <div className="stack" style={{ gap: 6 }}>
                  <span id="up-l" className="help">Uploading photos… {progress}%</span>
                  <div role="progressbar" aria-labelledby="up-l" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="progress"><div style={{ width: `${progress}%` }} /></div>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        <div aria-hidden="true" className="honeypot">
          <label htmlFor="f-website">Leave this field empty</label>
          <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
        </div>

        <div className="stack" style={{ gap: 6, paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
          <label htmlFor="f-consent" className="consent">
            <input id="f-consent" type="checkbox" checked={form.consent} onChange={onConsent} aria-invalid={errors.consent ? true : false} aria-describedby="f-consent-err" />
            <span>I agree that {settings.businessName} may use the details I’ve provided to respond to this enquiry. <span className="muted">(required)</span></span>
          </label>
          {errors.consent && <p id="f-consent-err" className="field-error" style={{ marginLeft: 34 }}>Error: {errors.consent}</p>}
          {settings.hasPrivacyPolicy
            ? <p className="help" style={{ margin: '4px 0 0 34px' }}>Read our <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy<span className="sr-only"> (opens in a new tab)</span></a>.</p>
            : settings.showContentFlags && <p className="help" style={{ margin: '4px 0 0 34px' }}>[Privacy policy link — appears once the policy text is added in Admin → Settings]</p>}
        </div>

        <div className="row" style={{ alignItems: 'center', gap: 16 }}>
          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting} aria-busy={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}{submitting ? 'Submitting…' : 'Submit Quote Request'}
          </button>
        </div>
      </form>
    </>
  );
}
