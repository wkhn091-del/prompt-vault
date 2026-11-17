"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Film,
  Search,
} from "lucide-react";
import {
  SITE_CATEGORIES,
  SITES_FOLDER_HREF,
  type SiteItem,
} from "@/lib/sites-library";
import { getSiteCopyText, hasSiteBody } from "@/lib/sites-bodies";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

function SiteCard({
  item,
  index,
  onCopied,
}: {
  item: SiteItem;
  index: number;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const canCopy = hasSiteBody(item.id) || Boolean(item.href);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getSiteCopyText(item));
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      className="academy-card lib-reveal group relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-gradient-to-b from-[#16120f] to-[#0c0a09] p-5"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a45]/60 to-transparent opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 size-36 rounded-full bg-[radial-gradient(circle,rgba(255,122,69,0.18),transparent_70%)] opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1" dir="rtl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {item.kind && (
              <span className="rounded-full border border-[#ff7a45]/30 bg-[#ff7a45]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ffb08a] [direction:ltr]">
                {item.kind}
              </span>
            )}
            <span className="font-mono text-[10px] text-white/25 [direction:ltr]">
              reel {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="text-[17px] font-bold leading-snug tracking-tight text-white break-words [font-family:var(--font-heebo),sans-serif]">
            {item.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45 break-words [font-family:var(--font-heebo),sans-serif]">
            {item.summary}
          </p>
        </div>
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#ff7a45]/25 text-[#ff9a6c] transition hover:border-[#ff7a45]/55 hover:bg-[#ff7a45]/10 hover:text-[#ffc4a8]"
          aria-label={`Open ${item.title}`}
        >
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      <button
        type="button"
        disabled={!canCopy}
        onClick={() => void copy()}
        className="relative mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-3 py-2.5 text-[12px] font-bold tracking-wide text-[#1a0e08] transition hover:brightness-110 disabled:opacity-40"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? "Copied" : hasSiteBody(item.id) ? "Copy script" : "Copy link"}
      </button>
    </article>
  );
}

export function SitesLibraryApp() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);

  const filteredCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITE_CATEGORIES.map((cat) => {
      if (activeCat !== "all" && cat.id !== activeCat) return null;
      const items = cat.items.filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
        );
      });
      if (items.length === 0) return null;
      return { ...cat, items };
    }).filter(Boolean) as typeof SITE_CATEGORIES;
  }, [activeCat, query]);

  const totalItems = SITE_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070605] text-white">
      <div className="vault-grain opacity-[0.05]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-orb" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
        }}
        aria-hidden
      />

      <SiteHeader active="websites" />

      <div className="relative z-10 border-b border-[#ff7a45]/12 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="hidden items-center gap-2 text-[12px] text-[#ff9a6c]/70 sm:flex">
            <Film className="size-3.5" />
            Academy · {totalItems} playbooks on reel
          </p>
          <ModeSwitcher active="websites" />
        </div>
      </div>

      <div className="relative z-10 overflow-hidden border-b border-white/[0.06] bg-[#120e0b] py-2.5">
        <div className="lib-marquee-track flex gap-10 whitespace-nowrap px-4 font-mono text-[11px] uppercase tracking-[0.26em] text-[#ff7a45]/50">
          {Array.from({ length: 2 }).map((_, loop) => (
            <span key={loop} className="flex gap-10">
              {[
                "Build playbooks",
                "Copy → Cursor",
                "Hero · Sections · Ship",
                "Drive synced",
                "Film school for sites",
                "Academy reel",
              ].map((t) => (
                <span key={`${loop}-${t}`}>◈ {t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-white/[0.06] lg:sticky lg:top-[120px] lg:h-[calc(100dvh-120px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-[#ff7a45]/12">
          <div className="px-4 py-5 sm:px-6 lg:px-5 lg:py-7">
            <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#ff7a45]/55">
              Reels
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition lg:w-full ${
                  activeCat === "all"
                    ? "bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[#1a0e08] shadow-[0_0_28px_rgba(255,122,69,0.28)]"
                    : "border border-transparent text-white/45 hover:border-[#ff7a45]/25 hover:bg-[#ff7a45]/05 hover:text-white"
                }`}
              >
                Full reel
              </button>
              {SITE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.id)}
                  className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-medium transition lg:w-full ${
                    activeCat === cat.id
                      ? "bg-[#ff7a45]/15 text-[#ffb08a] ring-1 ring-[#ff7a45]/35"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/85"
                  }`}
                >
                  <span className="mr-2 font-mono text-[10px] text-[#ff7a45]/45">
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
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[#ff9a6c]/75">
                Website build playbooks
              </p>
              <h1
                className="lib-hero-title mt-3 text-[clamp(2.8rem,8.5vw,5.8rem)] font-extrabold text-white"
                dir="rtl"
              >
                <span className="bg-gradient-to-l from-[#ff7a45] via-[#ffb35c] to-[#ffe0a8] bg-clip-text text-transparent">
                  אקדמיה
                </span>
                <span className="mt-2 block text-[0.36em] font-semibold tracking-[-0.02em] text-white/35 [font-family:var(--font-syne),sans-serif] [direction:ltr] [text-align:left]">
                  SITE-BUILDING FILM SCHOOL
                </span>
              </h1>
              <p
                className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/50 [font-family:var(--font-heebo),sans-serif]"
                dir="rtl"
              >
                {totalItems} מסמכים מהדרייב · העתקה מלאה או פתיחה ישירה.
              </p>
            </div>

            <a
              href={SITES_FOLDER_HREF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition hover:bg-[#ffb35c] lg:self-auto"
            >
              Drive folder
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
          </div>

          <div className="relative mb-10 min-w-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#ff7a45]/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the reel…"
              className="w-full rounded-2xl border border-[#ff7a45]/18 bg-black/45 py-3.5 pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#ff7a45]/45 focus:bg-black/65 focus:shadow-[0_0_0_3px_rgba(255,122,69,0.14)]"
            />
          </div>

          <div className="space-y-16">
            {filteredCats.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-28">
                <div className="mb-6 flex flex-col gap-2 border-b border-[#ff7a45]/18 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div dir="rtl">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-[13px] text-[#ff7a45]/55 [direction:ltr]">
                        {cat.number}
                      </span>
                      <h2 className="text-[26px] font-extrabold tracking-tight text-white [font-family:var(--font-heebo),sans-serif] sm:text-[30px]">
                        {cat.title}
                      </h2>
                    </div>
                    <p className="mt-1.5 text-[13px] text-white/40 [font-family:var(--font-heebo),sans-serif]">
                      {cat.blurb}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/25">
                    {cat.items.length} scenes
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {cat.items.map((item, i) => (
                    <SiteCard
                      key={item.id}
                      item={item}
                      index={i}
                      onCopied={() => {
                        setToast(true);
                        setTimeout(() => setToast(false), 1600);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}

            {filteredCats.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-[#ff7a45]/30 bg-[rgba(255,122,69,0.04)] px-6 py-24 text-center">
                <p className="lib-hero-title text-3xl font-bold text-white/80">
                  Empty reel
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCat("all");
                  }}
                  className="mt-6 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08]"
                >
                  Reset search
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="animate-toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] shadow-[0_12px_40px_rgba(255,122,69,0.4)]">
          Copied
        </div>
      )}
    </div>
  );
}
