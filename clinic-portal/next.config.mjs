/** @type {import('next').NextConfig} */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:8080';

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_QDENTO_CHART_V2: process.env.QDENTO_CHART_V2 || 'false',
    NEXT_PUBLIC_QDENTO_DEBUG: process.env.QDENTO_DEBUG || 'false',
  },
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
