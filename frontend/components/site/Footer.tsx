import Link from 'next/link';
import type { PublicSettings, Service } from '@/lib/types';
import { Brand } from './Brand';
import { NAV } from './nav';

export function Footer({ settings, services }: { settings: PublicSettings; services: Service[] }) {
  return (
    <footer data-dark="" className="site-footer">
      <div className="wrap stack" style={{ paddingTop: 'clamp(56px,7vw,88px)', paddingBottom: 32, gap: 48 }}>
        <div className="foot-grid">
          <div className="stack" style={{ gap: 16, maxWidth: 340 }}>
            <Brand name={settings.businessName} dark />
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>Residential landscaping and garden care for homeowners.</p>
          </div>
          <nav aria-label="Footer" className="stack" style={{ gap: 12 }}>
            <h2 className="foot-h">Website</h2>
            <ul className="foot-links">
              {[...NAV, { label: 'Request a Quote', href: '/contact' }].map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            </ul>
          </nav>
          {services.length > 0 && (
            <div className="stack" style={{ gap: 12 }}>
              <h2 className="foot-h">Services</h2>
              <ul className="foot-links">
                {services.map((s) => <li key={s.id}><Link href={`/services?s=${s.key}`}>{s.title}</Link></li>)}
              </ul>
            </div>
          )}
          <div className="stack" style={{ gap: 12 }}>
            <h2 className="foot-h">Contact</h2>
            {settings.phone && settings.phoneHref && <a href={settings.phoneHref} style={{ color: 'var(--paper)', fontSize: 15 }}>{settings.phone}</a>}
            {settings.email && <a href={`mailto:${settings.email}`} style={{ color: 'var(--paper)', fontSize: 15, overflowWrap: 'anywhere' }}>{settings.email}</a>}
            {settings.address.length > 0 && (
              <address style={{ fontStyle: 'normal', fontSize: 15, lineHeight: 1.55 }}>{settings.address.map((l, i) => <span key={i}>{l}<br /></span>)}</address>
            )}
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(168,185,154,.35)', fontSize: 13, color: 'var(--sage-2)' }}>
          <span>© {new Date().getFullYear()} {settings.businessName}</span>
          <span className="row" style={{ gap: '4px 20px' }}>
            {settings.hasPrivacyPolicy && <Link href="/privacy" style={{ color: 'var(--paper)' }}>Privacy policy</Link>}
            <Link href="/contact" style={{ color: 'var(--paper)' }}>Request a Quote</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
