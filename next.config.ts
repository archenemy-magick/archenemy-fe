import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have TypeScript definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  images: {
    unoptimized: false,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
