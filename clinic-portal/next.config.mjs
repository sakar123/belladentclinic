import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:8080';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  webpack(config) {
    config.resolve.alias['react-advanced-odontogram$'] = path.resolve(
      __dirname,
      'node_modules/react-advanced-odontogram/dist/odontogram.js'
    );
    return config;
  },
};

export default nextConfig;
