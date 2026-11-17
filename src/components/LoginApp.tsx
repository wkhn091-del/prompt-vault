"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import {
  clearEmail,
  getSavedEmail,
  saveEmail,
} from "@/lib/auth-local";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { OAuthProviders } from "./OAuthProviders";
import { SiteHeader } from "./SiteHeader";

export function LoginApp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showOauthDev, setShowOauthDev] = useState(false);

  useEffect(() => {
    setSaved(getSavedEmail());
    try {
      const params = new URLSearchParams(window.location.search);
      setShowOauthDev(params.get("oauth") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    saveEmail(value);
    setSaved(value);
    setDone(true);
    setError(null);
    setTimeout(() => router.push("/mcp"), 700);
  }

  async function signOut() {
    clearEmail();
    setSaved(null);
    setDone(false);
    setEmail("");
    if (hasSupabaseEnv()) {
      try {
        await createBrowserClient().auth.signOut();
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,255,255,0.07),transparent_55%)]"
        aria-hidden
      />

      <SiteHeader active="login" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-72px)] max-w-[480px] flex-col justify-center px-4 py-16 sm:px-6">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#0c0c0e] p-7 sm:p-9">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
            Account
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
            Sign in with email
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/45">
            Optional for now — email unlocks MCP preferences on this device.
            Google / Apple / GitHub are ready behind the scenes.
          </p>

          {saved && !done ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-[12px] text-white/40">Signed in as</p>
                <p className="mt-1 text-[15px] font-medium text-white">{saved}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/mcp"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[13px] font-semibold text-black transition hover:bg-zinc-200"
                >
                  Connect MCP tools
                  <ArrowRight className="size-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full border border-white/[0.1] px-4 py-3 text-[13px] font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
                    className="h-12 w-full rounded-full border border-white/[0.1] bg-black/40 py-3 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                  />
                </div>
              </label>
              {error && (
                <p className="text-[12px] text-amber-200/90">{error}</p>
              )}
              {done && (
                <p className="text-[12px] text-emerald-300/90">
                  Saved — opening MCP…
                </p>
              )}
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-black transition hover:bg-zinc-200"
              >
                Continue
                <ArrowRight className="size-3.5" />
              </button>
              {/* Social OAuth wired; hidden until SHOW_SOCIAL_LOGIN (or ?oauth=1). */}
              <OAuthProviders nextPath="/mcp" forceShow={showOauthDev} />
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[12px] text-white/30">
          Sign-in is optional. No password for email — social providers stay
          hidden until enabled.
        </p>
      </main>
    </div>
  );
}
