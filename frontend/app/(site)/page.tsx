import Link from 'next/link';
import { Flag, FlagBox, Photo, PhotoSlot, srOnly } from '@/components/site/blocks';
import { getContent, getGallery, getSettings } from '@/lib/server-api';
import { pad2 } from '@/lib/validation';

export default async function HomePage() {
  const [settings, content, gallery] = await Promise.all([getSettings(), getContent(), getGallery()]);
  const flags = settings.showContentFlags;
  const [feature, ...rest] = content.services;
  // "From the garden journal" — the first three gallery photos, in the comp's layout.
  const [j1, j2, j3] = gallery.items;
  const city = settings.cityLabel || 'New York, NY';

  return (
    <>
      <section aria-labelledby="hero-h" style={{ padding: 'clamp(32px,6vw,80px) 0 clamp(64px,9vw,120px)' }}>
        <div className="wrap hero-grid">
          <div className="stack" style={{ gap: 28, maxWidth: 580 }}>
            <p className="eyebrow eyebrow-line">Residential outdoor care · {city}</p>
            <h1 id="hero-h" className="hero-h1">Your outdoor space, thoughtfully cared for.</h1>
            <p style={{ fontSize: 'clamp(17px,1.4vw,19px)', lineHeight: 1.6, maxWidth: '44ch', textWrap: 'pretty' } as React.CSSProperties}>
              Explore our available landscaping and garden maintenance services for your home, then tell us what your outdoor space needs.
            </p>
            <div className="row" style={{ gap: 12 }}>
              <Link href="/contact" className="btn btn-primary">Request a Quote</Link>
              <Link href="/services" className="btn btn-outline" style={{ padding: '0 24px' }}>Explore Our Services</Link>
            </div>
          </div>
          <div className="hero-figure">
            <Photo className="hero-photo" src="/assets/hero-garden.webp" priority focal="50% 60%" alt="Striped front lawn curving around flowering beds and rounded shrubs toward a grey two-storey house with a covered porch" />
            <div className="hero-inset"><div className="media" style={{ width: '100%', height: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/service-pruning.webp" alt="" loading="lazy" />
            </div></div>
            <p className="hero-cap"><span>Plate 01 — A front garden in early summer</span>{flags && <span style={{ fontWeight: 500 }}>Representative image</span>}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="svc-h" className="sec-md rule-top">
        <div className="wrap stack" style={{ gap: 'clamp(32px,4vw,56px)' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
            <div className="stack" style={{ gap: 14, maxWidth: 640 }}>
              <p className="eyebrow">Services</p>
              <h2 id="svc-h" className="h2">Care for lawns, gardens and hedges.</h2>
            </div>
            <Link href="/services" className="arrow-link">All services →</Link>
          </div>
          {feature ? (
            <div className="feat-grid">
              <article className="stack" style={{ gap: 20 }}>
                <Link href={`/services?s=${feature.key}`} tabIndex={-1} aria-hidden="true" className="media zoom" style={{ display: 'block', aspectRatio: '4 / 3' }}>
                  <div className="bgimg" style={{ position: 'absolute', inset: 0, backgroundImage: `url("${feature.image}")`, backgroundPosition: feature.focal || '50% 50%' }} />
                </Link>
                <div className="stack" style={{ gap: 10, maxWidth: 560 }}>
                  <div className="row" style={{ alignItems: 'center', gap: 12 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>01</span><Flag show={flags && !feature.includes} /></div>
                  <h3 className="serif" style={{ fontSize: 'clamp(28px,2.6vw,34px)', lineHeight: 1.12, color: 'var(--green)' }}>{feature.title}</h3>
                  <p style={{ fontSize: 17, lineHeight: 1.6 }}>{feature.short}</p>
                  <Link href={`/services?s=${feature.key}`} className="arrow-link" style={{ marginTop: 6 }}>Explore Service{srOnly(`: ${feature.title}`)} →</Link>
                </div>
              </article>
              <div className="stack" style={{ gap: 'clamp(28px,3vw,40px)' }}>
                {rest.map((s, i) => (
                  <article key={s.id} className="feat-small">
                    <Link href={`/services?s=${s.key}`} tabIndex={-1} aria-hidden="true" className="media zoom" style={{ display: 'block', aspectRatio: (s.ratio || '1/1').replace('/', ' / ') }}>
                      <div className="bgimg" style={{ position: 'absolute', inset: 0, backgroundImage: `url("${s.image}")`, backgroundPosition: s.focal || '50% 50%' }} />
                    </Link>
                    <div className="stack" style={{ gap: 10 }}>
                      <div className="row" style={{ alignItems: 'center', gap: 12 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{pad2(i + 2)}</span><Flag show={flags && !s.includes} /></div>
                      <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.15, color: 'var(--green)' }}>{s.title}</h3>
                      <p style={{ fontSize: 16, lineHeight: 1.6 }}>{s.short}</p>
                      <Link href={`/services?s=${s.key}`} className="arrow-link">Explore Service{srOnly(`: ${s.title}`)} →</Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty"><p className="serif">Our service list is being updated.</p><Link href="/contact" className="btn btn-primary btn-sm">Describe what you need</Link></div>
          )}
        </div>
      </section>

      <section aria-labelledby="val-h" className="sec bg-mist">
        <div className="wrap split-6-5">
          <Photo src="/assets/garden-backyard.webp" focal="62% 50%" ratio="4 / 5" style={{ background: 'var(--rule)' }}
            alt="Sunlit back lawn under two large shade trees, with a stone path leading to a brick cottage porch and planted borders along a wooden fence" />
          <div className="stack" style={{ gap: 32 }}>
            <div className="stack" style={{ gap: 14 }}>
              <p className="eyebrow">How it works</p>
              <h2 id="val-h" className="h2">Practical care for the garden you already have.</h2>
            </div>
            {content.valuePoints.length > 0 && (
              <ol className="value-list">
                {content.valuePoints.map((v, i) => (
                  <li key={v.id}>
                    <span className="serif" style={{ fontSize: 26, lineHeight: 1, color: 'var(--green)' }}>{pad2(i + 1)}</span>
                    <div className="stack" style={{ gap: 6 }}><h3 style={{ fontSize: 18, fontWeight: 600 }}>{v.title}</h3><p style={{ fontSize: 16, lineHeight: 1.6 }}>{v.body}</p></div>
                  </li>
                ))}
              </ol>
            )}
            <Link href="/services" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>View services</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="work-h" className="sec">
        <div className="wrap stack" style={{ gap: 'clamp(28px,4vw,48px)' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
            <div className="stack" style={{ gap: 14, maxWidth: 620 }}>
              <p className="eyebrow">Selected work</p>
              <h2 id="work-h" className="h2">From the garden journal.</h2>
            </div>
            <Link href="/our-work" className="btn btn-primary btn-sm">View Our Work</Link>
          </div>
          <FlagBox show={flags} white style={{ maxWidth: 720 }}>Confirm these photos show {settings.businessName} work before publishing; otherwise label them as representative imagery.</FlagBox>
          {j1 ? (
            <div className="proj-grid">
              <figure className="stack" style={{ gap: 12 }}>
                <div className="media zoom" style={{ aspectRatio: '4 / 3' }}><div className="bgimg" role="img" aria-label={j1.alt} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${j1.imageUrl}")`, backgroundPosition: j1.focal }} /></div>
                <figcaption className="figcap"><b>Fig. 01</b><span>{j1.title}</span></figcaption>
              </figure>
              {(j2 || j3) && (
                <div className="proj-col">
                  {[j2, j3].filter(Boolean).map((g, i) => (
                    <figure key={g!.id} className="stack" style={{ gap: 12 }}>
                      <div className="media zoom" style={{ aspectRatio: i === 0 ? '3 / 4' : '16 / 10' }}><div className="bgimg" role="img" aria-label={g!.alt} style={{ position: 'absolute', inset: 0, backgroundImage: `url("${g!.imageUrl}")`, backgroundPosition: g!.focal }} /></div>
                      <figcaption className="figcap"><b>Fig. {pad2(i + 2)}</b><span>{g!.title}</span></figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="muted">Project photos will appear here once approved.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="intro-h" style={{ paddingBottom: 'clamp(64px,9vw,120px)' }}>
        <div className="wrap intro-grid" style={{ paddingTop: 'clamp(48px,6vw,80px)', borderTop: '1px solid var(--rule)' }}>
          <PhotoSlot src={settings.aboutImage} alt={settings.contactName ? `${settings.contactName}, ${settings.businessName}` : settings.businessName}
            label={`about-business — approved photo of ${settings.contactName || 'the owner'} or the team`} style={{ maxWidth: 440, width: '100%' }} />
          <div className="stack" style={{ gap: 22, maxWidth: 600 }}>
            <p className="eyebrow">About the business</p>
            <h2 id="intro-h" className="h2">A small local business, with a person you can talk to.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, textWrap: 'pretty' } as React.CSSProperties}>
              {settings.businessName} looks after residential outdoor spaces.{settings.contactName && <> {settings.contactName} is your point of contact — by phone, by email, or through the quote form.</>}
            </p>
            {settings.aboutIntro
              ? <p style={{ fontSize: 17, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{settings.aboutIntro}</p>
              : <FlagBox show={flags}>[Client-approved business introduction — add a sentence or two in {settings.contactName ? `${settings.contactName.split(' ')[0]}’s` : 'the owner’s'} own words.]</FlagBox>}
            <Link href="/about" className="arrow-link">About {settings.businessName} →</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-h" data-dark="" className="dark" style={{ padding: 'clamp(56px,8vw,104px) 0' }}>
        <div className="wrap split-6-5-start">
          <div className="stack" style={{ gap: 20 }}>
            <h2 id="cta-h" className="serif" style={{ fontSize: 'clamp(38px,5vw,64px)', lineHeight: 1.04, textWrap: 'balance' } as React.CSSProperties}>Tell us about your outdoor space.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--mist)', maxWidth: '46ch' }}>Share the service you need, where the property is, and anything useful about the job. Photos are welcome.</p>
          </div>
          <div className="stack" style={{ gap: 28 }}>
            {content.ctaSteps.length > 0 && (
              <ol className="cta-steps">
                {content.ctaSteps.map((c, i) => (
                  <li key={c.id}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sage)', width: 24, flex: 'none' }}>{pad2(i + 1)}</span><span style={{ fontSize: 17 }}>{c.text}</span></li>
                ))}
              </ol>
            )}
            <div className="row" style={{ gap: '12px 24px', alignItems: 'center' }}>
              <Link href="/contact" className="btn btn-light">Request a Quote</Link>
              {settings.phone && settings.phoneHref && <a href={settings.phoneHref} style={{ color: 'var(--paper)', fontSize: 16, fontWeight: 500, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>or call {settings.phone}</a>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
