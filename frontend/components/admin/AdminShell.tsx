'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '@/lib/api-client';

const NAV = [
  { href: '/admin/enquiries', label: 'Quote requests' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/content', label: 'Site content' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/account', label: 'Account' },
];

interface Toast { text: string; kind: 'ok' | 'err'; link?: { href: string; label: string } }
const ToastCtx = createContext<(t: Toast) => void>(() => {});
/** Show a short confirmation (or error) after an admin action. */
export const useToast = () => useContext(ToastCtx);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) { router.replace('/admin/login'); return; }
    api<{ name: string; email: string }>('/admin/auth/me', { auth: true })
      .then(setAdmin)
      .catch(() => { tokenStore.clear(); router.replace('/admin/login?expired=1'); });
  }, [router]);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const show = useCallback((t: Toast) => setToast(t), []);
  const signOut = () => { tokenStore.clear(); router.replace('/admin/login'); };

  if (!admin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--forest)' }} aria-busy="true">
        <span className="spinner" aria-hidden="true" /> Checking your session…
      </div>
    );
  }

  return (
    <ToastCtx.Provider value={show}>
      <div className="admin-shell">
        <div className="admin-top">
          <span className="brand"><span className="leaf" aria-hidden="true" style={{ background: "var(--sage)" }} /><span className="brand-name" style={{ fontSize: 24 }}>Chandler</span></span>
          <button type="button" className="menu-btn" aria-expanded={menu} aria-controls="admin-side" onClick={() => setMenu((m) => !m)}>{menu ? 'Close' : 'Menu'}</button>
        </div>
        <aside id="admin-side" className={`admin-side${menu ? ' open' : ''}`}>
          <Link href="/admin/enquiries" className="brand">
            <span className="leaf" aria-hidden="true" style={{ background: "var(--sage)" }} /><span className="brand-name" style={{ fontSize: 26 }}>Chandler</span>
            <span className="brand-sub">ADMIN</span>
          </Link>
          <nav aria-label="Admin">
            <ul className="admin-nav">
              {NAV.map((n) => (
                <li key={n.href}><Link href={n.href} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="stack" style={{ marginTop: 'auto', gap: 8, fontSize: 14 }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: '#E4E7DD' }}>View website ↗</a>
            <span style={{ color: 'var(--sage-light)', wordBreak: 'break-all' }}>{admin.email}</span>
            <button type="button" onClick={signOut} className="small-btn" style={{ alignSelf: 'flex-start' }}>Sign out</button>
          </div>
        </aside>
        <main id="main" className="admin-main">{children}</main>
      </div>
      {toast && (
        <div role="status" className={`toast${toast.kind === 'err' ? ' err' : ''}`}>
          <span>{toast.text}</span>
          {toast.link && <a href={toast.link.href} target="_blank" rel="noopener noreferrer">{toast.link.label}</a>}
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}
    </ToastCtx.Provider>
  );
}
