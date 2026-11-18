"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AccountMenu } from "./AccountMenu";
import { BrandLogo } from "./BrandLogo";

type SiteHeaderProps = {
  active?:
    | "sites"
    | "tools"
    | "websites"
    | "backgrounds"
    | "animations"
    | "mcp"
    | "login";
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  rightAction?: React.ReactNode;
};

const RIGHT_LINKS = [
  { href: "/mcp", label: "MCP" },
  { href: "/animations", label: "Animations" },
  { href: "/backgrounds", label: "Backgrounds" },
  { href: "/websites", label: "Academy" },
  { href: "/?category=3D%20%2F%20WebGL", label: "3D" },
  { href: "/#add", label: "Submit", adminOnly: true },
  { href: "/login", label: "Contact" },
] as const;

export function SiteHeader({
  active = "sites",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  rightAction,
}: SiteHeaderProps) {
  const { isAdmin } = useIsAdmin();
  const links = RIGHT_LINKS.filter(
    (link) => !("adminOnly" in link && link.adminOnly) || isAdmin,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-5 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <BrandLogo size={32} priority className="shadow-[0_0_0_1px_rgba(255,255,255,0.12)]" />
          <span className="text-[16px] font-medium tracking-[-0.02em] text-white lowercase">
            promptvault
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-full px-3.5 py-2 text-[14px] transition ${
              active === "sites"
                ? "font-semibold text-white"
                : "font-medium text-white/45 hover:text-white/80"
            }`}
          >
            Sites
          </Link>
          <Link
            href="/tools"
            className={`rounded-full px-3.5 py-2 text-[14px] transition ${
              active === "tools"
                ? "font-semibold text-white"
                : "font-medium text-white/45 hover:text-white/80"
            }`}
          >
            Tools
          </Link>
          <Link
            href="/animations"
            className={`rounded-full px-3.5 py-2 text-[14px] transition ${
              active === "animations"
                ? "font-semibold text-white"
                : "font-medium text-white/45 hover:text-white/80"
            }`}
          >
            Animations
          </Link>
          <Link
            href="/websites"
            className={`rounded-full px-3.5 py-2 text-[14px] transition ${
              active === "websites"
                ? "font-semibold text-white"
                : "font-medium text-white/45 hover:text-white/80"
            }`}
          >
            Academy
          </Link>
          <Link
            href="/mcp"
            className={`rounded-full px-3.5 py-2 text-[14px] transition ${
              active === "mcp"
                ? "font-semibold text-white"
                : "font-medium text-white/45 hover:text-white/80"
            }`}
          >
            Dashboards
          </Link>
        </nav>

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`rounded-full px-2.5 py-2 text-[13px] font-medium transition hover:text-white/85 ${
                (active === "mcp" && link.label === "MCP") ||
                (active === "websites" && link.label === "Academy") ||
                (active === "backgrounds" && link.label === "Backgrounds") ||
                (active === "animations" && link.label === "Animations")
                  ? "text-white"
                  : "text-white/45"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 xl:ml-3">
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search…"
                className="h-10 w-[180px] rounded-full border border-white/[0.08] bg-white/[0.04] py-2 pl-10 pr-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] xl:w-[220px]"
              />
            </div>
          )}

          {!showSearch && (
            <button
              type="button"
              aria-label="Search"
              className="hidden size-10 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              <Search className="size-4" />
            </button>
          )}

          {rightAction ?? (
            <Link
              href="/mcp"
              className="inline-flex h-10 items-center rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-white transition hover:bg-white/[0.12]"
            >
              Connect MCP
            </Link>
          )}

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
