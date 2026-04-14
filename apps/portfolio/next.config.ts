import type { NextConfig } from "next";

const salmonOrigin = process.env.SALMON_ORIGIN ?? "http://localhost:3001";

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
        destination: `${salmonOrigin}/maestros-del-salmon/:path*`,
      },
    ];
  },
};

export default nextConfig;
