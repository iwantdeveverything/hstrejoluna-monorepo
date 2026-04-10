import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/maestros-del-salmon/:path*",
        destination: "http://localhost:3001/maestros-del-salmon/:path*",
      },
    ];
  },
};

export default nextConfig;
