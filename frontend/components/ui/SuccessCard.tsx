'use client';

import { useEffect, useRef } from 'react';

/** Shown after every successful form submission. Always carries a next-action link/button (passed as `actions`). */
export function SuccessCard({
  eyebrow, title, children, actions, headingId,
}: { eyebrow?: string; title: string; children?: React.ReactNode; actions: React.ReactNode; headingId: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div role="status" className="success-card">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 ref={ref} id={headingId} tabIndex={-1} className="serif" style={{ fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.05, color: 'var(--forest)' }}>{title}</h2>
      {children}
      <div className="row" style={{ gap: 12, marginTop: 8 }}>{actions}</div>
    </div>
  );
}
