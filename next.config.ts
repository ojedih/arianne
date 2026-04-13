import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow local /public images with no extra config needed (default)
    // Add external domains here if needed in the future:
    // remotePatterns: [{ protocol: "https", hostname: "your-cdn.com" }],
    unoptimized: false,
  },
  // Improve mobile performance
  compress: true,
};

export default nextConfig;
