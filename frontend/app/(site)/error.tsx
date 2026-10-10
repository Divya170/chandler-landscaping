'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/** Shown when a public page can't load its content (e.g. the API is down). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="wrap" style={{ padding: 'clamp(56px,8vw,112px) var(--gutter)' }}>
      <div className="empty" style={{ maxWidth: 720 }}>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="h2">We couldn’t load this page.</h1>
        <p className="muted">This is usually temporary. Please try again — or, if you were about to get in touch, the quote form may still work.</p>
        <div className="row" style={{ gap: 12 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={reset}>Try again</button>
          <Link href="/contact" className="btn btn-outline btn-sm">Request a Quote</Link>
        </div>
      </div>
    </section>
  );
}
