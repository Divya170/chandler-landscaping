import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const serif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Chandler Landscaping — Residential outdoor care', template: '%s — Chandler Landscaping' },
  description: 'Landscaping & lawn maintenance, garden cleanup and hedge trimming for homeowners in New York. Request a quote online.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F7F4EC' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
