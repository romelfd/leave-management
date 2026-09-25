/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxies /api/* calls from the Next.js dev server to the Express backend on
  // port 4000, so the frontend can keep using relative fetch('/api/...') calls
  // without hardcoding a host/port or dealing with CORS in dev.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
