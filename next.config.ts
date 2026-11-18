import type { NextConfig } from "next";

const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  ) || "*.supabase.co";

/**
 * CSP hosts allowed for existing features:
 * - connect-src: Supabase Auth/API/Realtime
 * - img-src / media-src: Higgs, CloudFront, Supabase storage, Motionsites R2
 * - script/style: Next.js + inline (srcdoc previews run under sandbox alone)
 * - frame-src: none (srcdoc iframes don't need external frame-src)
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.higgs.ai https://*.cloudfront.net https://*.supabase.co https://*.r2.dev",
  "media-src 'self' blob: https://*.cloudfront.net https://*.supabase.co https://*.r2.dev https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.supabase.co wss://*.supabase.co`,
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
