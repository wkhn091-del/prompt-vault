"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

export type AppMode =
  | "stats"
  | "tools"
  | "websites"
  | "backgrounds"
  | "animations";

type ModeSwitcherProps = {
  active: AppMode;
};

const OPTIONS: { id: AppMode; label: string; href: string }[] = [
  { id: "stats", label: "Home", href: "/" },
  { id: "tools", label: "Tools", href: "/tools" },
  { id: "websites", label: "Academy", href: "/websites" },
  { id: "animations", label: "Animations", href: "/animations" },
  { id: "backgrounds", label: "Backgrounds", href: "/backgrounds" },
];

export function BackHomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-[13px] font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
    >
      <ArrowLeft className="size-3.5 opacity-70" />
      Back
    </Link>
  );
}

export function ModeSwitcher({ active }: ModeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.id === active) ?? OPTIONS[0];

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

  return (
    <div className="flex items-center gap-2">
      <BackHomeButton />
      <div ref={rootRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 text-[13px] font-medium text-white/90 transition hover:bg-white/[0.08]"
        >
          {current.label}
          <ChevronDown
            className={`size-3 opacity-55 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[148px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#141416] py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)]"
          >
            {OPTIONS.map((opt) => (
              <Link
                key={opt.id}
                href={opt.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex w-full px-3.5 py-2 text-left text-[12px] font-medium transition hover:bg-white/[0.06] ${
                  opt.id === active ? "text-white" : "text-white/50"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
