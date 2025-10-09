/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: "export" if it's still there

  // Add these optimizations
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },

  // Increase memory limit for build
  env: {
    NODE_OPTIONS: "--max-old-space-size=4096",
  },
};

module.exports = nextConfig;
