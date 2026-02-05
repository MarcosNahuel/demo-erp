import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: Turbopack is now default bundler
  // React Compiler for automatic optimizations
  reactCompiler: true,

  images: {
    // Updated minimumCacheTTL default is now 4 hours (14400s)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
      },
    ],
  },
};

export default nextConfig;
