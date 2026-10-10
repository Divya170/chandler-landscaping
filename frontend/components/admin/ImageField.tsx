'use client';

import { useState } from 'react';
import { adminApi, ApiError } from '@/lib/api-client';

/**
 * Upload to /api/admin/media and store the returned URL.
 * kind="image": JPG/PNG/WebP (≤10 MB). kind="document": PDF (≤10 MB).
 */
export function ImageField({ id, label, value, onChange, error, required, kind = 'image' }: {
  id: string; label: string; value: string; onChange: (url: string) => void; error?: string; required?: boolean; kind?: 'image' | 'document';
}) {
  const [busy, setBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const isDoc = kind === 'document';
  const accept = isDoc ? 'application/pdf,.pdf' : 'image/jpeg,image/png,image/webp';

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const okType = isDoc ? /\.pdf$/i.test(file.name) : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!okType) { setUploadErr(isDoc ? 'Choose a PDF file.' : 'Choose a JPG, PNG or WebP image.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadErr('Files must be 10 MB or smaller.'); return; }
    setBusy(true); setUploadErr('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await adminApi<{ url: string }>(`/admin/media?kind=${kind}`, { method: 'POST', body: fd });
      onChange(res.url);
    } catch (ex) {
      const a = ex as ApiError;
      setUploadErr(a.errors.file || a.message);
    } finally {
      setBusy(false);
    }
  };

  const err = uploadErr || error;
  return (
    <div>
      <p className="admin-label">{label}{required ? '' : ' (optional)'}</p>
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div className="img-frame" style={{ width: 120, height: 90, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {value && !isDoc
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt="" />
            : <span className="mono" style={{ fontSize: 12, color: 'var(--grey)' }}>{isDoc ? (value ? 'PDF ✓' : 'No file') : 'No image'}</span>}
        </div>
        <div className="stack" style={{ gap: 6, flex: 1, minWidth: 180 }}>
          <label className="small-btn" style={{ alignSelf: 'flex-start', cursor: busy ? 'progress' : 'pointer' }}>
            {busy ? <><span className="spinner" aria-hidden="true" /> Uploading…</> : value ? `Replace ${isDoc ? 'file' : 'image'}` : `Upload ${isDoc ? 'PDF' : 'image'}`}
            <input type="file" accept={accept} onChange={upload} disabled={busy} className="sr-only" aria-describedby={`${id}-err`} />
          </label>
          <input id={id} className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={isDoc ? '/media/….pdf' : '/media/… or /assets/…'} aria-label={`${label} URL`} aria-invalid={!!err} style={{ fontSize: 13 }} />
          {isDoc && value && <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>Open file ↗</a>}
        </div>
      </div>
      {err && <p id={`${id}-err`} className="field-error">{err}</p>}
    </div>
  );
}
