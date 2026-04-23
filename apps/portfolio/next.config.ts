import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

const salmonOrigin = process.env.SALMON_ORIGIN ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: ["@hstrejoluna/ui"],
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

export default withNextIntl(nextConfig);
