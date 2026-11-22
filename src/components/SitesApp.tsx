"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Film,
  Search,
} from "lucide-react";
import {
  ACADEMY_COURSES,
  type AcademyCourse,
  type SiteItem,
} from "@/lib/sites-library";
import {
  getSiteBody,
  getSiteCopyText,
  hasSiteBody,
} from "@/lib/sites-bodies";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

function stepCoverSrc(item: SiteItem): string | null {
  return item.cover ?? null;
}

function FormatReader({
  item,
  onClose,
  onCopied,
}: {
  item: SiteItem;
  onClose: () => void;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const body = getSiteBody(item.id) || item.summary;

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
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[#ff7a45]/25 bg-[#0c0a09] shadow-[0_-20px_80px_rgba(0,0,0,0.65)] sm:rounded-3xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
          <div className="min-w-0 flex-1 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff7a45]/60 [direction:ltr] [text-align:right]">
              בתוך האתר · העתקה מלאה
            </p>
            <h2 className="mt-1 text-[17px] font-extrabold leading-snug text-white [font-family:var(--font-heebo),sans-serif] sm:text-[19px]">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-white/55 hover:text-white"
            aria-label="סגור"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <pre
            className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-white/80 [font-family:var(--font-heebo),ui-sans-serif,sans-serif]"
            dir="rtl"
          >
            {body}
          </pre>
        </div>
        <div className="border-t border-white/[0.08] p-3 sm:p-4">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-4 text-[14px] font-bold text-[#1a0e08]"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "הועתק" : "העתק פורמט"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepRow({
  item,
  index,
  onCopied,
  onOpen,
}: {
  item: SiteItem;
  index: number;
  onCopied: () => void;
  onOpen: (item: SiteItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const hasBody = hasSiteBody(item.id);
  const canCopy = hasBody;
  const coverSrc = stepCoverSrc(item);

  async function copy() {
    if (!hasBody) {
      onOpen(item);
      return;
    }
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
    <li className="relative flex gap-3 sm:gap-4">
      <div className="flex w-8 shrink-0 flex-col items-center sm:w-10">
        <span className="flex size-7 items-center justify-center rounded-full border border-[#ff7a45]/35 bg-[#ff7a45]/10 font-mono text-[10px] font-bold text-[#ffb08a] sm:size-8 sm:text-[11px]">
          {String(index).padStart(2, "0")}
        </span>
        <span
          className="mt-1 w-px flex-1 bg-gradient-to-b from-[#ff7a45]/35 to-transparent"
          aria-hidden
        />
      </div>

      <div className="mb-2.5 min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#16120f] to-[#0c0a09] px-3.5 py-3 sm:px-4 sm:py-3.5">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="flex w-full items-start gap-2.5 text-right sm:gap-3"
          dir="rtl"
        >
          <div className="min-w-0 flex-1">
            {item.kind && (
              <span className="mb-1 inline-block rounded-full border border-[#ff7a45]/25 bg-[#ff7a45]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#ffb08a] [direction:ltr]">
                {hasBody ? "פורמט" : item.kind}
              </span>
            )}
            <h3 className="text-[14px] font-bold leading-snug text-white break-words [font-family:var(--font-heebo),sans-serif] sm:text-[15px]">
              {item.title}
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-white/45 break-words [font-family:var(--font-heebo),sans-serif]">
              {item.summary}
            </p>
          </div>
          {coverSrc && !coverBroken && (
            <span className="relative block w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-white/[0.1] bg-black/40 sm:w-[6.25rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverSrc}
                alt=""
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                onError={() => setCoverBroken(true)}
                className="aspect-video w-full object-cover"
              />
            </span>
          )}
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#ff7a45]/25 text-[#ff9a6c]">
            <ArrowUpRight className="size-3.5" />
          </span>
        </button>
        <button
          type="button"
          disabled={!canCopy}
          onClick={() => void copy()}
          className="mt-2.5 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-3 py-2 text-[12px] font-bold text-[#1a0e08] disabled:opacity-40 sm:w-auto sm:min-h-0 sm:py-1.5 sm:text-[11px]"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "הועתק" : "העתק פורמט"}
        </button>
      </div>
    </li>
  );
}

function CourseCard({
  course,
  onOpen,
}: {
  course: AcademyCourse;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      dir="rtl"
      className="academy-card group flex w-full max-w-full min-w-0 flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#16120f] to-[#0c0a09] px-3.5 py-3 text-right transition hover:border-[#ff7a45]/40 sm:rounded-[22px] sm:px-5 sm:py-4"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="shrink-0 font-mono text-[11px] text-[#ff7a45]/70 [direction:ltr]">
          {course.number}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 [direction:ltr]">
          {course.steps.length} steps
        </span>
      </div>
      <h3 className="mt-1.5 min-w-0 w-full text-[16px] font-extrabold leading-snug tracking-tight text-white [font-family:var(--font-heebo),sans-serif] sm:text-[19px]">
        {course.title}
      </h3>
      <p className="mt-1 min-w-0 w-full line-clamp-2 text-[12px] leading-relaxed text-white/50 [font-family:var(--font-heebo),sans-serif] sm:text-[13px]">
        {course.blurb}
      </p>
      <span className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#ff9a6c]">
        כניסה לקורס
        <ArrowUpRight className="size-3.5 rotate-180" />
      </span>
    </button>
  );
}

export function SitesLibraryApp() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(false);
  const [reading, setReading] = useState<SiteItem | null>(null);

  const activeCourse = useMemo(
    () => ACADEMY_COURSES.find((c) => c.id === activeId) ?? null,
    [activeId],
  );

  const indexCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACADEMY_COURSES;
    return ACADEMY_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.blurb.toLowerCase().includes(q) ||
        c.steps.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  const filteredSteps = useMemo(() => {
    if (!activeCourse) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeCourse.steps;
    return activeCourse.steps.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q),
    );
  }, [activeCourse, query]);

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 1600);
  }

  return (
    <div className="relative min-h-svh overflow-x-clip bg-[#070605] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 academy-orb" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-mesh" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-grain" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 academy-vignette" aria-hidden />

      <SiteHeader active="websites" />

      <div className="relative z-50 border-b border-[#ff7a45]/12 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:px-6 lg:px-8">
          <p className="hidden items-center gap-2 text-[12px] text-[#ff9a6c]/70 sm:flex">
            <Film className="size-3.5" />
            Academy · {ACADEMY_COURSES.length} courses
          </p>
          <div className="ml-auto min-w-0">
            <ModeSwitcher active="websites" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full min-w-0 max-w-[1400px] gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 w-full max-w-full overflow-hidden border-b border-white/[0.06] lg:sticky lg:top-[72px] lg:max-h-[calc(100svh-72px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-[#ff7a45]/12">
          <div className="min-w-0 px-3 py-4 sm:px-6 lg:px-4 lg:py-6">
            <p className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#ff7a45]/55">
              Curriculum
            </p>
            <div className="chip-rail scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setActiveId(null);
                  setQuery("");
                }}
                className={`min-h-[40px] rounded-xl px-3 py-2 text-[13px] font-semibold transition lg:w-full lg:text-left ${
                  activeId === null
                    ? "bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[#1a0e08]"
                    : "bg-white/[0.04] text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                כל הקורסים
              </button>
              {ACADEMY_COURSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveId(c.id);
                    setQuery("");
                  }}
                  className={`min-h-[40px] rounded-xl px-3 py-2 text-[13px] font-medium transition lg:w-full lg:text-left ${
                    activeId === c.id
                      ? "bg-[#ff7a45]/15 text-[#ffb08a] ring-1 ring-[#ff7a45]/35"
                      : "bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white/85"
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#ff7a45]/55 [direction:ltr]">
                    {c.number}
                  </span>{" "}
                  <span className="[font-family:var(--font-heebo),sans-serif]">
                    {c.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative mobile-dock-clear mobile-pad-x w-full min-w-0 max-w-full overflow-x-clip pt-5 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
          <div
            className="pointer-events-none absolute inset-x-3 top-2 bottom-4 -z-10 academy-stage sm:inset-x-4 lg:inset-x-6"
            aria-hidden
          />
          {!activeCourse ? (
            <>
              <div className="mb-5 min-w-0" dir="rtl">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff9a6c]/75 [direction:ltr] [text-align:right] sm:text-[11px]">
                  Ordered curriculum
                </p>
                <h1 className="lib-hero-title mt-2 font-extrabold">
                  <span className="bg-gradient-to-l from-[#ff7a45] via-[#ffb35c] to-[#ffe0a8] bg-clip-text text-transparent">
                    אקדמיה
                  </span>
                </h1>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-white/45 [font-family:var(--font-heebo),sans-serif] sm:text-[14px]">
                  בחר קורס · עבוד שלב־שלב · כל מסמך במקומו.
                </p>
              </div>

              <div className="relative mb-5 min-w-0">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#ff7a45]/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חיפוש קורס או שלב…"
                  className="w-full rounded-2xl border border-[#ff7a45]/25 bg-black/55 py-3 pl-10 pr-3.5 text-[16px] text-white outline-none placeholder:text-white/30 focus:border-[#ff7a45]/50 sm:text-[14px]"
                  dir="rtl"
                />
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {indexCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onOpen={() => setActiveId(course.id)}
                  />
                ))}
              </div>

              {indexCourses.length === 0 && (
                <p className="py-16 text-center text-white/40" dir="rtl">
                  לא נמצא — נסה חיפוש אחר
                </p>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveId(null);
                  setQuery("");
                }}
                className="mb-4 inline-flex min-h-[40px] items-center gap-2 text-[13px] font-semibold text-white/55 transition hover:text-[#ffb08a]"
              >
                <ArrowLeft className="size-3.5" />
                כל הקורסים
              </button>

              <div className="mb-5 min-w-0" dir="rtl">
                <p className="font-mono text-[11px] text-[#ff7a45]/60 [direction:ltr] [text-align:right]">
                  Course {activeCourse.number}
                </p>
                <h1 className="mt-1.5 text-[clamp(1.6rem,7vw,2.8rem)] font-extrabold leading-tight tracking-tight text-white break-words [font-family:var(--font-heebo),sans-serif]">
                  {activeCourse.title}
                </h1>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/45 break-words [font-family:var(--font-heebo),sans-serif] sm:text-[14px]">
                  {activeCourse.blurb}
                </p>
              </div>

              <div className="relative mb-4 min-w-0">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#ff7a45]/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="סנן שלב…"
                  className="w-full rounded-2xl border border-[#ff7a45]/25 bg-black/55 py-3 pl-10 pr-3.5 text-[16px] text-white outline-none placeholder:text-white/30 focus:border-[#ff7a45]/50 sm:text-[14px]"
                  dir="rtl"
                />
              </div>

              <ol className="w-full min-w-0 max-w-3xl list-none p-0">
                {filteredSteps.map((step, i) => (
                  <StepRow
                    key={step.id}
                    item={step}
                    index={i}
                    onCopied={showToast}
                    onOpen={setReading}
                  />
                ))}
              </ol>

              {filteredSteps.length === 0 && (
                <p className="py-12 text-center text-white/40" dir="rtl">
                  אין שלבים שמתאימים לחיפוש
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="animate-toast-in fixed bottom-[5.5rem] left-1/2 z-50 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] md:bottom-6">
          הועתק
        </div>
      )}

      {reading && (
        <FormatReader
          item={reading}
          onClose={() => setReading(null)}
          onCopied={showToast}
        />
      )}
    </div>
  );
}
