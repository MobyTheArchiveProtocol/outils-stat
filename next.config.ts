import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.worldofwarcraft.com" },
      { protocol: "https", hostname: "**.blizzard.com" },
      { protocol: "https", hostname: "static.wikia.nocookie.net" },
    ],
  },
};

export default nextConfig;
