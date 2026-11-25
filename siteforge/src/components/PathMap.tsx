"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Flame,
  Gift,
  Lock,
  Sparkles,
} from "lucide-react";
import type { StageMeta, Track } from "../lib/book";
import {
  completedCount,
  DEV_UNLOCK_ALL,
  isCompleted,
  isCurrent,
  isUnlocked,
  loadProgress,
  medalsEarned,
  type ProgressState,
} from "../lib/progress";
import { RewardShop } from "./RewardShop";

type Props = {
  tracks: Track[];
  stages: StageMeta[];
  medals: { medal_id: string; stage_id: string }[];
  projects: { project_id: string; stage_id: string; title: string }[];
};

function snakeX(i: number, amp: number) {
  const lane = [0, -0.9, -0.4, 0.9, 0.35, -0.9, -0.15, 0.9][i % 8];
  return 50 + lane * amp;
}

export function PathMap({ tracks, stages }: Props) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [trackFilter, setTrackFilter] = useState<string | "all" | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [layout, setLayout] = useState({ amp: 28, row: 148, node: 82, pad: 56 });

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    if (DEV_UNLOCK_ALL) {
      setTrackFilter("all");
      return;
    }
    const current = stages.find((s) => s.stage_id === p.unlockedThrough);
    setTrackFilter(current?.track ?? tracks[0]?.track_id ?? "all");
  }, [stages, tracks]);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w < 640) setLayout({ amp: 22, row: 142, node: 72, pad: 48 });
      else if (w < 1024) setLayout({ amp: 28, row: 156, node: 84, pad: 56 });
      else setLayout({ amp: 34, row: 168, node: 92, pad: 64 });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const visible = useMemo(() => {
    if (!trackFilter || trackFilter === "all") return stages;
    return stages.filter((s) => s.track === trackFilter);
  }, [stages, trackFilter]);

  const nodes = useMemo(
    () =>
      visible.map((stage, i) => ({
        stage,
        i,
        x: snakeX(i, layout.amp),
        y: layout.pad + i * layout.row,
      })),
    [visible, layout],
  );

  const pathHeight =
    layout.pad + Math.max(visible.length, 1) * layout.row + 100;

  const svgPath = useMemo(() => {
    if (nodes.length < 2) return "";
    let d = "";
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const y1 = a.y + layout.node / 2;
      const y2 = b.y + layout.node / 2;
      const midY = (y1 + y2) / 2;
      if (i === 0) d += `M ${a.x} ${y1}`;
      d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${y2}`;
    }
    return d;
  }, [nodes, layout.node]);

  const activeTrack =
    tracks.find((t) =>
      trackFilter && trackFilter !== "all"
        ? t.track_id === trackFilter
        : t.track_id ===
          stages.find((s) => s.stage_id === progress?.unlockedThrough)?.track,
    ) ?? tracks[0];

  const trackStages = stages.filter((s) => s.track === activeTrack?.track_id);
  const trackDone = progress
    ? trackStages.filter((s) => isCompleted(progress, s.stage_id)).length
    : 0;
  const doneAll = progress ? completedCount(progress) : 0;

  if (!progress) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#ffb08a]">
        טוען מפה…
      </div>
    );
  }

  return (
    <div className="path-world relative min-h-[calc(100vh-57px)] min-w-0 w-full max-w-full" dir="rtl">
      {/* Cinematic forge backdrop — clipped here so page HUD can stay sticky */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="path-world-base absolute inset-0" />
        <div className="path-world-horizon absolute inset-x-0 bottom-0 h-[55%]" />
        <div className="path-world-aurora absolute inset-0" />
        <div className="path-world-lava absolute inset-x-0 bottom-0 h-[40%]" />
        <svg className="path-world-terrain absolute inset-x-0 bottom-0 h-[42%] w-full" viewBox="0 0 1440 420" preserveAspectRatio="none">
          <defs>
            <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1810" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0a0706" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="terrainGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a45" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ff7a45" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,280 C180,220 320,320 480,260 C640,200 720,300 900,240 C1080,180 1240,280 1440,220 L1440,420 L0,420 Z"
            fill="url(#terrainFill)"
          />
          <path
            d="M0,300 C200,250 360,340 540,280 C720,220 800,310 980,260 C1160,210 1280,290 1440,250 L1440,420 L0,420 Z"
            fill="url(#terrainGlow)"
            opacity="0.35"
          />
          <path
            d="M0,340 C160,300 400,380 620,320 C840,260 980,360 1200,310 C1320,280 1400,330 1440,310 L1440,420 L0,420 Z"
            fill="#050403"
            opacity="0.85"
          />
        </svg>
        <div className="path-world-grid absolute inset-0" />
        <div className="path-world-grid-fine absolute inset-0" />
        <div className="path-world-beams absolute inset-0" />
        <div className="path-world-scan absolute inset-0" />
        <div className="path-world-ember path-world-ember-a absolute" />
        <div className="path-world-ember path-world-ember-b absolute" />
        <div className="path-world-ember path-world-ember-c absolute" />
        <div className="path-world-core absolute left-1/2 top-[22%] -translate-x-1/2" />
        <div className="path-world-ring path-world-ring-1 absolute left-1/2 top-[14%] -translate-x-1/2" />
        <div className="path-world-ring path-world-ring-2 absolute left-1/2 top-[8%] -translate-x-1/2" />
        <div className="path-world-sparks absolute inset-0">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="path-spark" style={{ ["--i" as string]: i }} />
          ))}
        </div>
        <div className="path-world-grain absolute inset-0" />
        <div className="path-world-vignette absolute inset-0" />
      </div>

      {/* HUD — sticky under Shell header (no overflow ancestor, so it won't scroll away) */}
      <div className="sticky top-[57px] z-40 border-b border-white/[0.06] bg-[#070605]/92 backdrop-blur-2xl">
        <div className="mobile-pad-x mx-auto flex min-w-0 max-w-[1100px] items-center gap-3 py-2.5 sm:px-6 lg:px-8">
          <p className="shrink-0 text-[15px] font-extrabold tracking-tight [font-family:var(--font-heebo),sans-serif]">
            המסלול שלי
          </p>
          <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#ff7a45]/30 bg-[#ff7a45]/12 px-2.5 py-1 text-[12px] font-bold text-[#ffb08a] shadow-[0_0_24px_-4px_rgba(255,122,69,0.65)]">
              <Flame className="size-3.5 text-[#ff7a45]" />
              {progress.streak}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#ffb35c]/30 bg-[#ffb35c]/10 px-2.5 py-1 text-[12px] font-bold text-[#ffb35c]">
              <Coins className="size-3.5" />
              {progress.coins}
            </span>
            <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 font-mono text-[11px] text-white/50">
              {medalsEarned(progress)}🏅 · {doneAll}/{stages.length}
            </span>
            <button
              type="button"
              onClick={() => setShopOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-[#ffb35c]/35 bg-gradient-to-r from-[#ff7a45]/20 to-[#ffb35c]/15 px-2.5 py-1 text-[12px] font-bold text-[#ffe0a8] hover:brightness-110"
              title="חנות אנימציות, נקודות ומדליות מהקורס"
            >
              <Gift className="size-3.5" />
              חנות
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-pad-x relative z-10 mx-auto box-border w-full min-w-0 max-w-[1100px] pb-36 pt-6 sm:px-8 lg:px-10">
        {/* Chapter banner — inset from clip edges; soft radius; no outer glow past padding */}
        <div
          className="mb-6 w-full min-w-0 sm:mb-8"
          style={{
            borderRadius: 22,
            padding: 2,
            background:
              "linear-gradient(120deg,#ffe0a8,#ff7a45 40%,#ffb35c 75%,#ff9a5c)",
            boxShadow: "0 12px 28px -16px rgba(255,100,40,0.55)",
          }}
        >
          <div
            className="relative flex w-full min-w-0 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5"
            style={{
              borderRadius: 20,
              background:
                "linear-gradient(115deg,#ffc878 0%,#ff8f55 45%,#ff7a45 100%)",
              overflow: "hidden",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.55) 48%,transparent 70%)",
              }}
              aria-hidden
            />
            <div
              className="relative flex size-12 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-extrabold text-[#1a0e08] sm:size-14 sm:text-[14px]"
              style={{
                background: "rgba(26,14,8,0.16)",
                border: "1.5px solid rgba(26,14,8,0.22)",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              {trackDone}/{trackStages.length || 0}
            </div>
            <div className="relative min-w-0 flex-1 text-right">
              <p className="text-[11px] font-bold tracking-wide text-[#1a0e08]/60">
                {activeTrack?.track_id} · עקרונות + AI
              </p>
              <p className="truncate text-[18px] font-extrabold text-[#1a0e08] [font-family:var(--font-heebo),sans-serif] sm:text-[22px]">
                {activeTrack?.title ?? "מסלול"}
              </p>
            </div>
            <div
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11"
              style={{
                background: "rgba(26,14,8,0.12)",
                border: "1px solid rgba(26,14,8,0.18)",
              }}
            >
              <Sparkles className="size-5 text-[#1a0e08]/85 sm:size-6" />
            </div>
          </div>
        </div>

        <TrackChipRail
          tracks={tracks}
          trackFilter={trackFilter}
          onSelect={setTrackFilter}
        />

        {/* Path only — no side titles */}
        <div
          className="path-snake relative mx-auto w-full max-w-[min(100%,420px)] sm:max-w-[520px] md:max-w-[580px]"
          style={{ height: pathHeight, overflow: "visible" }}
          dir="ltr"
        >
          <div className="path-snake-glow absolute inset-0" />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 100 ${pathHeight}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="pathStrokePrem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff0c8" stopOpacity="1" />
                <stop offset="35%" stopColor="#ffb35c" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ff7a45" stopOpacity="0.2" />
              </linearGradient>
              <filter id="pathGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={svgPath}
              fill="none"
              stroke="url(#pathStrokePrem)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="2 11"
              vectorEffect="non-scaling-stroke"
              filter="url(#pathGlow)"
            />
          </svg>

          {nodes.map(({ stage, x, y }) => {
            const unlocked = isUnlocked(progress, stage.stage_id);
            const done = isCompleted(progress, stage.stage_id);
            const current = isCurrent(progress, stage.stage_id);
            const locked = !unlocked;
            const n = Number(stage.stage_id.replace(/\D/g, ""));

            const nodeEl = (
              <div
                className={`path-node relative z-[2] flex items-center justify-center rounded-full ${
                  locked
                    ? "path-node-locked"
                    : done
                      ? "path-node-done"
                      : current
                        ? "path-node-current"
                        : "path-node-open"
                }`}
                style={{ width: layout.node, height: layout.node }}
              >
                {locked ? (
                  <Lock className="size-6 text-white/45 sm:size-7" strokeWidth={2.25} />
                ) : (
                  <span className="font-mono text-[19px] font-extrabold text-[#1a0e08] sm:text-[22px]">
                    {n}
                  </span>
                )}
              </div>
            );

            const body = (
              <>
                {current && (
                  <div className="here-bubble absolute -top-10 left-1/2 z-20 -translate-x-1/2 animate-bounce whitespace-nowrap">
                    !כאן
                  </div>
                )}
                {nodeEl}
              </>
            );

            const wrap =
              "group absolute flex -translate-x-1/2 flex-col items-center";

            return locked ? (
              <div
                key={stage.stage_id}
                className={`${wrap} opacity-80`}
                style={{ left: `${x}%`, top: y }}
                title={stage.title}
                aria-label={stage.title}
              >
                {body}
              </div>
            ) : (
              <Link
                key={stage.stage_id}
                href={`/learn/${stage.stage_id}`}
                title={stage.title}
                aria-label={stage.title}
                className={`${wrap} transition hover:brightness-110`}
                style={{ left: `${x}%`, top: y }}
              >
                {body}
              </Link>
            );
          })}
        </div>
      </div>

      <RewardShop
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        onChange={setProgress}
      />
    </div>
  );
}

function TrackChipRail({
  tracks,
  trackFilter,
  onSelect,
}: {
  tracks: Track[];
  trackFilter: string | "all" | null;
  onSelect: (id: string | "all") => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth + 2) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const chips = el.querySelectorAll<HTMLElement>("[data-chip]");
    if (!chips.length) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const er = el.getBoundingClientRect();
    const first = chips[0].getBoundingClientRect();
    const last = chips[chips.length - 1].getBoundingClientRect();
    setCanPrev(first.right > er.right + 2);
    setCanNext(last.left < er.left - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", syncArrows, { passive: true });
    const ro = new ResizeObserver(syncArrows);
    ro.observe(el);
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      ro.disconnect();
      window.removeEventListener("resize", syncArrows);
    };
  }, [syncArrows, tracks]);

  /** Prompt Vault style: simple ±scroll; flip if RTL engine didn't move */
  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const before = el.scrollLeft;
    el.scrollBy({ left: dir * 220, behavior: "smooth" });
    window.setTimeout(() => {
      if (Math.abs(el.scrollLeft - before) < 1) {
        el.scrollBy({ left: -dir * 220, behavior: "smooth" });
      }
      syncArrows();
    }, 100);
  }

  const arrowBtn =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#ffb35c]/40 bg-[#120c09] text-[#ffe0a8] transition hover:bg-[#1a120e] hover:text-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="relative mb-10 flex min-w-0 w-full max-w-full items-center gap-1.5">
      <button
        type="button"
        aria-label="גלול ימינה"
        disabled={!canPrev}
        onClick={() => scrollByDir(-1)}
        className={arrowBtn}
      >
        <ChevronRight className="size-4" strokeWidth={2.5} />
      </button>

      <div
        ref={scrollerRef}
        className="chip-rail scrollbar-none min-w-0 flex-1"
      >
        <Chip
          active={trackFilter === "all"}
          onClick={() => onSelect("all")}
          label="הכל"
        />
        {tracks.map((t) => (
          <Chip
            key={t.track_id}
            active={trackFilter === t.track_id}
            onClick={() => onSelect(t.track_id)}
            label={t.title}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="גלול שמאלה"
        disabled={!canNext}
        onClick={() => scrollByDir(1)}
        className={arrowBtn}
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      data-chip
      onClick={onClick}
      className="min-h-[40px] px-3.5 py-2 text-[12px] font-bold transition [font-family:var(--font-heebo),sans-serif]"
      style={
        active
          ? {
              borderRadius: 9999,
              color: "#1a0e08",
              background:
                "linear-gradient(165deg,#fff8ec 0%,#ffe0a8 45%,#ffb35c 100%)",
              border: "1px solid rgba(255,230,180,0.9)",
              boxShadow:
                "0 0 0 1px rgba(255,122,69,0.25),0 6px 16px -8px rgba(255,160,80,0.55)",
            }
          : {
              borderRadius: 9999,
              color: "rgba(255,224,168,0.85)",
              background:
                "linear-gradient(180deg,rgba(255,140,70,0.18),rgba(20,12,8,0.7))",
              border: "1px solid rgba(255,160,90,0.35)",
              boxShadow: "inset 0 1px 0 rgba(255,200,140,0.15)",
              backdropFilter: "blur(12px)",
            }
      }
    >
      {label}
    </button>
  );
}
