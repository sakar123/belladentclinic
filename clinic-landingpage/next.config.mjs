/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: If you use next/image component and want to avoid errors
  // with a static export, you might need to unoptimize images or use a custom loader.
  // For simple static sites, unoptimized: true can be a quick fix.
  images: {
    unoptimized: true,
  },
  // Optional: For cleaner URLs (e.g., /about/ instead of /about.html)
  // trailingSlash: true,
};

export default nextConfig;