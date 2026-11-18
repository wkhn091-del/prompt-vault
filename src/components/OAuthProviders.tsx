"use client";

import { useState } from "react";
import {
  OAUTH_PROVIDERS,
  SHOW_SOCIAL_LOGIN,
  signInWithOAuthProvider,
  type OAuthProviderId,
} from "@/lib/auth-oauth";

function ProviderIcon({ id }: { id: OAuthProviderId }) {
  if (id === "google") {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }
  if (id === "apple") {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px] fill-white" aria-hidden>
        <path d="M16.7 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.3-.9-2.5-3.4zM14.4 5.5c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-white" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

function buttonClass(id: OAuthProviderId): string {
  // Rectangular — same language as luxury product auth (not pills).
  const base =
    "inline-flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] text-[13px] font-medium tracking-[0.01em] transition disabled:opacity-50";
  if (id === "google") {
    return `${base} border border-[#e8e4dc] bg-[#faf8f5] text-[#1c1917] hover:bg-white`;
  }
  if (id === "apple") {
    return `${base} border border-white/[0.18] bg-[#111110] text-white hover:border-white/30 hover:bg-[#181816]`;
  }
  return `${base} border border-white/[0.14] bg-transparent text-white hover:border-white/28 hover:bg-white/[0.04]`;
}

type OAuthProvidersProps = {
  nextPath?: string;
  forceShow?: boolean;
  /** Hide the “or continue with” rule (when OAuth is the primary action). */
  hideDivider?: boolean;
};

export function OAuthProviders({
  nextPath = "/",
  forceShow = false,
  hideDivider = false,
}: OAuthProvidersProps) {
  const [busy, setBusy] = useState<OAuthProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!SHOW_SOCIAL_LOGIN && !forceShow) {
    return null;
  }

  async function onClick(id: OAuthProviderId) {
    setError(null);
    setBusy(id);
    try {
      const result = await signInWithOAuthProvider(id, nextPath);
      if (result.error) {
        setError(result.error);
        setBusy(null);
      }
      window.setTimeout(() => setBusy(null), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "OAuth failed");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2.5" data-oauth-ready="true">
      {!hideDivider && (
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-[var(--login-panel-bg,#0c0b0a)] px-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[#c4a574]/55">
            or continue with
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#c4a574]/25 to-transparent" />
        </div>
      )}
      {OAUTH_PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={busy !== null}
          onClick={() => void onClick(provider.id)}
          className={buttonClass(provider.id)}
        >
          <ProviderIcon id={provider.id} />
          {busy === provider.id ? "Redirecting…" : provider.label}
        </button>
      ))}
      {error && (
        <p className="rounded-2xl border border-[#c4a574]/25 bg-[#c4a574]/10 px-3 py-2 text-[12px] leading-relaxed text-[#f0e6d4]">
          {error}
        </p>
      )}
    </div>
  );
}
