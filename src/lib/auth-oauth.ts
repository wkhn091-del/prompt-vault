import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/**
 * Social login is wired (Google / Apple / GitHub via Supabase OAuth)
 * but kept off the UI until ready. Flip to true to show the buttons.
 * Email login stays optional either way.
 */
export const SHOW_SOCIAL_LOGIN = false;

export type OAuthProviderId = "google" | "apple" | "github";

export type OAuthProvider = {
  id: OAuthProviderId;
  label: string;
};

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "github", label: "Continue with GitHub" },
];

export function oauthCallbackUrl(origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://prompt-vault-tan.vercel.app";
  return `${base}/auth/callback`;
}

export async function signInWithOAuthProvider(
  provider: OAuthProviderId,
  nextPath = "/mcp",
): Promise<{ error?: string }> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = createBrowserClient();
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const redirectTo = `${oauthCallbackUrl(origin)}?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });

  if (error) return { error: error.message };
  if (data.url && typeof window !== "undefined") {
    window.location.assign(data.url);
  }
  return {};
}
