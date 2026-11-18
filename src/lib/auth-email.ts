import { saveEmail } from "@/lib/auth-local";
import { oauthCallbackUrl } from "@/lib/auth-oauth";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

export type AuthResult = { error?: string; info?: string };

function ensureSupabase(): ReturnType<typeof createBrowserClient> | null {
  if (!hasSupabaseEnv()) return null;
  return createBrowserClient();
}

function redirectTo(nextPath = "/"): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  return `${oauthCallbackUrl(origin)}?next=${encodeURIComponent(nextPath)}`;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = ensureSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    const msg = error.message || "Sign in failed.";
    if (/invalid login credentials/i.test(msg)) {
      return {
        error:
          "Wrong email or password. If you signed up with Google, use Continue with Google — or create an account under Sign up.",
      };
    }
    return { error: msg };
  }
  if (data.user?.email) saveEmail(data.user.email);
  return {};
}

export async function signUpWithPassword(
  email: string,
  password: string,
  nextPath = "/",
): Promise<AuthResult> {
  const supabase = ensureSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: redirectTo(nextPath),
    },
  });
  if (error) {
    const msg = error.message || "Sign up failed.";
    if (/signups not allowed|signup is disabled/i.test(msg)) {
      return {
        error:
          "Sign-ups are disabled in Supabase. Turn on Allow new users to sign up under Authentication → Providers → Email.",
      };
    }
    return { error: msg };
  }
  if (data.session?.user?.email) {
    saveEmail(data.session.user.email);
    return { info: "Account created — you're signed in." };
  }
  if (data.user?.email) saveEmail(data.user.email);
  return {
    info: "Check your email to confirm the account, then sign in.",
  };
}

export async function signInWithMagicLink(
  email: string,
  nextPath = "/",
  createUser = false,
): Promise<AuthResult> {
  const supabase = ensureSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo(nextPath),
      shouldCreateUser: createUser,
    },
  });
  if (error) {
    const msg = error.message || "Magic link failed.";
    if (/signups not allowed|signup is disabled/i.test(msg)) {
      return {
        error:
          "Sign-ups are disabled in Supabase. Turn on Allow new users to sign up under Authentication → Providers → Email.",
      };
    }
    return { error: msg };
  }
  saveEmail(email.trim().toLowerCase());
  return {
    info: createUser
      ? "Magic link sent — open it to create your account."
      : "Magic link sent — check your inbox.",
  };
}

export async function sendPasswordReset(
  email: string,
  nextPath = "/login",
): Promise<AuthResult> {
  const supabase = ensureSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: redirectTo(nextPath) },
  );
  if (error) return { error: error.message };
  return { info: "Password reset email sent — check your inbox." };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = ensureSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { info: "Password updated." };
}
