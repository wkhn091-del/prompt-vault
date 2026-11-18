"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Code2, Copy, ExternalLink } from "lucide-react";
import { requestHtmlSlot } from "@/lib/live-html-budget";
import { localLivePreviewHtml } from "@/lib/live-registry";
import type { PromptDTO } from "@/lib/types";
import { ModeSwitcher } from "./ModeSwitcher";
import { PreviewModal } from "./PreviewModal";
import { SiteHeader } from "./SiteHeader";
import { ScaledLivePreview } from "./ScaledLivePreview";
import { Toast } from "./Toast";

function resolveHtml(p: PromptDTO): string | null {
  if (p.previewHtml && p.previewHtml.trim().length > 40) return p.previewHtml;
  return localLivePreviewHtml(p.slug);
}

/** Mount at most 2 live iframes site-wide; unload when scrolled away. */
function LazyHtmlPreview({
  id,
  html,
  title,
}: {
  id: string;
  html: string;
  title: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "100px 0px", threshold: 0.08 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [id]);

  useEffect(() => {
    if (!near) {
      setLive(false);
      return;
    }
    return requestHtmlSlot(id, () => setLive(true));
  }, [near, id]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-[#111]">
      {live ? (
        <ScaledLivePreview html={html} title={title} mode="card" />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] to-transparent" />
      )}
    </div>
  );
}

function AnimationCard({
  prompt,
  html,
  onOpen,
  onCopied,
}: {
  prompt: PromptDTO;
  html: string;
  onOpen: () => void;
  onCopied: (kind: "html" | "prompt") => void;
}) {
  const [copied, setCopied] = useState<"html" | "prompt" | null>(null);

  async function copyHtml(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(html);
      setCopied("html");
      onCopied("html");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  async function copyPrompt(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      let text = prompt.promptText;
      if (!text) {
        const { authFetch } = await import("@/lib/auth-fetch");
        const res = await authFetch(`/api/prompts/${prompt.id}`);
        const data = await res.json();
        text = (data.prompt?.promptText as string | undefined) || "";
      }
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied("prompt");
      onCopied("prompt");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  function openBrowse(e: React.MouseEvent) {
    e.stopPropagation();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#0a0a0c] transition hover:border-white/20"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        <LazyHtmlPreview id={prompt.id} html={html} title={prompt.title} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            {prompt.category}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-white">
            {prompt.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openBrowse}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 transition hover:bg-white/[0.08]"
          >
            <ExternalLink className="size-3.5" />
            Browse HTML
          </button>
          <button
            type="button"
            onClick={(e) => void copyHtml(e)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] font-bold text-black transition hover:bg-zinc-200"
          >
            {copied === "html" ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Code2 className="size-3.5" />
            )}
            {copied === "html" ? "HTML copied" : "Copy HTML"}
          </button>
          <button
            type="button"
            onClick={(e) => void copyPrompt(e)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/[0.1] px-3 py-2 text-[11px] font-medium text-white/55 transition hover:border-white/20 hover:text-white"
          >
            {copied === "prompt" ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "prompt" ? "Prompt copied" : "Copy prompt"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function AnimationsApp() {
  const [prompts, setPrompts] = useState<PromptDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);
  const [selected, setSelected] = useState<PromptDTO | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" | "info" = "success") => {
      setToast({ message, variant });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/prompts");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setPrompts([]);
          return;
        }
        setPrompts(
          ((data as { prompts?: PromptDTO[] }).prompts ?? []) as PromptDTO[],
        );
      } catch {
        if (!cancelled) setPrompts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const animations = useMemo(() => {
    return prompts
      .map((p) => ({ prompt: p, html: resolveHtml(p) }))
      .filter((x): x is { prompt: PromptDTO; html: string } => Boolean(x.html));
  }, [prompts]);
  const animationsSlice = animations.slice(0, visibleCount);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <SiteHeader active="animations" />

      <div className="relative z-10 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <ModeSwitcher active="animations" />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
            Live HTML column
          </p>
          <h1 className="mt-2 text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold tracking-tight text-white">
            Animations
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/45">
            Real interactive HTML — browse inside the preview, open full HTML,
            or copy the whole file.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] animate-pulse rounded-[22px] bg-white/[0.04]"
              />
            ))}
          </div>
        ) : animations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] px-6 py-20 text-center text-white/45">
            No HTML animations yet. Add companion HTML on a vault prompt to show
            it here.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {animationsSlice.map(({ prompt, html }) => (
                <AnimationCard
                  key={prompt.id}
                  prompt={prompt}
                  html={html}
                  onOpen={() => setSelected(prompt)}
                  onCopied={(kind) =>
                    showToast(kind === "html" ? "HTML copied" : "Prompt copied")
                  }
                />
              ))}
            </div>
            {visibleCount < animations.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + 9)}
                  className="rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Load more ({animations.length - visibleCount} left)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <PreviewModal
        prompt={selected}
        preferHtml
        onClose={() => setSelected(null)}
        onCopied={() => showToast("Copied")}
        onUpdated={(p) => {
          setSelected(p);
          setPrompts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
        }}
        onVideoCopied={(ok, error) => {
          if (ok) showToast("Video link copied");
          else showToast(error || "Could not copy video", "error");
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
