'use client';

import { useState } from 'react';
import { adminApi, ApiError } from '@/lib/api-client';

export default function AdminAccountPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.currentPassword = 'Please enter your current password.';
    if (next.length < 10) errs.newPassword = 'Use at least 10 characters.';
    if (next !== confirm) errs.confirm = 'The two new passwords don’t match.';
    setErrors(errs); setMessage('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await adminApi('/admin/auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      setDone(true); setCurrent(''); setNext(''); setConfirm('');
    } catch (ex) {
      const a = ex as ApiError;
      setErrors(a.errors);
      if (!Object.keys(a.errors).length) setMessage(a.message);
    } finally { setBusy(false); }
  };

  return (
    <>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Admin</p>
      <h1 id="main-h" tabIndex={-1} className="admin-h1" style={{ marginBottom: 20 }}>Account</h1>
      {done ? (
        <div className="success-card" role="status" style={{ maxWidth: 520 }}>
          <h2 className="serif" style={{ fontSize: 30, color: 'var(--forest)' }}>Password updated.</h2>
          <p className="muted">Use your new password next time you sign in.</p>
          <div className="row" style={{ gap: 8 }}>
            <a href="/admin/enquiries" className="small-btn primary">Back to enquiries</a>
            <button type="button" className="small-btn" onClick={() => setDone(false)}>Change it again</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="panel stack" style={{ padding: 20, gap: 16, maxWidth: 520 }}>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--forest)' }}>Change password</h2>
          {message && <div role="alert" className="alert">{message}</div>}
          {([['currentPassword', 'Current password', current, setCurrent, 'current-password'], ['newPassword', 'New password', next, setNext, 'new-password'], ['confirm', 'Confirm new password', confirm, setConfirm, 'new-password']] as const).map(([k, label, v, set, ac]) => (
            <div key={k}>
              <label htmlFor={`p-${k}`} className="admin-label">{label}</label>
              <input id={`p-${k}`} type="password" autoComplete={ac} className="admin-input" value={v} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[k]} />
              {errors[k] && <p className="field-error">⚠ {errors[k]}</p>}
            </div>
          ))}
          <button type="submit" className="small-btn primary" style={{ minHeight: 44, alignSelf: 'flex-start' }} disabled={busy}>
            {busy && <span className="spinner" aria-hidden="true" />}{busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </>
  );
}
