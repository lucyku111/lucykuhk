/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
  },
  // Add serverless function configuration for Vercel
  serverRuntimeConfig: {
    // Will only be available on the server side
    timeoutMs: 30000, // 30 seconds timeout
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiTimeout: 25000, // 25 seconds timeout for client-side
  },
};

module.exports = nextConfig;
