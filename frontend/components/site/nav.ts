export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
];

export const isCurrent = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
