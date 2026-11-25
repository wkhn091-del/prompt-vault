"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AuthBar() {
  const { ready, email, fullName, isAdmin, signInGoogle, signInViaVault, signOut } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <span className="hidden text-[11px] text-white/35 sm:inline">…</span>
    );
  }

  if (email) {
    const label = fullName?.trim() || email.split("@")[0];
    return (
      <div className="flex items-center gap-1.5">
        {isAdmin && (
          <span className="rounded-lg bg-[#ff7a45]/15 px-2 py-1 text-[10px] font-bold text-[#ffb08a] ring-1 ring-[#ff7a45]/30">
            Admin
          </span>
        )}
        <span
          className="hidden max-w-[120px] truncate text-[12px] text-white/55 sm:inline"
          title={email}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-xl px-2 py-1.5 text-[11px] font-semibold text-white/45 transition hover:bg-white/[0.05] hover:text-white/80"
        >
          יציאה
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setError(null);
          setBusy(true);
          void signInGoogle().finally(() => setBusy(false));
        }}
        className="rounded-xl bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-bold text-[#ffe0a8] ring-1 ring-[#ff7a45]/25 transition hover:bg-[#ff7a45]/15 disabled:opacity-50"
      >
        {busy ? "…" : "Google"}
      </button>
      <button
        type="button"
        onClick={signInViaVault}
        className="hidden rounded-xl px-2 py-1.5 text-[11px] font-semibold text-white/45 transition hover:text-white/80 sm:inline"
        title="שם + טלפון ב־Vault ואז חזרה"
      >
        Vault
      </button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
