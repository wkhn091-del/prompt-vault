import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/** Google / Apple / GitHub via Supabase OAuth — shown on the login page. */
export const SHOW_SOCIAL_LOGIN = true;

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

const PROD_APP_URL = "https://prompt-vault-tan.vercel.app";

function isLocalHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Callback must be on the SAME origin that started OAuth,
 * otherwise the PKCE code-verifier cookie is missing and login fails.
 * Localhost stays on localhost (add it in Supabase Redirect URLs for local).
 */
export function oauthCallbackUrl(origin?: string): string {
  const fromWindow =
    typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : "";
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || PROD_APP_URL;
  const candidate = (origin || fromWindow || configured).replace(/\/$/, "");
  // Prefer current browser origin so PKCE cookies match the return host
  const base = candidate || configured;
  return `${base}/auth/callback`;
}

export async function signInWithOAuthProvider(
  provider: OAuthProviderId,
  nextPath = "/",
): Promise<{ error?: string }> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const supabase = createBrowserClient();
    // Always same-tab origin — never hop localhost→prod mid-OAuth (breaks PKCE)
    const origin =
      typeof window !== "undefined"
        ? window.location.origin.replace(/\/$/, "")
        : PROD_APP_URL;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    if (isLocalHost(origin)) {
      // still ok if Redirect URL includes http://localhost:3000/auth/callback
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      const msg = error.message || "OAuth failed";
      if (/provider is not enabled/i.test(msg) || /unsupported provider/i.test(msg)) {
        return {
          error: `${provider} is not enabled in Supabase. Open Authentication → Providers, turn on ${provider}, paste Client ID + Secret, then save.`,
        };
      }
      if (/redirect/i.test(msg)) {
        return {
          error: `Redirect URL rejected. Add ${origin}/auth/callback under Supabase → Authentication → URL Configuration.`,
        };
      }
      return { error: msg };
    }

    if (!data?.url) {
      return {
        error: `${provider} returned no redirect URL. Enable it in Supabase Auth → Providers.`,
      };
    }

    // Small delay so PKCE verifier cookies are flushed before leaving the page
    await new Promise((r) => window.setTimeout(r, 50));
    window.location.assign(data.url);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "OAuth failed unexpectedly.",
    };
  }
}
