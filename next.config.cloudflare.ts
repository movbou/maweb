import type { NextConfig } from "next";

// Choose deployment mode
const isStaticExport = process.env.CLOUDFLARE_STATIC === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // For Cloudflare Pages static export, uncomment:
  // output: 'export',
  
  // Disable hot reload in dev (handled by nodemon)
  reactStrictMode: false,
  
  images: {
    // For static export, must be unoptimized
    unoptimized: isStaticExport || process.env.NODE_ENV === 'production',
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: '**.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
  
  // Cloudflare Pages compatibility
  ...(isStaticExport && {
    trailingSlash: true,
    output: 'export',
  }),
};

export default nextConfig;
