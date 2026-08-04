import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js recommends remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Allow accessing the dev server from your LAN IP
  allowedDevOrigins: ["192.168.1.4"],
};

export default nextConfig;