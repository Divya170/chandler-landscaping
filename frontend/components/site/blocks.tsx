import type { CSSProperties, ReactNode } from 'react';

/** Dashed client-review chip, shown only while settings.showContentFlags is on. */
export function Flag({ show, children = 'Awaiting client confirmation' }: { show: boolean; children?: ReactNode }) {
  return show ? <span className="flag">{children}</span> : null;
}

/** Dashed client-review note block. */
export function FlagBox({ show, children, white, style }: { show: boolean; children: ReactNode; white?: boolean; style?: CSSProperties }) {
  return show ? <p className={`flag-box${white ? ' white' : ''}`} style={style}>{children}</p> : null;
}

/** Cover image with a focal point, inside a sized frame. */
export function Photo({ src, alt, focal, ratio, priority, style, className }: { src: string; alt: string; focal?: string; ratio?: string; priority?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <div className={`media${className ? ` ${className}` : ''}`} style={{ aspectRatio: ratio, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} style={{ objectPosition: focal || '50% 50%' }} />
    </div>
  );
}

/** "Approved photo" slot: real image when set, otherwise the comp's striped placeholder. */
export function PhotoSlot({ src, alt, label, ratio = '4 / 5', style }: { src: string | null; alt: string; label: string; ratio?: string; style?: CSSProperties }) {
  return (
    <div className="media" style={{ aspectRatio: ratio, ...style }}>
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={alt} loading="lazy" />
        : <div className="placeholder-photo">{label}</div>}
    </div>
  );
}

export const srOnly = (text: string) => <span className="sr-only">{text}</span>;
