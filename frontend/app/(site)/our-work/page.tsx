import type { Metadata } from 'next';
import Link from 'next/link';
import { FlagBox } from '@/components/site/blocks';
import { GalleryClient } from '@/components/site/GalleryClient';
import { getContent, getGallery, getSettings } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Our Work' };

export default async function OurWorkPage() {
  const [settings, gallery, content] = await Promise.all([getSettings(), getGallery(), getContent()]);
  const ba = content.beforeAfter[0];
  return (
    <>
      <section aria-labelledby="ow-h" style={{ padding: 'clamp(40px,6vw,88px) 0 clamp(32px,4vw,48px)' }}>
        <div className="wrap row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px 48px' }}>
          <div className="stack" style={{ gap: 22, maxWidth: 760 }}>
            <p className="eyebrow">Our work</p>
            <h1 id="ow-h" className="h1" style={{ fontSize: 'clamp(42px,6vw,80px)', lineHeight: 1.02 }}>Outdoor spaces, in focus.</h1>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '42ch' }}>A gallery of approved project photography — lawns, gardens and hedges we&apos;ve looked after.</p>
        </div>
      </section>
      <section aria-label="Project gallery" style={{ paddingBottom: 'clamp(56px,7vw,96px)' }}>
        <div className="wrap stack" style={{ gap: 24 }}>
          <GalleryClient data={gallery} />
          <FlagBox show={settings.showContentFlags} white>
            Confirm each photo is {settings.businessName} work before publishing. Representative imagery must not be presented as completed projects.
          </FlagBox>
          {ba && (
            <section aria-labelledby="ba-h" className="stack" style={{ marginTop: 'clamp(32px,5vw,64px)', paddingTop: 'clamp(32px,4vw,48px)', borderTop: '1px solid var(--rule)', gap: 24 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
                <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
                  <p className="eyebrow">Before &amp; after</p>
                  <h2 id="ba-h" className="h2-sm">{ba.title}</h2>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, maxWidth: '40ch' }}>{ba.body}</p>
              </div>
              <div className="pair">
                {[
                  { img: ba.beforeImage, alt: ba.beforeAlt, cap: ba.beforeCaption, tag: 'Before', tagStyle: { background: 'var(--paper)', color: 'var(--green-dark)' } },
                  { img: ba.afterImage, alt: ba.afterAlt, cap: ba.afterCaption, tag: 'After', tagStyle: { background: 'var(--green)', color: 'var(--paper)' } },
                ].map((x) => (
                  <figure key={x.tag} className="stack" style={{ gap: 10 }}>
                    <div className="media" style={{ aspectRatio: '2 / 1' }}>
                      <div role="img" aria-label={x.alt} className="bgimg" style={{ position: 'absolute', inset: 0, backgroundImage: `url("${x.img}")`, backgroundPosition: '50% 50%' }} />
                      <span className="ba-tag" style={x.tagStyle}>{x.tag}</span>
                    </div>
                    {x.cap && <figcaption className="muted" style={{ fontSize: 13 }}>{x.cap}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
      <section aria-labelledby="gcta-h" data-dark="" className="dark-2" style={{ padding: 'clamp(56px,7vw,96px) 0' }}>
        <div className="wrap row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 28 }}>
          <div className="stack" style={{ gap: 12, maxWidth: 640 }}>
            <h2 id="gcta-h" className="serif" style={{ fontSize: 'clamp(36px,4.6vw,58px)', lineHeight: 1.05 }}>Have a project in mind?</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--mist)' }}>Send a few details and photos of your space.</p>
          </div>
          <Link href="/contact" className="btn btn-light">Discuss Your Project</Link>
        </div>
      </section>
    </>
  );
}
