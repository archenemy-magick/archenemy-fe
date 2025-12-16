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
  async redirects() {
    return [
      // Redirect old deck builder to new Archenemy decks section
      {
        source: "/decks/builder",
        destination: "/archenemy/decks/builder",
        permanent: true, // 301 redirect
      },
      {
        source: "/decks/builder/:path*",
        destination: "/archenemy/decks/builder/:path*",
        permanent: true,
      },

      // Redirect old /decks to new structure
      // This should come AFTER the /decks/builder redirect to avoid conflicts
      {
        source: "/decks",
        destination: "/archenemy/decks",
        permanent: true,
      },
      {
        source: "/decks/:path*",
        destination: "/archenemy/decks/:path*",
        permanent: true,
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
