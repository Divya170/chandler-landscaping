'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Faq } from '@/lib/types';

/** Accordion; each question opens independently (as in the comp). */
export function FaqList({ faqs, flags, large = false, headingLevel = 3 }: { faqs: Faq[]; flags: boolean; large?: boolean; headingLevel?: 2 | 3 }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  if (!faqs.length) {
    return <p className="muted" style={{ paddingTop: 20 }}>Questions will appear here soon. In the meantime, <Link href="/contact">ask us directly</Link>.</p>;
  }
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div style={{ borderTop: '1px solid var(--rule)' }}>
      {faqs.map((f) => {
        const isOpen = !!open[f.id];
        return (
          <div key={f.id} className="faq-item">
            <H style={{ margin: 0 }}>
              <button type="button" id={`faq-b-${f.id}`} className={`faq-btn${large ? ' lg' : ''}`} aria-expanded={isOpen} aria-controls={`faq-p-${f.id}`}
                onClick={() => setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))}>
                <span>{f.question}</span><span aria-hidden="true" className="faq-icon">{isOpen ? '−' : '+'}</span>
              </button>
            </H>
            {isOpen && (
              <div id={`faq-p-${f.id}`} role="region" aria-labelledby={`faq-b-${f.id}`} className="faq-panel" style={large ? { paddingBottom: 24 } : undefined}>
                <p style={{ whiteSpace: 'pre-line' }}>{f.answer}</p>
                {flags && f.status === 'Awaiting client approval' && <span className="flag" style={{ alignSelf: 'flex-start' }}>Awaiting client-approved answer</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
