import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't send "X-Powered-By: Next.js" on every response.
  poweredByHeader: false,
  // Keep source maps out of production builds (this is Next's default; stated so it stays off).
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
