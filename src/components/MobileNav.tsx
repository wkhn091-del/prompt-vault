"use client";

import Link from "next/link";
import {
  Clapperboard,
  GraduationCap,
  ImageIcon,
  LayoutGrid,
  Plug,
  Wrench,
} from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", id: "sites", Icon: LayoutGrid },
  { href: "/tools", label: "Tools", id: "tools", Icon: Wrench },
  { href: "/animations", label: "Motion", id: "animations", Icon: Clapperboard },
  { href: "/go/academy", label: "לימודים", id: "learn", Icon: GraduationCap },
  { href: "/backgrounds", label: "BG", id: "backgrounds", Icon: ImageIcon },
  { href: "/mcp", label: "MCP", id: "mcp", Icon: Plug },
] as const;

type MobileNavProps = {
  active?:
    | "sites"
    | "tools"
    | "websites"
    | "backgrounds"
    | "animations"
    | "mcp"
    | "login"
    | "learn";
};

/** iPhone / Android bottom dock — icons + labels, safe-area aware. */
export function MobileNav({ active = "sites" }: MobileNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-black/92 backdrop-blur-2xl md:hidden"
      style={{
        paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      aria-label="Mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1 pt-1">
        {ITEMS.map((item) => {
          const on = active === item.id;
          const Icon = item.Icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-semibold tracking-wide transition ${
                on
                  ? "bg-white/[0.1] text-white"
                  : "text-white/45 active:bg-white/[0.06] active:text-white"
              }`}
            >
              <Icon
                className={`size-[20px] stroke-[1.75] ${on ? "text-white" : "text-white/50"}`}
                aria-hidden
              />
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
