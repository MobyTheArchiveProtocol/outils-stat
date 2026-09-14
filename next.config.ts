import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "render.worldofwarcraft.com" },
      { protocol: "https", hostname: "render-eu.worldofwarcraft.com" },
      { protocol: "https", hostname: "us.blizzard.com" },
      { protocol: "https", hostname: "eu.blizzard.com" },
    ],
  },
};

export default nextConfig;
