const KEY = "pv_user_email";

export function getSavedEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveEmail(email: string) {
  localStorage.setItem(KEY, email.trim().toLowerCase());
}

export function clearEmail() {
  localStorage.removeItem(KEY);
}

export function initialsFromEmail(email: string | null): string {
  if (!email) return "WK";
  const local = email.split("@")[0] || "u";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}
