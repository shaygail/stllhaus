import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /** Avoid picking a parent folder when another package-lock.json exists above this project. */
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    localPatterns: [
      {
        pathname: "/api/**",
        search: "**",
      },
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
};

export default nextConfig;