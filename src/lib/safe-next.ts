import { ACADEMY_URL } from "./academy-url";

/**
 * Allow same-origin paths, or an absolute Academy URL for SSO handoff.
 */
export function safeNextPath(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    if (raw.startsWith("/login") || raw.startsWith("/auth/")) return "/";
    return raw;
  }
  try {
    const u = new URL(raw);
    const academy = new URL(ACADEMY_URL);
    if (u.origin === academy.origin) return u.toString();
  } catch {
    /* ignore */
  }
  return "/";
}

export function isExternalNext(next: string): boolean {
  return /^https?:\/\//i.test(next);
}
