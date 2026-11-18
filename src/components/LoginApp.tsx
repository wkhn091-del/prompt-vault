"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import {
  sendPasswordReset,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  updatePassword,
} from "@/lib/auth-email";
import {
  clearEmail,
  getSavedEmail,
  saveEmail,
} from "@/lib/auth-local";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { OAuthProviders } from "./OAuthProviders";

type Mode = "signin" | "signup";
type Method = "password" | "magic" | "reset";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return "/";
  return raw;
}

export function LoginApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const [mode, setMode] = useState<Mode>("signin");
  const [method, setMethod] = useState<Method>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [realSession, setRealSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function hydrate() {
      const local = getSavedEmail();
      if (!cancelled) setSaved(local);

      const urlError = searchParams.get("error");
      if (urlError && !cancelled) {
        setError(urlError);
      }

      if (searchParams.get("type") === "recovery") {
        if (!cancelled) {
          setRecoveryMode(true);
          setMethod("reset");
        }
      }

      if (!hasSupabaseEnv()) return;
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        const sessionEmail = data.session?.user?.email;
        if (sessionEmail) {
          saveEmail(sessionEmail);
          if (!cancelled) {
            setSaved(sessionEmail);
            setRealSession(true);
          }
        } else if (!cancelled) {
          setRealSession(false);
        }

        const { data: sub } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
              setRecoveryMode(true);
              setMethod("reset");
            }
            const e = session?.user?.email;
            if (e) {
              saveEmail(e);
              setSaved(e);
              setRealSession(true);
            } else if (event === "SIGNED_OUT") {
              setRealSession(false);
            }
          },
        );
        unsub = () => sub.subscription.unsubscribe();
      } catch {
        /* ignore */
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [searchParams]);

  async function signOut() {
    clearEmail();
    setSaved(null);
    setRealSession(false);
    setEmail("");
    setPassword("");
    setError(null);
    setInfo(null);
    setRecoveryMode(false);
    if (hasSupabaseEnv()) {
      try {
        await createBrowserClient().auth.signOut();
      } catch {
        /* ignore */
      }
    }
  }

  function goAfterSignIn() {
    setInfo("Signed in — entering vault…");
    setTimeout(() => router.push(nextPath), 500);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const value = email.trim().toLowerCase();
    if (!isValidEmail(value)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!hasSupabaseEnv()) {
      setError("Auth is not configured (missing Supabase env).");
      return;
    }

    setBusy(true);
    try {
      if (recoveryMode && method === "reset") {
        const result = await updatePassword(newPassword);
        if (result.error) {
          setError(result.error);
          return;
        }
        setInfo(result.info ?? "Password updated.");
        setRecoveryMode(false);
        setNewPassword("");
        setTimeout(() => router.push(nextPath), 900);
        return;
      }

      if (method === "password" && mode === "signin") {
        if (!password) {
          setError("Enter your password.");
          return;
        }
        const result = await signInWithPassword(value, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSaved(value);
        setRealSession(true);
        goAfterSignIn();
        return;
      }

      if (method === "password" && mode === "signup") {
        if (password.length < 12) {
          setError("Password must be at least 12 characters.");
          return;
        }
        const result = await signUpWithPassword(value, password, nextPath);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.info?.includes("signed in")) {
          setSaved(value);
          setRealSession(true);
          goAfterSignIn();
          return;
        }
        setInfo(result.info ?? "Check your email to confirm.");
        return;
      }

      if (method === "magic") {
        const result = await signInWithMagicLink(
          value,
          nextPath,
          mode === "signup",
        );
        if (result.error) {
          setError(result.error);
          return;
        }
        setInfo(result.info ?? "Check your email.");
        return;
      }

      if (method === "reset") {
        const result = await sendPasswordReset(value, "/login");
        if (result.error) {
          setError(result.error);
          return;
        }
        setInfo(result.info ?? "Check your email.");
      }
    } finally {
      setBusy(false);
    }
  }

  const showSignedIn =
    realSession &&
    Boolean(saved) &&
    !recoveryMode &&
    !busy &&
    !info?.includes("entering");

  const headline = recoveryMode
    ? "Set a new password"
    : showSignedIn
      ? "You're in"
      : mode === "signup"
        ? "Create your account"
        : "Welcome back";

  const subcopy = recoveryMode
    ? "Choose a new password (12+ characters)."
    : showSignedIn
      ? "Continue into the vault, or sign out."
      : mode === "signup"
        ? "Register with email or Google to enter Prompt Vault."
        : "Sign in with Google, or email and password.";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050506] text-white">
      <div className="vault-grain" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_20%,rgba(56,229,255,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_85%_10%,rgba(255,90,120,0.1),transparent_50%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(255,255,255,0.04),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-[rgba(56,229,255,0.06)] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-[380px] w-[380px] rounded-full bg-[rgba(255,80,110,0.07)] blur-[110px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative hidden flex-col justify-between px-10 py-12 lg:flex xl:px-14">
          <Link href="/login" className="inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-m.svg" alt="" className="size-10" />
            <span className="font-[family-name:var(--font-syne)] text-[22px] font-bold tracking-[-0.04em]">
              Prompt Vault
            </span>
          </Link>

          <div className="max-w-md">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/40">
              Motion library
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-syne)] text-[48px] font-bold leading-[1.05] tracking-[-0.05em] text-white">
              Paste prompts.
              <br />
              <span className="text-white/55">Ship motion.</span>
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-white/45">
              Your private vault of AI website animations — copy prompts, grab
              the video, and hand it to any model.
            </p>
          </div>

          <p className="text-[12px] text-white/30">
            Secure sign-in · Google, email, or magic link
          </p>
        </section>

        {/* Auth panel */}
        <section className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-m.svg" alt="" className="size-8" />
            <span className="font-[family-name:var(--font-syne)] text-[18px] font-bold tracking-[-0.03em]">
              Prompt Vault
            </span>
          </div>

          <div className="login-panel relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#0b0b0d]/90 p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
              aria-hidden
            />

            <h2 className="font-[family-name:var(--font-syne)] text-[28px] font-bold tracking-[-0.04em] text-white">
              {headline}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/45">
              {subcopy}
            </p>

            {showSignedIn && !recoveryMode ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-[12px] text-white/40">Signed in as</p>
                  <p className="mt-1 text-[15px] font-medium text-white">
                    {saved}
                  </p>
                </div>
                <Link
                  href={nextPath}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3.5 text-[13px] font-semibold text-black transition hover:bg-zinc-200"
                >
                  Enter vault
                  <ArrowRight className="size-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-full rounded-full border border-white/[0.1] px-4 py-3 text-[13px] font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                {!recoveryMode && (
                  <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-black/40 p-1">
                    {(
                      [
                        { id: "signin", label: "Sign in" },
                        { id: "signup", label: "Sign up" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMode(item.id);
                          setMethod("password");
                          setError(null);
                          setInfo(null);
                        }}
                        className={`rounded-full py-2.5 text-[13px] font-semibold transition ${
                          mode === item.id
                            ? "bg-white text-black shadow-sm"
                            : "text-white/45 hover:text-white/80"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {!recoveryMode && (
                  <div className="mt-6">
                    <OAuthProviders nextPath={nextPath} hideDivider />
                  </div>
                )}

                {!recoveryMode && (
                  <div className="relative my-6 text-center">
                    <span className="relative z-10 bg-[#0b0b0d] px-3 text-[11px] uppercase tracking-[0.14em] text-white/30">
                      or with email
                    </span>
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.08]" />
                  </div>
                )}

                {!recoveryMode && (
                  <div className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-white/[0.06] bg-black/25 p-1 scrollbar-none">
                    {(
                      [
                        { id: "password", label: "Password" },
                        { id: "magic", label: "Magic link" },
                        { id: "reset", label: "Reset" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMethod(item.id);
                          setError(null);
                          setInfo(null);
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                          method === item.id
                            ? "bg-white/15 text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => void onSubmit(e)}
                  className="space-y-4"
                >
                  {!recoveryMode && (
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-medium text-white/45">
                        Email
                      </span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                        <input
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@studio.com"
                          className="h-12 w-full rounded-full border border-white/[0.1] bg-black/50 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                        />
                      </div>
                    </label>
                  )}

                  {method === "password" && !recoveryMode && (
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-medium text-white/45">
                        Password
                        {mode === "signup" ? " (12+ chars)" : ""}
                      </span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                        <input
                          type="password"
                          autoComplete={
                            mode === "signup"
                              ? "new-password"
                              : "current-password"
                          }
                          required
                          minLength={mode === "signup" ? 12 : 1}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="h-12 w-full rounded-full border border-white/[0.1] bg-black/50 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                        />
                      </div>
                    </label>
                  )}

                  {recoveryMode && (
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-medium text-white/45">
                        New password (12+)
                      </span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                        <input
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={12}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="h-12 w-full rounded-full border border-white/[0.1] bg-black/50 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                        />
                      </div>
                    </label>
                  )}

                  {method === "magic" && !recoveryMode && (
                    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-white/40">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-white/30" />
                      {mode === "signup"
                        ? "We’ll email a link to create your account — no password needed."
                        : "We’ll email a one-click sign-in link."}
                    </p>
                  )}

                  {method === "reset" && !recoveryMode && (
                    <p className="text-[12px] leading-relaxed text-white/40">
                      We’ll send a reset link to your email.
                    </p>
                  )}

                  {error && (
                    <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-100/95">
                      {error}
                    </p>
                  )}
                  {info && (
                    <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-emerald-100/95">
                      {info}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-3.5" />
                    )}
                    {busy
                      ? "Working…"
                      : recoveryMode
                        ? "Save password"
                        : method === "magic"
                          ? "Send magic link"
                          : method === "reset"
                            ? "Send reset email"
                            : mode === "signup"
                              ? "Create account"
                              : "Sign in"}
                  </button>
                </form>
              </>
            )}
          </div>

          {!showSignedIn && !recoveryMode && (
            <p className="mx-auto mt-6 max-w-[420px] text-center text-[12px] leading-relaxed text-white/30">
              Already use Google on this project? Skip the password — hit{" "}
              <span className="text-white/55">Continue with Google</span>.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
