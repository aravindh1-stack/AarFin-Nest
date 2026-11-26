import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Prevent stylistic ESLint warnings/errors from failing Vercel production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
