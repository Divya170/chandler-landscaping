'use client';

import { useEffect, useState } from 'react';
import { ContentManager, useSchemas } from '@/components/admin/ContentManager';

/** Tabs for every simple CMS collection except services (which has its own page). */
export default function AdminContentPage() {
  const { schemas, error, reload } = useSchemas();
  const types = (schemas || []).filter((s) => s.type !== 'service');
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!active && types.length) {
      const fromUrl = new URLSearchParams(window.location.search).get('type');
      setActive(types.some((t) => t.type === fromUrl) ? fromUrl! : types[0].type);
    }
  }, [active, types]);

  const pick = (t: string) => {
    setActive(t);
    try { window.history.replaceState(null, '', `?type=${t}`); } catch { /* ignore */ }
  };
  const schema = types.find((t) => t.type === active);

  return (
    <>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Admin</p>
      <h1 id="main-h" tabIndex={-1} className="admin-h1" style={{ marginBottom: 20 }}>Site content</h1>
      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', gap: 12 }}><span>{error}</span><button type="button" className="small-btn" onClick={reload}>Try again</button></div>
      ) : !schemas ? (
        <div className="skel" style={{ height: 200 }} aria-busy="true" />
      ) : (
        <>
          <div role="tablist" aria-label="Content type" className="chips" style={{ marginBottom: 20 }}>
            {types.map((t) => (
              <button key={t.type} role="tab" type="button" className="chip" aria-selected={active === t.type} aria-pressed={active === t.type} onClick={() => pick(t.type)}>{t.label}</button>
            ))}
          </div>
          {schema && <div role="tabpanel"><ContentManager schema={schema} /></div>}
        </>
      )}
    </>
  );
}
