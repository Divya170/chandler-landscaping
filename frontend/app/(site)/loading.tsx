/** Skeleton while a public page fetches its content from the API. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading page" style={{ padding: 'clamp(32px,6vw,80px) 0' }}>
      <div className="wrap hero-grid">
        <div className="stack" style={{ gap: 20 }}>
          <div className="skel" style={{ width: 220, height: 14 }} />
          <div className="skel" style={{ width: '95%', height: 64 }} />
          <div className="skel" style={{ width: '70%', height: 64 }} />
          <div className="skel" style={{ width: '80%', height: 20 }} />
          <div className="row" style={{ gap: 12 }}><div className="skel" style={{ width: 170, height: 52 }} /><div className="skel" style={{ width: 200, height: 52 }} /></div>
        </div>
        <div className="skel" style={{ aspectRatio: '5 / 4', width: '100%' }} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
