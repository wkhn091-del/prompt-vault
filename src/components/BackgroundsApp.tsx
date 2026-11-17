"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Heart,
  Link2,
} from "lucide-react";
import {
  BG_CATEGORIES,
  BG_SORTS,
  featuredBackgrounds,
  filterBackgrounds,
  type BackgroundItem,
  type BgCategory,
  type BgSort,
} from "@/lib/backgrounds-catalog";
import { SiteHeader } from "./SiteHeader";

/** Off-DOM looping video painted to canvas — Motionsites-style wallpaper tiles */
function BgLoopVideo({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.controls = false;
    video.src = src;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let alive = true;

    const sizeCanvas = () => {
      const w = Math.max(1, wrap.clientWidth);
      const h = Math.max(1, wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const draw = () => {
      if (!alive) return;
      const w = canvas.width;
      const h = canvas.height;
      if (video.readyState >= 2 && w > 0 && h > 0) {
        const vw = video.videoWidth || 1;
        const vh = video.videoHeight || 1;
        const scale = Math.max(w / vw, h / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      raf = requestAnimationFrame(draw);
    };

    const onReady = () => {
      sizeCanvas();
      void video.play().catch(() => {});
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    video.addEventListener("loadeddata", onReady);
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(wrap);
    sizeCanvas();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadeddata", onReady);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

function Watermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex items-center gap-1.5 text-[13px] font-medium tracking-tight text-white/55 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] sm:text-[15px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-m.svg"
          alt=""
          width={24}
          height={24}
          className="size-5 sm:size-6"
        />
        promptvault
      </span>
    </div>
  );
}

function BgCard({
  item,
  size,
  onCopied,
}: {
  item: BackgroundItem;
  size: "hero" | "grid";
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

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
      className={`group relative shrink-0 overflow-hidden rounded-[22px] bg-[#111] ${
        size === "hero"
          ? "aspect-[16/10] w-[min(72vw,420px)] sm:w-[min(46vw,480px)] lg:w-[440px]"
          : "aspect-[16/10] w-full"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <BgLoopVideo src={item.videoUrl} />
      <Watermark />

      {(hover || copied) && (
        <button
          type="button"
          onClick={copyUrl}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-black shadow-lg backdrop-blur transition hover:bg-white"
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
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
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
  const catRailRef = useRef<HTMLDivElement>(null);

  const hero = useMemo(() => featuredBackgrounds(), []);
  const grid = useMemo(
    () => filterBackgrounds(sort, category),
    [sort, category],
  );

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

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        {/* Hero copy — Motionsites style */}
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="max-w-xl text-[15px] font-medium tracking-tight text-white/70 sm:text-[17px]">
            A huge collection of handcrafted Animated Backgrounds.
          </p>
          <a
            href="https://motionsites.ai/unlimited"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-gradient-to-b from-white to-zinc-200 px-6 text-[14px] font-semibold text-black shadow-[0_8px_24px_-8px_rgba(255,255,255,0.35)] transition hover:from-zinc-100 hover:to-zinc-300"
          >
            Go Unlimited →
          </a>
        </div>

        {/* Featured carousel */}
        <div className="-mx-4 mb-8 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {hero.map((item) => (
            <BgCard
              key={`hero-${item.id}`}
              item={item}
              size="hero"
              onCopied={onCopied}
            />
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-y border-white/[0.06] py-3">
          <div className="flex items-center gap-1.5">
            {BG_SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
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
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
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

          <button
            type="button"
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/[0.1] px-3 py-1.5 text-[13px] font-medium text-white/55 transition hover:border-white/20 hover:text-white"
          >
            Pricing
            <ChevronDown className="size-3.5 opacity-60" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {grid.map((item) => (
            <BgCard
              key={item.id}
              item={item}
              size="grid"
              onCopied={onCopied}
            />
          ))}
        </div>

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
            URL copied
          </span>
        </div>
      )}
    </div>
  );
}
