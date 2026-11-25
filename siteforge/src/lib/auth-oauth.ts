import { createBrowserClient, hasSupabaseEnv } from "./supabase";

export async function signInWithGoogle(
  nextPath = "/",
): Promise<{ error?: string }> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase לא מוגדר. הגדירו NEXT_PUBLIC_SUPABASE_URL ו־NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }
  try {
    const supabase = createBrowserClient();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin.replace(/\/$/, "")
        : "";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      return { error: error.message };
    }
    if (!data?.url) {
      return { error: "Google OAuth לא החזיר קישור. בדקו את הספק ב־Supabase." };
    }
    await new Promise((r) => window.setTimeout(r, 50));
    window.location.assign(data.url);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "התחברות נכשלה",
    };
  }
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv()) return;
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}
