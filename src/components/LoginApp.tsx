"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
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
import {
  getSavedProfile,
  profileComplete,
  saveProfile,
  type AuthProfile,
} from "@/lib/auth-profile";
import { isExternalNext, safeNextPath } from "@/lib/safe-next";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { OAuthProviders } from "./OAuthProviders";

type Mode = "signin" | "signup";
type Method = "password" | "magic" | "reset";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [realSession, setRealSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [profile, setProfile] = useState<AuthProfile>({
    fullName: "",
    phone: "",
  });
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const savedProfile = getSavedProfile();
    setProfile(savedProfile);
    setProfileReady(profileComplete(savedProfile));
  }, []);

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
    setInfo(
      isExternalNext(nextPath)
        ? "Signed in — opening academy…"
        : "Signed in — entering vault…",
    );
    setTimeout(() => {
      if (isExternalNext(nextPath)) {
        window.location.assign(nextPath);
      } else {
        router.push(nextPath);
      }
    }, 500);
  }

  function commitProfile(): boolean {
    if (isAdminEmail(email) || isAdminEmail(saved)) {
      saveProfile(profile);
      setProfileReady(true);
      return true;
    }
    if (!profileComplete(profile)) {
      setError("Enter your full name and phone number before Connect.");
      return false;
    }
    saveProfile(profile);
    setProfileReady(true);
    setError(null);
    return true;
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

    if (!recoveryMode && !commitProfile()) return;

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
        setTimeout(() => {
          if (isExternalNext(nextPath)) window.location.assign(nextPath);
          else router.push(nextPath);
        }, 900);
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
        await syncProfileToSession();
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
          await syncProfileToSession();
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

  async function syncProfileToSession() {
    if (!hasSupabaseEnv() || !profileComplete(profile)) return;
    try {
      const supabase = createBrowserClient();
      await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName.trim(),
          phone: profile.phone.trim(),
        },
      });
    } catch {
      /* best-effort — cookies still carry profile for callback */
    }
  }

  function onOAuthBeforeStart(): boolean {
    return commitProfile();
  }

  const showSignedIn =
    realSession &&
    Boolean(saved) &&
    !recoveryMode &&
    !busy &&
    !info?.includes("entering");

  const headline = recoveryMode
    ? "Set a new password"
    : method === "reset"
      ? "Reset password"
      : method === "magic"
        ? "Magic link"
        : showSignedIn
          ? "You're in"
          : mode === "signup"
            ? "Create your account"
            : "Welcome back";

  const subcopy = recoveryMode
    ? "Choose a new password (12+ characters)."
    : method === "reset"
      ? "Enter your email and we’ll send a reset link."
      : method === "magic"
        ? "We’ll email a one-click sign-in link — no password."
        : showSignedIn
          ? "Continue into the vault, or sign out."
          : mode === "signup"
            ? "Create an account with email, or use a provider below."
            : "Sign in with email and password.";

  const fieldClass =
    "h-12 w-full rounded-xl border border-[#d4af7a]/12 bg-black/45 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#d4af7a]/50 focus:bg-black/60 focus:ring-1 focus:ring-[#d4af7a]/25";
  const passwordFieldClass = `${fieldClass} pr-12`;

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white"
      style={
        {
          "--login-panel-bg": "#0a0908",
          background:
            "radial-gradient(90% 70% at 78% 42%, rgba(212,175,122,0.14) 0%, transparent 55%), radial-gradient(110% 85% at 8% 8%, #1c1610 0%, #0a0908 38%, #050504 72%, #030302 100%)",
        } as CSSProperties
      }
    >
      <div className="vault-grain" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,122,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,122,0.045) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at 70% 45%, black 15%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-12%] top-[-8%] h-[560px] w-[560px] rounded-full bg-[#d4af7a]/[0.11] blur-[140px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-8%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#f0d9a8]/[0.07] blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-12%] right-[10%] h-[380px] w-[380px] rounded-full bg-[#8b6914]/[0.1] blur-[130px]"
        aria-hidden
      />

      <div
        className="relative z-10 mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.1fr_0.9fr]"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <section className="relative hidden flex-col justify-between px-10 py-14 lg:flex xl:px-16">
          <Link href="/login" className="inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-m.svg" alt="" className="size-10" />
            <span className="font-[family-name:var(--font-syne)] text-[22px] font-bold tracking-[-0.04em]">
              Prompt Vault
            </span>
          </Link>

          <div className="max-w-lg">
            <p className="font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.28em] text-[#e4c9a0]/75">
              Private motion atelier
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-syne)] text-[clamp(2.6rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-white">
              Prompt Vault
            </h1>
            <p className="mt-3 font-[family-name:var(--font-syne)] text-[clamp(1.35rem,2.4vw,1.85rem)] font-semibold leading-snug tracking-[-0.03em] text-[#e8dcc8]/55">
              Paste prompts. Ship motion.
            </p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/40">
              A curated vault of AI website animations — copy the prompt, take
              the clip, hand it to any model.
            </p>
          </div>

          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] text-[#d4af7a]/35">
            Secure access · email · Google · Apple · GitHub
          </p>
        </section>

        <section className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-m.svg" alt="" className="size-8" />
            <span className="font-[family-name:var(--font-syne)] text-[18px] font-bold tracking-[-0.03em]">
              Prompt Vault
            </span>
          </div>

          <div
            className="login-panel relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[24px] border border-[#d4af7a]/22 bg-[#0a0908]/94 p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95),0_0_80px_-48px_rgba(212,175,122,0.35),0_0_0_1px_rgba(240,217,168,0.06)_inset] backdrop-blur-2xl sm:p-8"
            style={{ ["--login-panel-bg" as string]: "#0a0908" }}
          >
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#f0d9a8]/65 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#d4af7a]/14 blur-3xl"
              aria-hidden
            />

            <h2 className="font-[family-name:var(--font-syne)] text-[26px] font-bold tracking-[-0.04em] text-white sm:text-[28px]">
              {headline}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/42">
              {subcopy}
            </p>

            {showSignedIn && !recoveryMode ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-[#d4af7a]/15 bg-white/[0.03] px-4 py-3.5">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[#d4af7a]/60">
                    Signed in as
                  </p>
                  <p className="mt-1.5 text-[15px] font-medium text-white">
                    {saved}
                  </p>
                </div>
                {isExternalNext(nextPath) ? (
                  <a
                    href={nextPath}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d9a8] to-[#d4af7a] px-4 py-3.5 text-[13px] font-semibold text-[#1a140c] transition hover:brightness-105"
                  >
                    Open academy
                    <ArrowRight className="size-3.5" />
                  </a>
                ) : (
                  <Link
                    href={nextPath}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d9a8] to-[#d4af7a] px-4 py-3.5 text-[13px] font-semibold text-[#1a140c] transition hover:brightness-105"
                  >
                    Enter vault
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="w-full rounded-full border border-white/[0.1] px-4 py-3 text-[13px] font-medium text-white/55 transition hover:border-white/20 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                {!recoveryMode && (
                  <div className="mt-7 grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-black/35 p-1">
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
                            ? "bg-gradient-to-b from-[#f0d9a8] to-[#d4af7a] text-[#1a140c] shadow-[0_8px_24px_-12px_rgba(212,175,122,0.75)]"
                            : "text-white/40 hover:text-white/75"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => void onSubmit(e)}
                  className="mt-5 space-y-4"
                >
                  {!recoveryMode && (
                    <>
                      <label className="block">
                        <span className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/40">
                          Full name
                        </span>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d4af7a]/45" />
                          <input
                            type="text"
                            autoComplete="name"
                            required={!isAdminEmail(email)}
                            value={profile.fullName}
                            onChange={(e) => {
                              setProfile((p) => ({
                                ...p,
                                fullName: e.target.value,
                              }));
                              setProfileReady(false);
                            }}
                            placeholder="Your name"
                            className={fieldClass}
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/40">
                          Phone
                        </span>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d4af7a]/45" />
                          <input
                            type="tel"
                            autoComplete="tel"
                            required={!isAdminEmail(email)}
                            value={profile.phone}
                            onChange={(e) => {
                              setProfile((p) => ({
                                ...p,
                                phone: e.target.value,
                              }));
                              setProfileReady(false);
                            }}
                            placeholder="+972…"
                            className={fieldClass}
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/40">
                          Email
                        </span>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d4af7a]/45" />
                          <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@studio.com"
                            className={fieldClass}
                          />
                        </div>
                      </label>
                    </>
                  )}

                  {method === "password" && !recoveryMode && (
                    <label className="block">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/40">
                          Password
                          {mode === "signup" ? " · 12+" : ""}
                        </span>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setMethod("reset");
                              setError(null);
                              setInfo(null);
                            }}
                            className="text-[12px] font-medium text-[#d4af7a]/80 transition hover:text-[#f0d9a8]"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d4af7a]/45" />
                        <input
                          type={showPassword ? "text" : "password"}
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
                          className={passwordFieldClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-[#d4af7a]"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </label>
                  )}

                  {recoveryMode && (
                    <label className="block">
                      <span className="mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white/40">
                        New password · 12+
                      </span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d4af7a]/45" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          minLength={12}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={passwordFieldClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-[#d4af7a]"
                          aria-label={
                            showNewPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </label>
                  )}

                  {method === "magic" && !recoveryMode && (
                    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-white/40">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#d4af7a]/50" />
                      Check your inbox after sending — the link signs you in
                      instantly.
                    </p>
                  )}

                  {error && (
                    <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-100/95">
                      {error}
                    </p>
                  )}
                  {info && (
                    <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-emerald-100/95">
                      {info}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f0d9a8] to-[#d4af7a] text-[13px] font-semibold text-[#1a140c] shadow-[0_12px_32px_-14px_rgba(212,175,122,0.9)] transition hover:brightness-105 disabled:opacity-60"
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

                {!recoveryMode && method !== "password" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("password");
                      setError(null);
                      setInfo(null);
                    }}
                    className="mt-4 w-full text-center text-[12px] font-medium text-white/45 transition hover:text-white/75"
                  >
                    ← Back to password sign in
                  </button>
                )}

                {!recoveryMode && method === "password" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("magic");
                      setError(null);
                      setInfo(null);
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[12px] font-medium text-white/40 transition hover:text-[#d4af7a]/90"
                  >
                    <Sparkles className="size-3.5" />
                    Sign in with magic link instead
                  </button>
                )}

                {!recoveryMode && (
                  <div className="mt-7">
                    {!profileReady && !isAdminEmail(email) && (
                      <p className="mb-3 text-center text-[11px] text-white/35">
                        Name + phone required before Connect
                      </p>
                    )}
                    <OAuthProviders
                      nextPath={nextPath}
                      onBeforeStart={onOAuthBeforeStart}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
