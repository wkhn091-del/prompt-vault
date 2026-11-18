/** Public admin allow-list for UI gating (must match server ADMIN_EMAILS). */
export function publicAdminEmails(): string[] {
  const fromPublic = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const fromServer =
    typeof window === "undefined" ? process.env.ADMIN_EMAILS || "" : "";
  return `${fromPublic},${fromServer}`
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = publicAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}
