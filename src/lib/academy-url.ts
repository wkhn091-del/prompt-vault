/** SiteForge Academy (learning site) — override with NEXT_PUBLIC_ACADEMY_URL. */
export const ACADEMY_URL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ACADEMY_URL?.replace(/\/$/, "")) ||
  "https://siteforge-mu-five.vercel.app";
