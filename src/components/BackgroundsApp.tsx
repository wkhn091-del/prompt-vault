"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  Heart,
  Link2,
} from "lucide-react";
import {
  BG_CATEGORIES,
  BG_SORTS,
  displayVideoUrl,
  featuredBackgrounds,
  filterBackgrounds,
  type BackgroundItem,
  type BgCategory,
  type BgSort,
} from "@/lib/backgrounds-catalog";
import {
  releaseVideo,
  requestVideoPlay,
  unloadVideo,
} from "@/lib/video-play-budget";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

/**
 * Fast gallery video:
 * - attach src only near viewport
 * - play only with global decoder budget (max 3)
 * - grid: play on hover, or when clearly visible and a slot is free
 * - leave view → full unload (frees RAM/GPU)
 */
function BgLoopVideo({
  src,
  mode,
  hovered,
  onBroken,
}: {
  src: string;
  mode: "hero" | "grid";
  hovered?: boolean;
  onBroken?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [mostlyVisible, setMostlyVisible] = useState(false);
  const brokenRef = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
        setMostlyVisible(
          entry.isIntersecting && entry.intersectionRatio >= 0.45,
        );
      },
      {
        // Tight margin — don't prefetch a whole page of CloudFront MP4s
        rootMargin: mode === "hero" ? "40px 0px" : "80px 0px",
        threshold: [0, 0.25, 0.45, 0.7],
      },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [mode]);

  const shouldAttach = near || Boolean(hovered);
  const shouldPlay =
    !reducedMotion.current &&
    shouldAttach &&
    (Boolean(hovered) || mostlyVisible || (mode === "hero" && near));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onError = () => {
      if (brokenRef.current) return;
      brokenRef.current = true;
      onBroken?.();
    };
    video.addEventListener("error", onError);

    if (!shouldAttach) {
      unloadVideo(video);
      return () => {
        video.removeEventListener("error", onError);
        unloadVideo(video);
      };
    }

    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
      video.load();
    }

    if (shouldPlay) {
      const priority = hovered ? 4 : mode === "hero" ? 3 : 2;
      const play = () => requestVideoPlay(video, priority);
      video.addEventListener("canplay", play);
      play();
      return () => {
        video.removeEventListener("canplay", play);
        video.removeEventListener("error", onError);
        releaseVideo(video);
      };
    }

    try {
      video.pause();
    } catch {
      /* ignore */
    }
    releaseVideo(video);

    return () => {
      video.removeEventListener("error", onError);
      unloadVideo(video);
    };
  }, [shouldAttach, shouldPlay, src, mode, hovered, onBroken]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-[#111]">
      {shouldAttach && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          controls={false}
          disablePictureInPicture
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 z-[1]" aria-hidden />
    </div>
  );
}

function BgCard({
  item,
  size,
  onCopied,
  onBroken,
}: {
  item: BackgroundItem;
  size: "hero" | "grid";
  onCopied: () => void;
  onBroken: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const handleBroken = useCallback(
    () => onBroken(item.id),
    [item.id, onBroken],
  );

  async function copyUrl(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.videoUrl);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article
      className={`group relative shrink-0 overflow-hidden rounded-[22px] bg-[#111] [content-visibility:auto] [contain-intrinsic-size:320px_200px] ${
        size === "hero"
          ? "aspect-[16/10] w-[min(82vw,520px)] sm:w-[min(54vw,580px)] lg:w-[540px]"
          : "aspect-[16/10] w-full"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <BgLoopVideo
        src={displayVideoUrl(item)}
        mode={size}
        hovered={hover}
        onBroken={handleBroken}
      />

      {(hover || copied) && (
        <button
          type="button"
          onClick={copyUrl}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Link2 className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy URL"}
        </button>
      )}

      {item.premium && (
        <span className="absolute bottom-3 right-3 z-[5] text-amber-300 drop-shadow group-hover:opacity-0">
          <Crown className="size-4 fill-amber-300/30" />
        </span>
      )}

      {typeof item.likes === "number" && item.likes > 0 && hover && (
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
          <Heart className="size-3 fill-white/80" />
          {item.likes}
        </span>
      )}
    </article>
  );
}

export function BackgroundsApp() {
  const [sort, setSort] = useState<BgSort>("Recent");
  const [category, setCategory] = useState<BgCategory>("All");
  const [toast, setToast] = useState(false);
  const [gridVisible, setGridVisible] = useState(12);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(() => new Set());
  const catRailRef = useRef<HTMLDivElement>(null);

  const onBroken = useCallback((id: string) => {
    setBrokenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const hero = useMemo(
    () => featuredBackgrounds().filter((b) => !brokenIds.has(b.id)),
    [brokenIds],
  );
  const grid = useMemo(
    () => filterBackgrounds(sort, category).filter((b) => !brokenIds.has(b.id)),
    [sort, category, brokenIds],
  );
  const gridSlice = grid.slice(0, gridVisible);

  useEffect(() => {
    setGridVisible(12);
  }, [sort, category]);

  function onCopied() {
    setToast(true);
    setTimeout(() => setToast(false), 1600);
  }

  function scrollCats() {
    catRailRef.current?.scrollBy({ left: 180, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <SiteHeader active="backgrounds" />

      <div className="relative z-10 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-start gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <ModeSwitcher active="backgrounds" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        {hero.length > 0 && (
          <div className="-mx-4 mb-6 overflow-x-auto scrollbar-none sm:-mx-6 lg:-mx-8">
            <div className="flex gap-4 px-4 sm:gap-5 sm:px-6 lg:px-8">
              {hero.slice(0, 4).map((item) => (
                <BgCard
                  key={`hero-${item.id}`}
                  item={item}
                  size="hero"
                  onCopied={onCopied}
                  onBroken={onBroken}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-2 border-y border-white/[0.06] py-2.5">
          <div className="flex items-center gap-1.5">
            {BG_SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                  sort === s
                    ? "bg-white/[0.12] text-white ring-1 ring-white/25"
                    : "text-white/45 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mx-1 hidden h-5 w-px bg-white/[0.1] sm:block" />

          <div className="flex min-w-0 flex-1 items-center gap-1">
            <div
              ref={catRailRef}
              className="flex min-w-0 flex-1 gap-1 overflow-x-auto scrollbar-none"
            >
              {BG_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition ${
                    category === c
                      ? "bg-white/[0.12] text-white"
                      : "text-white/45 hover:bg-white/[0.06] hover:text-white/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={scrollCats}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="More categories"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <span className="ml-auto rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200/90">
            Free
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gridSlice.map((item) => (
            <BgCard
              key={item.id}
              item={item}
              size="grid"
              onCopied={onCopied}
              onBroken={onBroken}
            />
          ))}
        </div>

        {gridVisible < grid.length && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setGridVisible((n) => n + 12)}
              className="rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              Load more ({grid.length - gridVisible} left)
            </button>
          </div>
        )}

        {grid.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.1] px-6 py-20 text-center">
            <p className="text-white/60">No backgrounds in this filter.</p>
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setSort("Recent");
              }}
              className="mt-4 rounded-full bg-white/[0.08] px-4 py-2 text-[13px] text-white/80"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="animate-toast-in fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-lg">
          <span className="inline-flex items-center gap-1.5">
            <Copy className="size-3.5" />
            Clean URL copied
          </span>
        </div>
      )}
    </div>
  );
}
