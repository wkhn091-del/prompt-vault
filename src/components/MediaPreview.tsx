"use client";

import { Film } from "lucide-react";
import { useEffect, useState } from "react";

type MediaPreviewProps = {
  mediaUrl?: string | null;
  mediaType?: "video" | "image" | null;
  title: string;
  className?: string;
  controls?: boolean;
};

export function MediaPreview({
  mediaUrl,
  mediaType,
  title,
  className = "",
  controls = false,
}: MediaPreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVideo =
    mediaType === "video" ||
    (!!mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl));

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
      return <div className={`h-full w-full bg-[#0d0d10] ${className}`} aria-hidden />;
    }
    return (
      <video
        key={mediaUrl}
        src={mediaUrl}
        className={`h-full w-full object-cover ${className}`}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={mediaUrl}
      alt={title}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
    />
  );
}
