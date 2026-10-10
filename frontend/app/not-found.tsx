import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <section className="wrap stack" style={{ gap: 20, padding: '80px var(--gutter)' }}>
        <p className="eyebrow">Page not found</p>
        <h1 className="h1">This path leads nowhere.</h1>
        <p className="lead" style={{ maxWidth: '48ch' }}>The page may have moved. Head back home, or tell us about your outdoor space.</p>
        <div className="row" style={{ gap: 12 }}>
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/contact" className="btn btn-outline">Request a Quote</Link>
        </div>
      </section>
    </main>
  );
}
