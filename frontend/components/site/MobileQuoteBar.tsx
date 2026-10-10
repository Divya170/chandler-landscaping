'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PublicSettings } from '@/lib/types';

/** Sticky "Request a Quote / Call" bar below 900px (CSS), hidden on the quote page itself. */
export function MobileQuoteBar({ settings }: { settings: PublicSettings }) {
  const pathname = usePathname() || '/';
  if (!settings.mobileQuoteBar || pathname.startsWith('/contact')) return null;
  return (
    <>
      <div className="quote-bar-spacer" aria-hidden="true" />
      <div className="quote-bar">
        <Link href="/contact" className="btn btn-primary" style={{ flex: 1, minHeight: 50 }}>Request a Quote</Link>
        {settings.phone && settings.phoneHref && (
          <a href={settings.phoneHref} aria-label={`Call ${settings.phone}`} className="btn btn-outline" style={{ minHeight: 50, padding: '0 18px', fontSize: 15 }}>Call</a>
        )}
      </div>
    </>
  );
}
