/** @type {import('next').NextConfig} */
// Rewrites and static export are mutually exclusive — output: 'export' has no
// server to run rewrites on. STATIC_EXPORT is set only by the S3 deploy build
// step in .github/workflows/deploy.yml; local `npm run dev` never sets it, so
// the API proxy still works day-to-day.
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.STATIC_EXPORT === 'true'
    ? { output: 'export' }
    : {
        // Proxies /api/* calls from the Next.js dev server to the Express
        // backend on port 4000, so the frontend can use relative
        // fetch('/api/...') calls without hardcoding a host/port or dealing
        // with CORS in dev.
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:4000/api/:path*',
            },
          ];
        },
      }),
};

module.exports = nextConfig;
