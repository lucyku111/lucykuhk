/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for Netlify deployment
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
  },  // Added comma here
  // Removed experimental.esmExternals as it's not supported by Turbopack
};

module.exports = nextConfig;
