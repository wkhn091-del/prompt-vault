/** Prompt Vault (auth / animations hub). */
export const VAULT_URL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_VAULT_URL?.replace(/\/$/, "")) ||
  "https://prompt-vault-tan.vercel.app";

/** Send learner to Vault login, then back here (SSO handoff). */
export function vaultLoginUrl(returnTo?: string): string {
  const next =
    returnTo ||
    (typeof window !== "undefined" ? window.location.href : "/");
  return `${VAULT_URL}/login?next=${encodeURIComponent(next)}`;
}
