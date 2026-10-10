import type { Metadata } from 'next';
import { QuoteForm } from '@/components/site/QuoteForm';
import { getContent, getFormOptions, getSettings } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Request a Quote' };

export default async function ContactPage({ searchParams }: { searchParams: { service?: string } }) {
  const [settings, options, content] = await Promise.all([getSettings(), getFormOptions(), getContent()]);
  return (
    <>
      <section aria-labelledby="ct-h" style={{ padding: 'clamp(40px,6vw,80px) 0 clamp(24px,3vw,40px)' }}>
        <div className="wrap stack" style={{ gap: 20 }}>
          <p className="eyebrow">Request a quote</p>
          <h1 id="ct-h" className="h1" style={{ maxWidth: '14ch' }}>Let’s talk about your outdoor space.</h1>
          <p className="lead" style={{ maxWidth: '56ch' }}>Share what you need and a few details about the property so we can review your enquiry.</p>
        </div>
      </section>
      <section aria-label="Quote request" style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(64px,8vw,112px)' }}>
        <div className="wrap form-grid">
          <div style={{ minWidth: 0 }}>
            <QuoteForm options={options} settings={settings} initialService={searchParams?.service} />
          </div>
          <aside aria-label="Direct contact" className="stack sticky-desk" style={{ gap: 32, top: 104 }}>
            <div className="contact-box">
              <h2 className="serif" style={{ fontSize: 26, color: 'var(--green)' }}>Contact directly</h2>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {settings.phone && settings.phoneHref && <div><dt>Phone</dt><dd><a href={settings.phoneHref} style={{ fontSize: 17, fontWeight: 500 }}>{settings.phone}</a></dd></div>}
                {settings.email && <div><dt>Email</dt><dd><a href={`mailto:${settings.email}`} style={{ fontSize: 17, fontWeight: 500, overflowWrap: 'anywhere' }}>{settings.email}</a></dd></div>}
                {settings.address.length > 0 && (
                  <div><dt>Address</dt><dd style={{ fontSize: 16, lineHeight: 1.5 }}><address style={{ fontStyle: 'normal' }}>{settings.address.map((l, i) => <span key={i}>{l}<br /></span>)}</address></dd></div>
                )}
              </dl>
            </div>
            {content.guidance.length > 0 && (
              <div className="stack" style={{ gap: 12, padding: '0 4px' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>What helps us review your request</h2>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 15, lineHeight: 1.55 }}>
                  {content.guidance.map((g) => <li key={g.id}>{g.text}</li>)}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
