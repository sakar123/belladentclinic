/** @type {import('next').NextConfig} */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://api:8080';

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // Proxy backend API via /backend to avoid browser CORS and to not
    // collide with Next's own /api/ routes.
    return [
      {
        source: '/backend/:path*',
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
