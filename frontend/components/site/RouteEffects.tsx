'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * After client-side navigation: move focus to <main> (as the comp does), and honour the
 * comp's `/services?s=<id>` deep links by scrolling to `#svc-<id>` below the sticky header.
 */
export function RouteEffects() {
  const pathname = usePathname();
  const svc = useSearchParams()?.get('s') || '';
  const first = useRef(true);
  useEffect(() => {
    const target = svc ? document.getElementById(`svc-${svc}`) : null;
    if (target) {
      const t = setTimeout(() => window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'auto' }), 60);
      return () => clearTimeout(t);
    }
    if (first.current) { first.current = false; return; }
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, svc]);
  return null;
}
