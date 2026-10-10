import { Suspense } from 'react';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { MobileQuoteBar } from '@/components/site/MobileQuoteBar';
import { RouteEffects } from '@/components/site/RouteEffects';
import { getContent, getSettings } from '@/lib/server-api';
import type { PublicSettings, Service } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Fallback so the header/footer still render if the API is briefly unavailable (the page shows its own error state). */
const FALLBACK: PublicSettings = {
  businessName: 'Chandler Landscaping', contactName: null, phone: null, phoneHref: null, email: null, address: [], cityLabel: null,
  aboutIntro: null, aboutStory: null, aboutImage: null, successMessage: null, hasPrivacyPolicy: false, showContentFlags: false, mobileQuoteBar: true,
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([
    getSettings().catch(() => FALLBACK),
    getContent().then((c) => c.services).catch((): Service[] => []),
  ]);
  return (
    <>
      <Header settings={settings} />
      <Suspense fallback={null}><RouteEffects /></Suspense>
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>{children}</main>
      <Footer settings={settings} services={services} />
      <MobileQuoteBar settings={settings} />
    </>
  );
}
