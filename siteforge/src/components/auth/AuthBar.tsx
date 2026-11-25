"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

function initialsFrom(fullName: string | null, email: string | null): string {
  const name = fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (!email) return "?";
  const local = email.split("@")[0] || "u";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function AuthBar({
  floating = false,
}: {
  /** Fixed corner for the Havana home (no Shell header). */
  floating?: boolean;
}) {
  const {
    ready,
    email,
    fullName,
    phone,
    isAdmin,
    signInGoogle,
    signOut,
    updateProfile,
  } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
        setMsg(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setEditing(false);
        setMsg(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setNameDraft(fullName ?? "");
    setPhoneDraft(phone ?? "");
  }, [fullName, phone]);

  const wrapClass = floating
    ? "fixed top-[max(14px,env(safe-area-inset-top))] right-[max(14px,env(safe-area-inset-right))] z-[60]"
    : "relative shrink-0";

  if (!ready) {
    return (
      <div className={wrapClass}>
        <span className="flex size-10 items-center justify-center rounded-full bg-[#1e3a5f]/60 text-[11px] text-white/40">
          …
        </span>
      </div>
    );
  }

  if (!email) {
    return (
      <div ref={rootRef} className={wrapClass}>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void signInGoogle().finally(() => setBusy(false));
          }}
          title="התחברות"
          aria-label="התחברות"
          className="flex size-10 items-center justify-center rounded-full bg-[#1e3a5f] text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/20 transition hover:ring-2 hover:ring-white/35 disabled:opacity-50"
        >
          {busy ? "…" : "IN"}
        </button>
      </div>
    );
  }

  const initials = initialsFrom(fullName, email);
  const displayName = fullName?.trim() || email.split("@")[0] || email;

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const result = await updateProfile({
      fullName: nameDraft.trim(),
      phone: phoneDraft.trim(),
    });
    setSaving(false);
    if (result.error) {
      setMsg(result.error);
      return;
    }
    setMsg("נשמר ✓");
    setEditing(false);
  }

  return (
    <div ref={rootRef} className={wrapClass}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setEditing(false);
          setMsg(null);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        title={displayName}
        aria-label="תפריט חשבון"
        className="flex size-10 items-center justify-center rounded-full bg-[#1e3a5f] text-[12px] font-semibold tracking-wide text-white transition ring-offset-2 ring-offset-black hover:ring-2 hover:ring-white/25"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          dir="rtl"
          className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[260px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121214] py-2 text-white shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)]"
        >
          <div className="border-b border-white/[0.08] px-4 py-3">
            <p className="truncate text-[13px] font-semibold leading-snug text-white">
              {displayName}
            </p>
            <p className="mt-1 truncate text-[12px] text-white/45">{email}</p>
            {isAdmin && (
              <p className="mt-1.5 text-[11px] font-semibold text-[#ffb08a]">
                Admin
              </p>
            )}
          </div>

          {editing ? (
            <form
              onSubmit={(e) => void onSaveProfile(e)}
              className="space-y-3 px-4 py-3"
            >
              <label className="block">
                <span className="mb-1 block text-[11px] text-white/40">
                  שם מלא
                </span>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-[13px] text-white outline-none focus:border-white/25"
                  placeholder="השם שלך"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-white/40">
                  טלפון
                </span>
                <input
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-[13px] text-white outline-none focus:border-white/25"
                  placeholder="+972…"
                  type="tel"
                />
              </label>
              {msg && <p className="text-[12px] text-[#ffb08a]">{msg}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-white py-2 text-[12px] font-bold text-black disabled:opacity-50"
                >
                  {saving ? "שומר…" : "שמירה"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setNameDraft(fullName ?? "");
                    setPhoneDraft(phone ?? "");
                    setMsg(null);
                  }}
                  className="rounded-full border border-white/15 px-3 py-2 text-[12px] text-white/70"
                >
                  ביטול
                </button>
              </div>
            </form>
          ) : (
            <div className="py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setEditing(true);
                  setMsg(null);
                }}
                className="flex w-full px-4 py-2.5 text-right text-[14px] text-white/85 transition hover:bg-white/[0.06]"
              >
                הגדרות פרופיל
              </button>
              {msg && (
                <p className="px-4 pb-2 text-[12px] text-emerald-300/90">{msg}</p>
              )}
            </div>
          )}

          <div className="border-t border-white/[0.08] pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full px-4 py-2.5 text-right text-[14px] text-white/85 transition hover:bg-white/[0.06]"
            >
              יציאה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
