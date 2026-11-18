"use client";

import { useEffect, useRef, useState } from "react";

type ScaledLivePreviewProps = {
  html: string;
  title: string;
  /** Card: non-interactive. Modal: interactive. Both scale 1440×900 into the box. */
  mode?: "card" | "modal";
  className?: string;
};

const DESIGN_W = 1440;
const DESIGN_H = 900;

export function ScaledLivePreview({
  html,
  title,
  mode = "card",
  className = "",
}: ScaledLivePreviewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const cardWidth = el.clientWidth;
      const cardHeight = el.clientHeight;
      if (cardWidth <= 0 || cardHeight <= 0) return;
      if (mode === "card") {
        // Spec: scale(cardWidth / 1440) — 16:10 cards fill edge-to-edge
        setScale(cardWidth / DESIGN_W);
      } else {
        // Modal: contain the full desktop design
        setScale(Math.min(cardWidth / DESIGN_W, cardHeight / DESIGN_H));
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html, mode]);

  const interactive = mode === "modal";

  return (
    <div
      ref={shellRef}
      className={`relative h-full w-full overflow-hidden bg-[#0d0d10] ${className}`}
    >
      {scale > 0 && (
        <iframe
          title={title}
          srcDoc={html}
          // Never combine allow-scripts with allow-same-origin (stored XSS escape).
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: DESIGN_W,
            height: DESIGN_H,
            border: 0,
            pointerEvents: interactive ? "auto" : "none",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}
