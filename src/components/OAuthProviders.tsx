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
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
        />
        <path
          fill="#34A853"
          d="M5.3 14.3 4.4 15l-2.7 2.1C3.5 20.5 7.4 23 12 23c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-6-4.4z"
        />
        <path
          fill="#4A90E2"
          d="M5.3 9.7C5 10.4 4.8 11.2 4.8 12s.2 1.6.5 2.3c.9-2.5 3.2-4.4 6-4.4 1.5 0 2.8.5 3.8 1.4l2.8-2.8C15.9 6.8 14 6 12 6 7.4 6 3.5 8.5 1.7 12.1l3.6 2.6z"
        />
        <path
          fill="#FBBC05"
          d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.9 1.4 15.2 0 12 0 7.4 0 3.5 2.5 1.7 6.1l3.6 2.8C6.2 6.6 8.7 4.8 12 4.8z"
        />
      </svg>
    );
  }
  if (id === "apple") {
    return (
      <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
        <path d="M16.7 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.3-.9-2.5-3.4zM14.4 5.5c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

type OAuthProvidersProps = {
  nextPath?: string;
  /** Force-render even when SHOW_SOCIAL_LOGIN is false (dev / ?oauth=1). */
  forceShow?: boolean;
};

export function OAuthProviders({
  nextPath = "/mcp",
  forceShow = false,
}: OAuthProvidersProps) {
  const [busy, setBusy] = useState<OAuthProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!SHOW_SOCIAL_LOGIN && !forceShow) {
    return null;
  }

  async function onClick(id: OAuthProviderId) {
    setError(null);
    setBusy(id);
    const result = await signInWithOAuthProvider(id, nextPath);
    if (result.error) {
      setError(result.error);
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2" data-oauth-ready="true">
      <div className="relative py-1 text-center">
        <span className="relative z-10 bg-[#0c0c0e] px-3 text-[11px] uppercase tracking-[0.14em] text-white/30">
          or
        </span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.08]" />
      </div>
      {OAUTH_PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={busy !== null}
          onClick={() => void onClick(provider.id)}
          className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-[13px] font-medium text-white transition hover:bg-white/[0.07] disabled:opacity-50"
        >
          <ProviderIcon id={provider.id} />
          {busy === provider.id ? "Redirecting…" : provider.label}
        </button>
      ))}
      {error && <p className="text-[12px] text-amber-200/90">{error}</p>}
    </div>
  );
}
