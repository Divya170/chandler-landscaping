'use client';

import { useMemo, useState } from 'react';
import type { GalleryResponse } from '@/lib/types';

/** Our Work: service filter chips + dense mosaic. Tile sizes collapse to one column on phones (CSS). */
export function GalleryClient({ data }: { data: GalleryResponse }) {
  const [cat, setCat] = useState('all');
  const items = useMemo(() => (cat === 'all' ? data.items : data.items.filter((g) => g.category === cat)), [data.items, cat]);
  const filters = [{ key: 'all', label: 'All', count: data.total }, ...data.categories];
  const label = filters.find((f) => f.key === cat)?.label || 'All';

  return (
    <>
      <div role="group" aria-label="Filter by service" className="chips" style={{ paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
        {filters.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={cat === f.key} onClick={() => setCat(f.key)}>{f.label}</button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{`Showing ${items.length} ${items.length === 1 ? 'photo' : 'photos'}${cat === 'all' ? '' : ` in ${label}`}`}</p>
      {items.length > 0 ? (
        <div className="mosaic">
          {items.map((g) => (
            <figure key={g.id} className={g.size}>
              <div className="media zoom">
                <div role="img" aria-label={g.alt} className="bgimg" style={{ position: 'absolute', inset: 0, backgroundImage: `url("${g.imageUrl}")`, backgroundPosition: g.focal }} />
              </div>
              <figcaption><span>{g.title}</span><b>{g.categoryLabel}</b></figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="stack" style={{ gap: 12, alignItems: 'flex-start' }}>
          <p className="muted" style={{ fontSize: 16 }}>No approved photos in this category yet.</p>
          {cat !== 'all' && <button type="button" className="btn btn-outline btn-sm" onClick={() => setCat('all')}>Show all photos</button>}
        </div>
      )}
    </>
  );
}
