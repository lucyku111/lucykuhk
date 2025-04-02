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
  // Add this to force static export which doesn't use generateStaticParams
  output: 'export',
  // Disable server components for the build
  experimental: {
    serverComponentsExternalPackages: [],
  }
};

module.exports = nextConfig;
