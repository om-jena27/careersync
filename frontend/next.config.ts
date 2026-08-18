import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js to load images from any external domain
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
