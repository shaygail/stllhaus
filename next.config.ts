import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/**",
        search: "**",
      },
    ],
  },
};

export default nextConfig;
