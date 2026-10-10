'use client';

import { ContentManager, useSchemas } from '@/components/admin/ContentManager';

export default function AdminServicesPage() {
  const { schemas, error, reload } = useSchemas();
  const schema = schemas?.find((s) => s.type === 'service');
  return (
    <>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Admin</p>
      <h1 id="main-h" tabIndex={-1} className="admin-h1" style={{ marginBottom: 20 }}>Services</h1>
      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', gap: 12 }}><span>{error}</span><button type="button" className="small-btn" onClick={reload}>Try again</button></div>
      ) : !schema ? (
        <div className="skel" style={{ height: 200 }} aria-busy="true" />
      ) : (
        <ContentManager schema={schema} />
      )}
    </>
  );
}
