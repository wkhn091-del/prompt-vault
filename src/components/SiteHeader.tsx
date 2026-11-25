"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AccountMenu } from "./AccountMenu";
import { BrandLogo } from "./BrandLogo";
import { MobileNav } from "./MobileNav";

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
    <>
    <header
      className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/95 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mobile-pad-x mx-auto flex h-[52px] max-w-[1400px] items-center gap-2.5 sm:h-[72px] sm:gap-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
          <BrandLogo
            size={32}
            priority
            className="size-7 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] sm:size-8"
          />
          <span className="truncate text-[14px] font-medium tracking-[-0.02em] text-white lowercase sm:text-[16px]">
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
            Sites
          </Link>
          <Link
            href="/go/academy"
            className="rounded-full px-3.5 py-2 text-[14px] font-medium text-white/45 transition hover:text-white/80"
          >
            לימודים
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

        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search…"
                className="h-9 w-[180px] rounded-full border border-white/[0.08] bg-white/[0.04] py-2 pl-10 pr-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] xl:w-[220px]"
              />
            </div>
          )}

          {rightAction ?? (
            <Link
              href="/mcp"
              className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
            >
              Connect MCP
            </Link>
          )}

          <AccountMenu />
        </div>
      </div>

      {showSearch && (
        <div className="mobile-pad-x border-t border-white/[0.05] pb-2.5 pt-2 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search prompts…"
              enterKeyHint="search"
              className="h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.04] py-2 pl-11 pr-4 text-[16px] text-white outline-none transition placeholder:text-white/30 focus:border-white/22 focus:bg-white/[0.07]"
            />
          </div>
        </div>
      )}
    </header>
    <MobileNav active={active === "login" ? "sites" : active} />
    </>
  );
}
