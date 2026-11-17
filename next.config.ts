import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the app simple — Cache Components + partial prefetch caused
  // repeated RSC/Suspense remounts that looked like a full page refresh.
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.higgs.ai" },
      { protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" },
    ],
  },
};

export default nextConfig;
