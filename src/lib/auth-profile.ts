const NAME_KEY = "pv_profile_full_name";
const PHONE_KEY = "pv_profile_phone";

export type AuthProfile = {
  fullName: string;
  phone: string;
};

export function getSavedProfile(): AuthProfile {
  if (typeof window === "undefined") return { fullName: "", phone: "" };
  return {
    fullName: localStorage.getItem(NAME_KEY)?.trim() || "",
    phone: localStorage.getItem(PHONE_KEY)?.trim() || "",
  };
}

export function saveProfile(profile: AuthProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, profile.fullName.trim());
  localStorage.setItem(PHONE_KEY, profile.phone.trim());
  // Cookies for server callback (user_metadata sync after OAuth)
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `pv_full_name=${encodeURIComponent(profile.fullName.trim())}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `pv_phone=${encodeURIComponent(profile.phone.trim())}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 9;
}

export function profileComplete(profile: AuthProfile): boolean {
  return profile.fullName.trim().length >= 2 && isValidPhone(profile.phone);
}
