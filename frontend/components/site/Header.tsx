'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { PublicSettings } from '@/lib/types';
import { Brand } from './Brand';
import { isCurrent, NAV } from './nav';

/** Sticky header: desktop nav ≥900px; below that a Menu button opens a full-height panel with a focus trap. */
export function Header({ settings }: { settings: PublicSettings }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const trigRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) setTimeout(() => trigRef.current?.focus(), 0);
  };

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const t = setTimeout(() => menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus(), 20);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    const onResize = () => { if (window.innerWidth >= 900) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  const trap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !menuRef.current) return;
    const els = [trigRef.current, ...Array.from(menuRef.current.querySelectorAll<HTMLElement>('a,button'))].filter(Boolean) as HTMLElement[];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); els[els.length - 1].focus(); }
    else if (!e.shiftKey && i === els.length - 1) { e.preventDefault(); els[0].focus(); }
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to main content</a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Brand name={settings.businessName} />
          <div className="nav-desktop">
            <nav aria-label="Primary">
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}><Link href={n.href} className="nav-link" aria-current={isCurrent(pathname, n.href) ? 'page' : undefined}>{n.label}</Link></li>
                ))}
              </ul>
            </nav>
            <Link href="/contact" className="btn btn-primary nav-cta" aria-current={pathname === '/contact' ? 'page' : undefined}>Request a Quote</Link>
          </div>
          <button ref={trigRef} type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => (open ? close(true) : setOpen(true))}>
            <span>{open ? 'Close' : 'Menu'}</span>
            <span aria-hidden="true" className="bars"><span /><span /><span /></span>
          </button>
        </div>
      </header>
      {open && (
        <div id="mobile-menu" ref={menuRef} className="mobile-menu" onKeyDown={trap}>
          <nav aria-label="Mobile">
            <ul>
              {NAV.map((n) => {
                const cur = isCurrent(pathname, n.href);
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={cur ? 'page' : undefined}><span>{n.label}</span><span className="mark">{cur ? 'Current' : ''}</span></Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link href="/contact" className="btn btn-primary">Request a Quote</Link>
          <div className="stack" style={{ gap: 10, fontSize: 15 }}>
            {settings.phone && settings.phoneHref && <a href={settings.phoneHref} style={{ fontWeight: 500 }}>{settings.phone}</a>}
            {settings.email && <a href={`mailto:${settings.email}`} style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{settings.email}</a>}
          </div>
        </div>
      )}
    </>
  );
}
