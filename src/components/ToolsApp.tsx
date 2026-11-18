"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Search,
  Zap,
} from "lucide-react";
import {
  TOOL_CATEGORIES,
  type ToolItem,
} from "@/lib/tools-arsenal";
import { getToolCopyText, hasToolBody } from "@/lib/tools-bodies";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

function ToolCard({
  tool,
  index,
  onCopied,
}: {
  tool: ToolItem;
  index: number;
  onCopied: (label?: string) => void;
}) {
  const [copied, setCopied] = useState<"skill" | "link" | null>(null);
  const [openMore, setOpenMore] = useState(false);
  const hasSkill = hasToolBody(tool.id);
  const hasLink = Boolean(tool.href);

  async function copySkill() {
    try {
      await navigator.clipboard.writeText(getToolCopyText(tool));
      setCopied("skill");
      onCopied("Skill");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  async function copyLink() {
    try {
      const links = [
        tool.href,
        ...(tool.parts?.map((p) => `${p.label}: ${p.href}`) ?? []),
      ]
        .filter(Boolean)
        .join("\n");
      await navigator.clipboard.writeText(links);
      setCopied("link");
      onCopied("Link");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      className="arsenal-card lib-reveal group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0b0c0a] px-5 py-4"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="relative flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1" dir="rtl">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5" dir="ltr">
            {hasSkill && (
              <span className="rounded-[6px] border border-[#c8f542]/30 bg-[#c8f542]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c8f542]/80">
                skill
              </span>
            )}
            {hasLink && (
              <span className="rounded-[6px] border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                link
              </span>
            )}
            <span className="h-px min-w-[1rem] flex-1 bg-gradient-to-r from-[#c8f542]/35 to-transparent" />
          </div>
          <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-white break-words [font-family:var(--font-heebo),sans-serif]">
            {tool.title}
          </h3>
        </div>
        <a
          href={tool.href}
          target="_blank"
          rel="noreferrer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#c8f542]/25 text-[#c8f542]/70 transition hover:border-[#c8f542]/60 hover:bg-[#c8f542]/10 hover:text-[#c8f542]"
          aria-label={`Open ${tool.title}`}
        >
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      {openMore && (
        <p
          className="relative mt-3 text-[13px] leading-relaxed text-white/55 [font-family:var(--font-heebo),sans-serif]"
          dir="rtl"
        >
          {tool.summary}
        </p>
      )}

      {tool.parts && tool.parts.length > 1 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5" dir="rtl">
          {tool.parts.map((part) => (
            <a
              key={part.href}
              href={part.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/[0.1] bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/55 transition hover:border-[#c8f542]/40 hover:text-[#c8f542]"
            >
              {part.label}
            </a>
          ))}
        </div>
      )}

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpenMore((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1 rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/70 transition hover:border-[#c8f542]/35 hover:text-[#c8f542]"
          aria-expanded={openMore}
        >
          עוד
          <ChevronDown
            className={`size-3.5 transition ${openMore ? "rotate-180" : ""}`}
          />
        </button>
        {hasSkill && (
          <button
            type="button"
            onClick={() => void copySkill()}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#c8f542] px-3 py-2 text-[11px] font-bold tracking-wide text-black transition hover:bg-[#d6ff6a]"
          >
            {copied === "skill" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "skill" ? "Copied" : "Copy skill"}
          </button>
        )}
        {hasLink && (
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[#c8f542]/35 bg-[#c8f542]/10 px-3 py-2 text-[11px] font-bold tracking-wide text-[#c8f542] transition hover:bg-[#c8f542]/18"
          >
            {copied === "link" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "link" ? "Copied" : "Copy link"}
          </button>
        )}
        {!hasSkill && !hasLink && (
          <span className="text-[11px] text-white/35">No format yet</span>
        )}
      </div>
    </article>
  );
}

export function ToolsApp() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);

  const filteredCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOL_CATEGORIES.map((cat) => {
      if (activeCat !== "all" && cat.id !== activeCat) return null;
      const tools = cat.tools.filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
        );
      });
      if (tools.length === 0) return null;
      return { ...cat, tools };
    }).filter(Boolean) as typeof TOOL_CATEGORIES;
  }, [activeCat, query]);

  const totalTools = TOOL_CATEGORIES.reduce((n, c) => n + c.tools.length, 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="vault-grain" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 arsenal-orb" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 lib-mesh opacity-70" aria-hidden />

      <SiteHeader active="tools" />

      <div className="relative z-10 border-b border-[#c8f542]/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="hidden items-center gap-2 text-[12px] text-[#c8f542]/55 sm:flex">
            <Zap className="size-3.5" />
            Arsenal live · {totalTools} charged skills
          </p>
          <ModeSwitcher active="tools" />
        </div>
      </div>

      {/* Marquee strip */}
      <div className="relative z-10 overflow-hidden border-b border-white/[0.06] bg-[#0a0b08] py-2.5">
        <div className="lib-marquee-track flex gap-10 whitespace-nowrap px-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#c8f542]/45">
          {Array.from({ length: 2 }).map((_, loop) => (
            <span key={loop} className="flex gap-10">
              {[
                "Cursor skills",
                "AAA library",
                "Copy → agent",
                "Vercel · Drive · MCP",
                "Deploy · Review · Ship",
                "No fluff arsenal",
              ].map((t) => (
                <span key={`${loop}-${t}`}>✦ {t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.06] lg:sticky lg:top-[120px] lg:h-[calc(100dvh-120px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-[#c8f542]/10">
          <div className="px-4 py-5 sm:px-6 lg:px-5 lg:py-7">
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#c8f542]/50">
              Loadout
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:overflow-visible lg:pb-0 lg:gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition lg:w-full ${
                  activeCat === "all"
                    ? "bg-[#c8f542] text-black shadow-[0_0_24px_rgba(200,245,66,0.25)]"
                    : "border border-transparent text-white/45 hover:border-[#c8f542]/20 hover:bg-[#c8f542]/05 hover:text-white"
                }`}
              >
                All weapons
              </button>
              {TOOL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.id)}
                  className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-medium transition lg:w-full ${
                    activeCat === cat.id
                      ? "bg-[#c8f542]/15 text-[#c8f542] ring-1 ring-[#c8f542]/35"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/85"
                  }`}
                >
                  <span className="mr-2 font-mono text-[10px] text-[#c8f542]/40">
                    {cat.number}
                  </span>
                  <span className="[font-family:var(--font-heebo),sans-serif]">
                    {cat.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pt-12">
          <div className="mb-10 min-w-0 w-full" dir="rtl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[#c8f542]/70 [direction:ltr] [text-align:right]">
              Cursor skills arsenal
            </p>
            <h1 className="lib-hero-title mt-3 text-[clamp(3.4rem,10vw,7.4rem)] font-extrabold text-white">
              <span className="text-[#c8f542]">כלים</span>
              <span className="mt-1 block text-[0.34em] font-semibold tracking-[-0.03em] text-white/35 [font-family:var(--font-syne),sans-serif] [direction:ltr] [text-align:right]">
                WEAPONS-GRADE PROMPTS
              </span>
            </h1>
          </div>

          <div className="relative mb-10 min-w-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c8f542]/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the arsenal…"
              className="w-full rounded-2xl border border-[#c8f542]/15 bg-black/50 py-3.5 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8f542]/45 focus:bg-black/70 focus:shadow-[0_0_0_3px_rgba(200,245,66,0.12)]"
            />
          </div>

          <div className="space-y-16">
            {filteredCats.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-28">
                <div className="mb-4 flex items-end justify-between gap-3 border-b border-[#c8f542]/15 pb-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" dir="rtl">
                    <span className="font-mono text-[12px] text-[#c8f542]/55 [direction:ltr]">
                      {cat.number}
                    </span>
                    <h2 className="text-[22px] font-extrabold tracking-tight text-white [font-family:var(--font-heebo),sans-serif] sm:text-[26px]">
                      {cat.title}
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
                    {cat.tools.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {cat.tools.map((tool, i) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      index={i}
                      onCopied={() => {
                        setToast(true);
                        window.setTimeout(() => setToast(false), 1600);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}

            {filteredCats.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-[#c8f542]/25 bg-[rgba(200,245,66,0.03)] px-6 py-24 text-center">
                <p className="lib-hero-title text-3xl font-bold text-white/80">
                  No hit
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                  className="mt-6 rounded-full bg-[#c8f542] px-5 py-2.5 text-[13px] font-bold text-black"
                >
                  Reset loadout
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="animate-toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#c8f542] px-5 py-2.5 text-[13px] font-bold text-black shadow-[0_12px_40px_rgba(200,245,66,0.35)]">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
