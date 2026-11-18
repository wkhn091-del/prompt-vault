"use client";

import { Film } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { localLivePreviewHtml } from "@/lib/live-registry";
import type { MediaType } from "@/lib/types";
import {
  releaseVideo,
  requestVideoPlay,
  unloadVideo,
} from "@/lib/video-play-budget";
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
  /** When true and HTML exists, show live HTML even if a video is also present. */
  preferHtml?: boolean;
};

/**
 * Native muted loop video — GPU-composited (much smoother than canvas blit).
 * Overlay blocks controls / context menu. Only plays when on-screen.
 */
function LoopVideo({
  src,
  className = "",
  priority = false,
}: {
  src: string;
  className?: string;
  /** Modal / hero: start loading immediately */
  priority?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(priority);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || priority) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0.35);
      },
      { rootMargin: "60px 0px", threshold: [0, 0.35, 0.6] },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [priority, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;

    if (!visible) {
      unloadVideo(video);
      return () => unloadVideo(video);
    }

    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
      video.load();
    }

    const play = () => requestVideoPlay(video, priority ? 3 : 2);

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0.4) {
        try {
          if (video.currentTime < 0.05) video.currentTime = 0.08;
        } catch {
          /* ignore */
        }
      }
      play();
    };

    video.addEventListener("loadeddata", onMeta);
    video.addEventListener("canplay", play);
    play();

    return () => {
      video.removeEventListener("loadeddata", onMeta);
      video.removeEventListener("canplay", play);
      releaseVideo(video);
    };
  }, [visible, src, priority]);

  return (
    <div
      ref={wrapRef}
      className={`preview-video-wrap relative h-full w-full overflow-hidden bg-[#0d0d10] select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {visible && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          controls={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}
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
  preferHtml = false,
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
    Boolean(resolvedHtml) &&
    (preferHtml || !isVideo || mediaType === "live_preview");

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
    return (
      <LoopVideo
        src={mediaUrl}
        className={className}
        priority={liveMode === "modal"}
      />
    );
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
