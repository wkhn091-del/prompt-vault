"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  CreditCard,
  Heart,
  LogOut,
  Mail,
} from "lucide-react";
import {
  clearEmail,
  getSavedEmail,
  initialsFromEmail,
  saveEmail,
} from "@/lib/auth-local";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

const MENU = [
  { href: "/", label: "Saved Prompts", icon: Heart },
  { href: "/login", label: "Manage Plan", icon: CreditCard },
  { href: "/mcp", label: "Affiliate Dashboard", icon: BadgePercent },
  { href: "/login", label: "Contact us", icon: Mail },
] as const;

export function AccountMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function hydrate() {
      let next = getSavedEmail();
      if (hasSupabaseEnv()) {
        try {
          const supabase = createBrowserClient();
          const { data } = await supabase.auth.getSession();
          const sessionEmail = data.session?.user?.email ?? null;
          if (sessionEmail) {
            saveEmail(sessionEmail);
            next = sessionEmail;
          }
          const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              const e = session?.user?.email ?? null;
              if (e) saveEmail(e);
              else clearEmail();
              setEmail(e ?? getSavedEmail());
            },
          );
          unsub = () => sub.subscription.unsubscribe();
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setEmail(next);
    }

    void hydrate();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    clearEmail();
    setEmail(null);
    setOpen(false);
    if (hasSupabaseEnv()) {
      try {
        await createBrowserClient().auth.signOut();
      } catch {
        /* ignore */
      }
    }
    router.push("/login");
  }

  const initials = initialsFromEmail(email);
  const signedIn = Boolean(email);

  function onAvatarClick() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={onAvatarClick}
        aria-expanded={open}
        aria-haspopup="menu"
        title={signedIn ? "Account" : "Sign in"}
        aria-label={signedIn ? "Account menu" : "Sign in"}
        className="flex size-10 items-center justify-center rounded-full bg-[#1e3a5f] text-[12px] font-semibold tracking-wide text-white transition ring-offset-2 ring-offset-black hover:ring-2 hover:ring-white/20"
      >
        {initials}
      </button>

      {open && signedIn && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[260px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#121214]/95 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.08] px-4 py-3">
            <p className="truncate text-[14px] font-semibold text-white">
              {email}
            </p>
          </div>

          <div className="py-1.5">
            {MENU.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-white/85 transition hover:bg-white/[0.06]"
                >
                  <Icon className="size-4 text-white/45" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-white/[0.08] pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-white/85 transition hover:bg-white/[0.06]"
            >
              <LogOut className="size-4 text-white/45" strokeWidth={1.75} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
