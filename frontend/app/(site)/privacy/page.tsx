import type { Metadata } from 'next';
import Link from 'next/link';
import { parsePolicy } from '@/lib/policy';
import { getPrivacyPolicy, getSettings } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Privacy policy' };

export default async function PrivacyPage() {
  const [settings, policy] = await Promise.all([getSettings(), getPrivacyPolicy()]);
  const blocks = policy.text ? parsePolicy(policy.text) : [];
  return (
    <section aria-labelledby="pv-h" style={{ padding: 'clamp(40px,6vw,88px) 0 clamp(56px,7vw,96px)' }}>
      <div className="wrap stack" style={{ gap: 28, maxWidth: 820 }}>
        <p className="eyebrow">Legal</p>
        <h1 id="pv-h" className="h1" style={{ fontSize: 'clamp(36px,4.4vw,56px)' }}>Privacy policy</h1>
        {blocks.length === 0 ? (
          <div className="stack" style={{ gap: 14 }}>
            <p style={{ fontSize: 17, lineHeight: 1.65 }}>Our privacy policy is being finalised and will be published here shortly.</p>
            <p style={{ fontSize: 17, lineHeight: 1.65 }}>
              If you have a question about how your details are used in the meantime, please get in touch
              {settings.phone && settings.phoneHref && <> on <a href={settings.phoneHref}>{settings.phone}</a></>}
              {settings.phone && settings.email && ' or'}
              {settings.email && <> at <a href={`mailto:${settings.email}`} style={{ overflowWrap: 'anywhere' }}>{settings.email}</a></>}.
            </p>
          </div>
        ) : (
          <div className="stack" style={{ gap: 18 }}>
            {blocks.map((b, i) =>
              b.kind === 'h' ? <h2 key={i} className="serif" style={{ fontSize: 'clamp(24px,2.6vw,30px)', lineHeight: 1.15, color: 'var(--green)', marginTop: 12 }}>{b.text}</h2>
              : b.kind === 'ul' ? <ul key={i} style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 17, lineHeight: 1.6 }}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
              : <p key={i} style={{ fontSize: 17, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{b.text}</p>,
            )}
          </div>
        )}
        <p><Link href="/contact" className="btn btn-primary">Request a Quote</Link></p>
      </div>
    </section>
  );
}
