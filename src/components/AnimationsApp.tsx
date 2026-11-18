"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";
import { ANIMATION_KITS, type AnimationKit } from "@/lib/animation-kits";
import { requestHtmlSlot } from "@/lib/live-html-budget";
import { localLivePreviewHtml } from "@/lib/live-registry";
import type { PromptDTO } from "@/lib/types";
import { ModeSwitcher } from "./ModeSwitcher";
import { PreviewModal } from "./PreviewModal";
import { SiteHeader } from "./SiteHeader";
import { ScaledLivePreview } from "./ScaledLivePreview";
import { Toast } from "./Toast";

type AnimSource = "mine" | "vault";

function SourceMenu({
  source,
  mineCount,
  vaultCount,
  onChange,
}: {
  source: AnimSource;
  mineCount: number;
  vaultCount: number;
  onChange: (s: AnimSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label = source === "mine" ? "Mine" : "Vault";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0 self-start sm:self-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 text-[13px] font-medium text-white/90 transition hover:bg-white/[0.08]"
      >
        {label}
        <ChevronDown
          className={`size-3 opacity-55 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[148px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#141416] py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)]"
        >
          {(
            [
              { id: "mine" as const, label: "Mine", count: mineCount },
              { id: "vault" as const, label: "Vault", count: vaultCount },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left text-[13px] font-medium transition hover:bg-white/[0.06] ${
                opt.id === source ? "text-white" : "text-white/50"
              }`}
            >
              <span>{opt.label}</span>
              <span className="font-mono text-[11px] text-white/35">
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function resolveHtml(p: PromptDTO): string | null {
  if (p.previewHtml && p.previewHtml.trim().length > 40) return p.previewHtml;
  return localLivePreviewHtml(p.slug);
}

function LazyHtmlFrame({
  id,
  html,
  src,
  title,
}: {
  id: string;
  html?: string;
  src?: string;
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
        <ScaledLivePreview html={html} src={src} title={title} mode="card" />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] to-transparent" />
      )}
    </div>
  );
}

