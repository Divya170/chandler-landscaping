import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Chandler Landscaping', robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-body">{children}</div>;
}
