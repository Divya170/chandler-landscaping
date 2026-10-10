import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/site/FaqList';
import { Flag, FlagBox, Photo } from '@/components/site/blocks';
import { getContent, getSettings } from '@/lib/server-api';
import { pad2 } from '@/lib/validation';

export const metadata: Metadata = { title: 'Services' };

export default async function ServicesPage() {
  const [settings, content] = await Promise.all([getSettings(), getContent()]);
  const flags = settings.showContentFlags;
  const relFaqs = content.faqs.filter((f) => f.onServices === 'Yes');

  return (
    <>
      <section aria-labelledby="sp-h" style={{ padding: 'clamp(40px,6vw,88px) 0 clamp(48px,6vw,80px)' }}>
        <div className="wrap intro2">
          <div className="stack" style={{ gap: 24 }}>
            <p className="eyebrow">Services</p>
            <h1 id="sp-h" className="h1">Services for your outdoor space</h1>
            <p className="lead" style={{ maxWidth: '48ch' }}>What we currently offer for residential properties. If your job doesn&apos;t fit neatly into one of these, describe it in your quote request.</p>
            <div><Link href="/contact" className="btn btn-primary">Request a Quote</Link></div>
          </div>
          <Photo src="/assets/hero-garden.webp" focal="50% 70%" ratio="16 / 11" alt="Freshly mowed front lawn bordered by flower beds and clipped shrubs" />
        </div>
      </section>

      {content.services.length === 0 && (
        <div className="wrap" style={{ paddingBottom: 64 }}>
          <div className="empty"><p className="serif">Our service list is being updated.</p><Link href="/contact?service=unsure" className="btn btn-primary btn-sm">Describe Your Project</Link></div>
        </div>
      )}

      {content.services.map((s, i) => (
        <article key={s.id} id={`svc-${s.key}`} aria-labelledby={`svc-t-${s.key}`} className="svc-article">
          <div className={`wrap two${i % 2 === 1 ? ' flip' : ''}`}>
            <div className="media" style={{ aspectRatio: (s.ratioLg || '4/5').replace('/', ' / ') }}>
              <div role="img" aria-label={s.alt} className="bgimg" style={{ position: 'absolute', inset: 0, backgroundImage: `url("${s.image}")`, backgroundPosition: s.focal || '50% 50%' }} />
            </div>
            <div className="stack" style={{ gap: 22, maxWidth: 560 }}>
              <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                <span className="eyebrow">Service {pad2(i + 1)}</span>
                <Flag show={flags && (!s.includes || !s.notes)} />
              </div>
              <h2 id={`svc-t-${s.key}`} className="serif" style={{ fontSize: 'clamp(32px,3.6vw,44px)', lineHeight: 1.08, color: 'var(--green)' }}>{s.title}</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, textWrap: 'pretty', whiteSpace: 'pre-line' } as React.CSSProperties}>{s.body}</p>
              <dl className="svc-dl">
                <div className="stack" style={{ gap: 6 }}><dt>What&apos;s included</dt><dd>{s.includes || (flags ? '[Confirmed list of included tasks]' : 'Ask us — we’ll confirm what’s included for your property.')}</dd></div>
                <div className="stack" style={{ gap: 6 }}><dt>Good to know</dt><dd>{s.notes || (flags ? '[Client-supplied considerations]' : 'Photos and a rough size of the area help us review your request.')}</dd></div>
              </dl>
              <div><Link href={`/contact?service=${s.key}`} className="btn btn-primary btn-sm">Get a Quote for This Service</Link></div>
            </div>
          </div>
        </article>
      ))}

      {flags && (
        <div className="wrap" style={{ paddingBottom: 'clamp(40px,5vw,64px)' }}>
          <FlagBox show white style={{ fontSize: 15, padding: '18px 20px' }}>[Additional exterior or home services] — shown here and in the quote form only once confirmed by the business.</FlagBox>
        </div>
      )}

      <section aria-labelledby="unsure-h" className="bg-mist" style={{ padding: 'clamp(48px,6vw,80px) 0' }}>
        <div className="wrap row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 28 }}>
          <div className="stack" style={{ gap: 12, maxWidth: 620 }}>
            <h2 id="unsure-h" className="h2-sm">Not sure which service you need?</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6 }}>Picking a service is optional. Describe the job in your own words and add a few photos if you can.</p>
          </div>
          <Link href="/contact?service=unsure" className="btn btn-primary">Describe Your Project</Link>
        </div>
      </section>

      {relFaqs.length > 0 && (
        <section aria-labelledby="rf-h" style={{ padding: 'clamp(56px,7vw,96px) 0' }}>
          <div className="wrap faq-split">
            <div className="stack" style={{ gap: 16 }}>
              <h2 id="rf-h" className="h2-sm">Common questions</h2>
              <Link href="/faqs" className="arrow-link">See all FAQs →</Link>
            </div>
            <FaqList faqs={relFaqs} flags={flags} />
          </div>
        </section>
      )}
    </>
  );
}