function FormatButton({
  label,
  icon,
  onClick,
  href,
  primary,
  done,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  primary?: boolean;
  done?: boolean;
}) {
  const className = primary
    ? "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[11px] font-bold text-black transition hover:bg-zinc-200"
    : "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 transition hover:bg-white/[0.08]";

  if (href) {
    return (
      <a
        href={href}
        download
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? <Check className="size-3.5 text-emerald-500" /> : icon}
        {done ? "Done" : label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={className}
    >
      {done ? <Check className="size-3.5 text-emerald-500" /> : icon}
      {done ? "Copied" : label}
    </button>
  );
}

/** Full-screen interactive kit — scroll / click inside the live HTML. */
function KitBrowseModal({
  kit,
  onClose,
  onCopied,
}: {
  kit: AnimationKit;
  onClose: () => void;
  onCopied: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyHtml() {
    if (!kit.htmlUrl) return;
    try {
      const res = await fetch(kit.htmlUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied("HTML copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopied("Could not copy HTML");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[100dvh] w-full max-w-[1280px] flex-col overflow-hidden bg-black sm:h-[min(90vh,900px)] sm:flex-row sm:rounded-[24px] sm:border sm:border-white/[0.08]">
        <div className="relative min-h-0 min-w-0 flex-1 bg-[#0d0d10]">
          {kit.htmlUrl ? (
            <ScaledLivePreview
              src={kit.htmlUrl}
              title={kit.title}
              mode="modal"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/40">
              No HTML preview
            </div>
          )}
        </div>
        <aside className="flex w-full shrink-0 flex-col border-t border-white/[0.08] p-5 sm:w-[280px] sm:border-l sm:border-t-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-white/40">
                #{kit.number} · {kit.category}
              </p>
              <h2 className="mt-1 text-[18px] font-semibold text-white">
                {kit.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-white/40">
            Scroll and click inside the live HTML on the left.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            {kit.htmlUrl && (
              <>
                <a
                  href={kit.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] px-4 py-3 text-[13px] font-semibold text-white/80 hover:bg-white/[0.06]"
                >
                  <ExternalLink className="size-3.5" />
                  Open full tab
                </a>
                <button
                  type="button"
                  onClick={() => void copyHtml()}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-3 text-[13px] font-bold text-black hover:bg-zinc-200"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Code2 className="size-3.5" />
                  )}
                  {copied ? "HTML copied" : "Copy HTML"}
                </button>
              </>
            )}
            {kit.zipUrl && (
              <a
                href={kit.zipUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] px-4 py-3 text-[13px] font-semibold text-white/80 hover:bg-white/[0.06]"
              >
                <Download className="size-3.5" />
                Download ZIP
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function KitCard({
  kit,
  onOpen,
  onCopied,
}: {
  kit: AnimationKit;
  onOpen: () => void;
  onCopied: (msg: string) => void;
}) {
  const [copied, setCopied] = useState<"html" | "md" | null>(null);

  async function copyHtml(e: React.MouseEvent) {
    e.stopPropagation();
    if (!kit.htmlUrl) return;
    try {
      const res = await fetch(kit.htmlUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied("html");
      onCopied("HTML copied");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      onCopied("Could not copy HTML");
    }
  }

  async function copyMd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!kit.mdUrl) return;
    try {
      const res = await fetch(kit.mdUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied("md");
      onCopied("MD copied");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      onCopied("Could not copy MD");
    }
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
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#0a0a0c] transition hover:border-white/20"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        <span className="absolute left-3 top-3 z-10 inline-flex min-w-9 items-center justify-center rounded-[10px] border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[13px] font-bold tracking-tight text-white backdrop-blur-md">
          #{kit.number}
        </span>
        {kit.htmlUrl ? (
          <LazyHtmlFrame
            id={`kit-${kit.id}`}
            src={kit.htmlUrl}
            title={kit.title}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-white/35">
            ZIP / MD pack
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            #{kit.number} · {kit.category}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-white">
            {kit.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {kit.htmlUrl && (
            <>
              <FormatButton
                label="Enter"
                icon={<ExternalLink className="size-3.5" />}
                onClick={onOpen}
              />
              <FormatButton
                label="Copy HTML"
                icon={<Code2 className="size-3.5" />}
                onClick={(e) => void copyHtml(e)}
                primary
                done={copied === "html"}
              />
            </>
          )}
          {kit.zipUrl && (
            <FormatButton
              label="ZIP"
              icon={<Download className="size-3.5" />}
              href={kit.zipUrl}
            />
          )}
          {kit.mdUrl && (
            <FormatButton
              label="MD"
              icon={<FileText className="size-3.5" />}
              onClick={(e) => void copyMd(e)}
              done={copied === "md"}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function PromptAnimationCard({
  prompt,
  html,
  number,
  onOpen,
  onCopied,
}: {
  prompt: PromptDTO;
  html: string;
  number: number;
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
        <span className="absolute left-3 top-3 z-10 inline-flex min-w-9 items-center justify-center rounded-[10px] border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[13px] font-bold tracking-tight text-white backdrop-blur-md">
          #{number}
        </span>
        <LazyHtmlFrame id={prompt.id} html={html} title={prompt.title} />
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            #{number} · {prompt.category}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-white">
            {prompt.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <FormatButton
            label="Enter"
            icon={<ExternalLink className="size-3.5" />}
            onClick={onOpen}
          />
          <FormatButton
            label="Copy HTML"
            icon={<Code2 className="size-3.5" />}
            onClick={copyHtml}
            primary
            done={copied === "html"}
          />
          <FormatButton
            label="Prompt"
            icon={<Copy className="size-3.5" />}
            onClick={copyPrompt}
            done={copied === "prompt"}
          />
        </div>
      </div>
    </article>
  );
}

export function AnimationsApp() {
  const [prompts, setPrompts] = useState<PromptDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<AnimSource>("mine");
  const [visibleCount, setVisibleCount] = useState(12);
  const [selected, setSelected] = useState<PromptDTO | null>(null);
  const [selectedKit, setSelectedKit] = useState<AnimationKit | null>(null);
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

  useEffect(() => {
    setVisibleCount(12);
  }, [source]);

  const vaultAnimations = useMemo(() => {
    return prompts
      .map((p) => ({ prompt: p, html: resolveHtml(p) }))
      .filter((x): x is { prompt: PromptDTO; html: string } => Boolean(x.html));
  }, [prompts]);

  const kits = ANIMATION_KITS;
  const listLen = source === "mine" ? kits.length : vaultAnimations.length;
  const showKits =
    source === "mine" ? kits.slice(0, visibleCount) : ([] as AnimationKit[]);
  const showVault =
    source === "vault"
      ? vaultAnimations.slice(0, visibleCount)
      : ([] as typeof vaultAnimations);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <SiteHeader active="animations" />

      <div className="relative z-10 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-start gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <ModeSwitcher active="animations" />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              Live HTML · ZIP · MD
            </p>
            <h1 className="mt-2 text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold tracking-tight text-white">
              Animations
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-white/45">
              Click a card to enter and scroll inside. Use the source menu to
              switch between your kits and vault HTML.
            </p>
          </div>

          <SourceMenu
            source={source}
            mineCount={kits.length}
            vaultCount={vaultAnimations.length}
            onChange={setSource}
          />
        </div>

        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
          {source === "mine"
            ? `My kits · #1–#12 from your folder`
            : `Vault HTML · Haldoren, Blendy, …`}
        </p>

        {loading && source === "vault" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] animate-pulse rounded-[22px] bg-white/[0.04]"
              />
            ))}
          </div>
        ) : listLen === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] px-6 py-20 text-center text-white/45">
            {source === "mine"
              ? "No personal kits yet."
              : "No vault HTML animations yet."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {showKits.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onOpen={() => setSelectedKit(kit)}
                  onCopied={(msg) => showToast(msg)}
                />
              ))}
              {showVault.map(({ prompt, html }, i) => (
                <PromptAnimationCard
                  key={prompt.id}
                  prompt={prompt}
                  html={html}
                  number={i + 1}
                  onOpen={() => setSelected(prompt)}
                  onCopied={(kind) =>
                    showToast(kind === "html" ? "HTML copied" : "Prompt copied")
                  }
                />
              ))}
            </div>
            {visibleCount < listLen && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + 9)}
                  className="rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Load more ({listLen - visibleCount} left)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedKit && (
        <KitBrowseModal
          kit={selectedKit}
          onClose={() => setSelectedKit(null)}
          onCopied={(msg) => showToast(msg)}
        />
      )}

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
