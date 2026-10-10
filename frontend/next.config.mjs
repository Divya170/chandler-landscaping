/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The browser only ever talks to this origin; Next proxies API calls and CMS media to NestJS.
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/media/:path*', destination: `${BACKEND_URL}/media/:path*` },
    ];
  },
};

export default nextConfig;
