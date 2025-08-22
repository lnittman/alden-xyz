import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@repo/design', '@repo/services', 'lucide-react', '@headlessui/react', '@heroicons/react'],
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  transpilePackages: ['@repo/design', '@repo/services', '@repo/database', '@repo/orpc', '@repo/auth', '@repo/ai', '@repo/analytics', '@repo/storage', '@repo/email'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  outputFileTracing: true,
};

export default nextConfig;
