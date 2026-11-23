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
 * - frame-src 'self': Animations embeds /kits/*.html in sandboxed iframes
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
  "frame-src 'self'",
].join("; ");

/** Kit HTML must be frameable by this app (Browse / live preview). */
const kitEmbedCsp = [
  "default-src 'self' data: blob:",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
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

const kitEmbedHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: kitEmbedCsp },
];

/** Standalone demo HTML (Embers / Krung): fonts, Higgs images, CloudFront video. */
const demoPageCsp = [
  "default-src 'self' data: blob:",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.cloudfront.net https://d8j0ntlcm91z4.cloudfront.net https://images.higgs.ai",
  "worker-src 'self' blob:",
].join("; ");

const demoPageHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: demoPageCsp },
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
        source: "/embers-foundry.html",
        headers: demoPageHeaders,
      },
      {
        source: "/krung-travel.html",
        headers: demoPageHeaders,
      },
      // Exclude /kits — those need SAMEORIGIN framing for live preview
      {
        source:
          "/((?!kits(?:/|$)|embers-foundry\\.html$|krung-travel\\.html$).*)",
        headers: securityHeaders,
      },
      {
        source: "/kits/:path*",
        headers: kitEmbedHeaders,
      },
    ];
  },
};

export default nextConfig;
