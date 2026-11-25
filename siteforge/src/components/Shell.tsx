import Link from "next/link";
import type { ReactNode } from "react";
import { WalletBar } from "./academy/WalletBar";
import { AuthBar } from "./auth/AuthBar";

export function Shell({
  children,
  active,
}: {
  children: ReactNode;
  active?: "home" | "academy" | "medals";
}) {
  return (
    <div className="relative min-h-svh bg-[#070605] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 academy-orb" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-mesh" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-grain" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-vignette" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-[#ff7a45]/12 bg-[#070605]/90 backdrop-blur-xl">
        <div className="mobile-pad-x mx-auto flex h-[57px] max-w-[1400px] items-center gap-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7a45] to-[#ffb35c] text-[13px] font-extrabold text-[#1a0e08]">
              SF
            </span>
            <span className="truncate text-[15px] font-bold tracking-tight">
              <span className="bg-gradient-to-l from-[#ff7a45] via-[#ffb35c] to-[#ffe0a8] bg-clip-text text-transparent">
                SiteForge
              </span>
            </span>
          </Link>

          <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
            <WalletBar />
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className={`rounded-xl px-2.5 py-2 text-[13px] font-semibold transition sm:px-3 ${
                  active === "home"
                    ? "bg-[#ff7a45]/15 text-[#ffb08a] ring-1 ring-[#ff7a45]/35"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                בית
              </Link>
              <Link
                href="/#courses"
                className={`rounded-xl px-2.5 py-2 text-[13px] font-semibold transition sm:px-3 ${
                  active === "academy"
                    ? "bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[#1a0e08]"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                אקדמיה
              </Link>
              <Link
                href="/academy/medals"
                className={`rounded-xl px-2.5 py-2 text-[13px] font-semibold transition sm:px-3 ${
                  active === "medals"
                    ? "bg-[#ff7a45]/15 text-[#ffb08a] ring-1 ring-[#ff7a45]/35"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                מדליות
              </Link>
            </nav>
            <AuthBar />
          </div>
        </div>
      </header>

      <div className="relative z-10 min-w-0 w-full max-w-full">{children}</div>
    </div>
  );
}
