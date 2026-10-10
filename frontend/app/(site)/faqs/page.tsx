import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/site/FaqList';
import { getContent, getSettings } from '@/lib/server-api';

export const metadata: Metadata = { title: 'FAQs' };

export default async function FaqsPage() {
  const [settings, content] = await Promise.all([getSettings(), getContent()]);
  return (
    <>
      <section aria-labelledby="fq-h" style={{ padding: 'clamp(40px,6vw,88px) 0 clamp(56px,7vw,96px)' }}>
        <div className="wrap faq-split">
          <div className="stack sticky-desk" style={{ gap: 22 }}>
            <p className="eyebrow">FAQs</p>
            <h1 id="fq-h" className="h1" style={{ fontSize: 'clamp(40px,4.8vw,64px)', lineHeight: 1.04 }}>Questions before you get started?</h1>
            <p style={{ fontSize: 17, lineHeight: 1.6 }}>Have a look through the answers below, or get in touch directly.</p>
          </div>
          <FaqList faqs={content.faqs} flags={settings.showContentFlags} large headingLevel={2} />
        </div>
      </section>
      <section aria-labelledby="fcta-h" className="bg-mist" style={{ padding: 'clamp(48px,6vw,80px) 0' }}>
        <div className="wrap row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 28 }}>
          <div className="stack" style={{ gap: 12, maxWidth: 560 }}>
            <h2 id="fcta-h" className="h2-sm">Still have a question?</h2>
            <div className="row" style={{ gap: '8px 24px', fontSize: 16, fontWeight: 500 }}>
              {settings.phone && settings.phoneHref && <a href={settings.phoneHref}>{settings.phone}</a>}
              {settings.email && <a href={`mailto:${settings.email}`} style={{ overflowWrap: 'anywhere' }}>{settings.email}</a>}
            </div>
          </div>
          <Link href="/contact" className="btn btn-primary">Ask About Your Project</Link>
        </div>
      </section>
    </>
  );
}
