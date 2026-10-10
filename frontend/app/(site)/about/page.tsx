import type { Metadata } from 'next';
import Link from 'next/link';
import { FlagBox, PhotoSlot, srOnly } from '@/components/site/blocks';
import { getContent, getSettings } from '@/lib/server-api';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const [settings, content] = await Promise.all([getSettings(), getContent()]);
  const flags = settings.showContentFlags;
  const first = settings.contactName?.split(' ')[0];
  return (
    <>
      <section aria-labelledby="ab-h" style={{ padding: 'clamp(40px,6vw,88px) 0 clamp(56px,7vw,96px)' }}>
        <div className="wrap split-6-5">
          <div className="stack" style={{ gap: 24, maxWidth: 600 }}>
            <p className="eyebrow">About</p>
            <h1 id="ab-h" className="h1">Outdoor care, with a personal touch.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.65 }}>
              {settings.businessName} is a small residential business looking after homeowners&apos; lawns, gardens and hedges.
              {settings.contactName && <> {settings.contactName} is your point of contact for every enquiry.</>}
            </p>
            {settings.aboutIntro && <p style={{ fontSize: 17, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{settings.aboutIntro}</p>}
          </div>
          <figure className="stack" style={{ gap: 10 }}>
            <PhotoSlot src={settings.aboutImage} alt={settings.contactName || settings.businessName} label={`about-business — approved photo of ${settings.contactName || 'the owner'}`} />
            <figcaption className="muted" style={{ fontSize: 13 }}>{settings.contactName || settings.businessName}{flags && !settings.aboutImage && ' · [Approved photograph]'}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="story-h" className="bg-mist" style={{ padding: 'clamp(56px,7vw,96px) 0' }}>
        <div className="wrap faq-split">
          <h2 id="story-h" className="serif" style={{ fontSize: 'clamp(32px,3.6vw,44px)', lineHeight: 1.08, color: 'var(--green)' }}>What we look after</h2>
          <div className="stack" style={{ gap: 24, maxWidth: 680 }}>
            {settings.aboutStory
              ? <p style={{ fontSize: 17, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{settings.aboutStory}</p>
              : <FlagBox show={flags} style={{ background: 'var(--paper)', fontSize: 16, padding: '14px 16px' }}>[Client-approved business story] — replace this block with {first ? `${first}’s` : 'the owner’s'} own account. Until then, the section below describes services only.</FlagBox>}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
              {content.services.map((s) => (
                <li key={s.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: '8px 24px', padding: '18px 0', borderTop: '1px solid var(--sage)' }}>
                  <span className="serif" style={{ fontSize: 24, color: 'var(--green)' }}>{s.title}</span>
                  <Link href={`/services?s=${s.key}`} style={{ fontSize: 14, fontWeight: 500 }}>Details{srOnly(` about ${s.title}`)} →</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {content.steps.length > 0 && (
        <section aria-labelledby="appr-h" style={{ padding: 'clamp(56px,7vw,96px) 0' }}>
          <div className="wrap stack" style={{ gap: 'clamp(28px,4vw,48px)' }}>
            <h2 id="appr-h" className="serif" style={{ fontSize: 'clamp(32px,3.6vw,44px)', lineHeight: 1.08, color: 'var(--green)', maxWidth: 640 }}>How an enquiry works</h2>
            <ol className="three">
              {content.steps.map((st, i) => (
                <li key={st.id}>
                  <span aria-hidden="true" className="serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--sage)' }}>{i + 1}</span>
                  <h3 style={{ fontSize: 19, fontWeight: 600 }}>{st.title}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.6 }}>{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section aria-labelledby="acta-h" data-dark="" className="dark" style={{ padding: 'clamp(56px,7vw,96px) 0' }}>
        <div className="wrap split-6-5" style={{ alignItems: 'end', gap: 32 }}>
          <h2 id="acta-h" className="serif" style={{ fontSize: 'clamp(36px,4.6vw,58px)', lineHeight: 1.05, textWrap: 'balance' } as React.CSSProperties}>Ready when you are.</h2>
          <div className="stack" style={{ gap: 20 }}>
            <div><Link href="/contact" className="btn btn-light">Tell Us About Your Outdoor Space</Link></div>
            <div className="row" style={{ gap: '8px 24px', fontSize: 16 }}>
              {settings.phone && settings.phoneHref && <a href={settings.phoneHref} style={{ color: 'var(--paper)' }}>{settings.phone}</a>}
              {settings.email && <a href={`mailto:${settings.email}`} style={{ color: 'var(--paper)', overflowWrap: 'anywhere' }}>{settings.email}</a>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
