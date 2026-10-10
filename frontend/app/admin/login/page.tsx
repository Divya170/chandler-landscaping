'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError, tokenStore } from '@/lib/api-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).has('expired'));
    if (tokenStore.get()) {
      api('/admin/auth/me', { auth: true }).then(() => router.replace('/admin/enquiries')).catch(() => tokenStore.clear());
    }
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Please enter your email address.';
    if (!password) errs.password = 'Please enter your password.';
    setErrors(errs);
    setMessage('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await api<{ token: string }>('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      tokenStore.set(res.token);
      router.replace('/admin/enquiries');
    } catch (ex) {
      const a = ex as ApiError;
      setErrors(a.errors);
      setMessage(Object.keys(a.errors).length ? '' : a.message);
      setBusy(false);
    }
  };

  return (
    <main id="main" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--page)' }}>
      <form onSubmit={submit} noValidate className="form-card stack" style={{ width: 'min(420px, 100%)', padding: 'clamp(24px,4vw,40px)', gap: 18 }}>
        <div className="brand" style={{ marginBottom: 4 }}>
          <span className="leaf" aria-hidden="true" /><span className="words"><span className="brand-name">Chandler</span><span className="brand-sub">Landscaping</span></span>
        </div>
        <h1 id="main-h" className="admin-h1" style={{ fontSize: 34 }}>Admin sign in</h1>
        {expired && !message && <div className="alert-ok">Your session ended. Please sign in again.</div>}
        <div aria-live="assertive">{message && <div role="alert" className="alert">{message}</div>}</div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby="email-err" />
          {errors.email && <p id="email-err" className="field-error">⚠ {errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby="password-err" />
          {errors.password && <p id="password-err" className="field-error">⚠ {errors.password}</p>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy} style={{ justifyContent: 'center' }}>
          {busy && <span className="spinner" aria-hidden="true" />}{busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a href="/" style={{ fontSize: 14 }}>← Back to the website</a>
      </form>
    </main>
  );
}
