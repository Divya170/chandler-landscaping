import Link from 'next/link';

export function Brand({ name = 'Chandler', dark = false }: { name?: string; dark?: boolean }) {
  const [first, ...rest] = name.split(' ');
  return (
    <Link href="/" aria-label={`${name}, home`} className="brand" style={dark ? { color: 'var(--paper)' } : undefined}>
      <span aria-hidden="true" className="leaf" style={dark ? { background: 'var(--sage)' } : undefined} />
      <span className="words">
        <span className="brand-name" style={dark ? { fontSize: 28 } : undefined}>{first}</span>
        <span className="brand-sub">{rest.join(' ') || 'Landscaping'}</span>
      </span>
    </Link>
  );
}
