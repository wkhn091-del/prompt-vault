"use client";

import { Film } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { localLivePreviewHtml } from "@/lib/live-registry";
import type { MediaType } from "@/lib/types";
import { ScaledLivePreview } from "./ScaledLivePreview";

type MediaPreviewProps = {
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  previewHtml?: string | null;
  backdropColor?: string | null;
  title: string;
  slug?: string | null;
  className?: string;
  /** card = scaled non-interactive; modal = full interactive live site */
  liveMode?: "card" | "modal";
};

/**
 * Loop wallpaper only.
 * The real HTMLVideoElement is created off-DOM (never mounted), so the browser
 * cannot show native controls, timelines, download menus, or PiP chrome.
 * Pixels are painted to a canvas the user sees.
 */
function LoopVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
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
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");
    video.removeAttribute("controls");
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.src = src;

    // Kill media-session UI (lock screen / browser media bar)
    try {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = null;
        for (const action of [
          "play",
          "pause",
          "seekbackward",
          "seekforward",
          "seekto",
          "stop",
        ] as MediaSessionAction[]) {
          try {
            navigator.mediaSession.setActionHandler(action, () => {
              void video.play().catch(() => {});
            });
          } catch {
            /* unsupported action */
          }
        }
      }
    } catch {
      /* ignore */
    }

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
      if (w && h && video.readyState >= 2) {
        const vw = video.videoWidth || 1;
        const vh = video.videoHeight || 1;
        const scale = Math.max(w / vw, h / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      if (video.paused || video.ended) {
        void video.play().catch(() => {});
      }
      raf = requestAnimationFrame(draw);
    };

    const kick = () => {
      sizeCanvas();
      void video.play().catch(() => {});
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    video.addEventListener("loadeddata", kick);
    video.addEventListener("playing", kick);
    video.addEventListener("pause", () => {
      void video.play().catch(() => {});
    });
    video.load();
    void video.play().catch(() => {});
    sizeCanvas();

    const ro = new ResizeObserver(() => sizeCanvas());
    ro.observe(wrap);

    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    wrap.addEventListener("contextmenu", block);
    wrap.addEventListener("dragstart", block);
    wrap.addEventListener("mousedown", block);
    wrap.addEventListener("mouseup", block);
    wrap.addEventListener("dblclick", block);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("contextmenu", block);
      wrap.removeEventListener("dragstart", block);
      wrap.removeEventListener("mousedown", block);
      wrap.removeEventListener("mouseup", block);
      wrap.removeEventListener("dblclick", block);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <div
      ref={wrapRef}
      className={`preview-video-wrap relative h-full w-full overflow-hidden select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
      <div className="absolute inset-0 z-[1]" aria-hidden />
    </div>
  );
}

export function MediaPreview({
  mediaUrl,
  mediaType,
  previewHtml,
  backdropColor,
  title,
  slug,
  className = "",
  liveMode = "card",
}: MediaPreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolvedHtml = useMemo(() => {
    if (previewHtml && previewHtml.length > 40) return previewHtml;
    if (slug) return localLivePreviewHtml(slug);
    return null;
  }, [previewHtml, slug]);

  const isVideo =
    mediaType === "video" ||
    (!!mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl));
  const isLive =
    !isVideo &&
    (Boolean(resolvedHtml) || mediaType === "live_preview");

  if (isLive && resolvedHtml) {
    return (
      <ScaledLivePreview
        html={resolvedHtml}
        title={title}
        mode={liveMode}
        className={className}
      />
    );
  }

  if (!mediaUrl) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0d0d10] text-[#5a5a62] ${className}`}
      >
        <Film className="size-6" />
        <span className="text-xs tracking-wide">No preview</span>
      </div>
    );
  }

  if (isVideo) {
    if (!mounted) {
      return (
        <div className={`h-full w-full bg-[#0d0d10] ${className}`} aria-hidden />
      );
    }
    return <LoopVideo src={mediaUrl} className={className} />;
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: backdropColor || "#141416" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl}
        alt={title}
        className="preview-float absolute inset-0 m-auto max-h-[78%] max-w-[70%] object-contain drop-shadow-2xl"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}
