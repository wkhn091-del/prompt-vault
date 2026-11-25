"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import { ANIMATION_KITS, type AnimationKit } from "@/lib/animation-kits";
import { requestHtmlSlot } from "@/lib/live-html-budget";
import {
  hasLocalLivePreview,
  localLivePreviewHtml,
  localLivePreviewSrc,
} from "@/lib/live-registry";
import type { PromptDTO } from "@/lib/types";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ACADEMY_URL } from "@/lib/academy-url";
import { ModeSwitcher } from "./ModeSwitcher";
import { PreviewModal } from "./PreviewModal";
import { SiteHeader } from "./SiteHeader";
import { LoopHtmlPreview } from "./LoopHtmlPreview";
import { ScaledLivePreview } from "./ScaledLivePreview";
import { Toast } from "./Toast";

type AnimSource = "mine" | "vault" | "files";

function isFilePack(kit: AnimationKit): boolean {
  if (kit.htmlUrl) return false;
  return Boolean(
    kit.zipUrl || kit.mdUrl || (kit.files && kit.files.length > 0),
  );
}

function SourceMenu({
  source,
  mineCount,
  vaultCount,
  filesCount,
  onChange,
}: {
  source: AnimSource;
  mineCount: number;
  vaultCount: number;
  filesCount: number;
  onChange: (s: AnimSource) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label =
    source === "mine" ? "Mine" : source === "files" ? "ZIP" : "Vault";

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
    <div ref={rootRef} className="relative z-[60] shrink-0 self-start sm:self-auto">
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
          className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[168px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#141416] py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)]"
        >
          {(
            [
              { id: "mine" as const, label: "Mine", count: mineCount },
              { id: "vault" as const, label: "Vault", count: vaultCount },
              {
                id: "files" as const,
                label: "ZIP / Files",
                count: filesCount,
              },
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
  if (localLivePreviewSrc(p.slug)) return null;
  if (p.previewHtml && p.previewHtml.trim().length > 40) return p.previewHtml;
  return localLivePreviewHtml(p.slug);
}

function resolveLiveSrc(p: PromptDTO): string | null {
  return localLivePreviewSrc(p.slug);
}

function hasAnimationPreview(p: PromptDTO): boolean {
  return Boolean(
    resolveLiveSrc(p) ||
      resolveHtml(p) ||
      hasLocalLivePreview(p.slug),
  );
}

function LazyHtmlFrame({
  id,
  html,
  src,
  title,
  eager = false,
}: {
  id: string;
  html?: string;
  src?: string;
  title: string;
  /** Mount immediately — first-row cards should not wait on IO. */
  eager?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(eager);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (eager) {
      setNear(true);
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "400px 0px", threshold: 0.01 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [id, eager]);

  useEffect(() => {
    if (!near) return;
    // Keep live once granted — tearing down heavy kits makes cards look stuck black.
    return requestHtmlSlot(id, () => setLive(true));
  }, [near, id]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-[#111]">
      {live ? (
        <LoopHtmlPreview
          html={html}
          src={src}
          title={title}
          mode="card"
          compact
          eager
          speed={1.4}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#141416] px-4">
          <div className="size-7 animate-pulse rounded-full bg-white/12" />
          <p className="line-clamp-2 text-center text-[11px] font-medium text-white/35">
            {title}
          </p>
        </div>
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

  async function copyMd() {
    if (!kit.mdUrl) return;
    try {
      const res = await fetch(kit.mdUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied("Copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopied("Could not copy");
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
      <div
        className="relative z-10 flex h-[100svh] w-full max-w-[1280px] flex-col overflow-hidden bg-black sm:h-[min(90vh,900px)] sm:flex-row sm:rounded-[24px] sm:border sm:border-white/[0.08]"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="relative min-h-[44dvh] max-h-[55dvh] min-w-0 flex-1 bg-[#0d0d10] sm:max-h-none sm:min-h-0">
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
        <aside
          className="flex w-full shrink-0 flex-col overflow-y-auto border-t border-white/[0.08] p-5 sm:w-[280px] sm:border-l sm:border-t-0"
          style={{
            paddingBottom:
              "max(1.25rem, calc(0.75rem + env(safe-area-inset-bottom)))",
            WebkitOverflowScrolling: "touch",
          }}
        >
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
              <a
                href={kit.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] px-4 py-3 text-[13px] font-semibold text-white/80 hover:bg-white/[0.06]"
              >
                <ExternalLink className="size-3.5" />
                Open full tab
              </a>
            )}
            {kit.zipUrl && (
              <a
                href={kit.zipUrl}
                download
                className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-semibold ${
                  kit.htmlUrl
                    ? "border border-white/[0.12] text-white/80 hover:bg-white/[0.06]"
                    : "bg-white font-bold text-black hover:bg-zinc-200"
                }`}
              >
                <Download className="size-3.5" />
                Download ZIP
              </a>
            )}
            {(kit.files ?? []).map((file) => (
              <a
                key={file.url}
                href={file.url}
                download
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] px-4 py-3 text-[13px] font-semibold text-white/80 hover:bg-white/[0.06]"
              >
                <Download className="size-3.5" />
                {file.label}
              </a>
            ))}
            {kit.mdUrl && (
              <button
                type="button"
                onClick={() => void copyMd()}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-3 text-[13px] font-bold text-black hover:bg-zinc-200"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CoinBadge({
  price,
  adminFree,
}: {
  price: number;
  adminFree?: boolean;
}) {
  return (
    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-[#d4af7a]/35 bg-black/75 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#f0d9a8] backdrop-blur-md">
      {adminFree ? "Admin · Free" : `${price} 🪙`}
    </span>
  );
}

function KitCard({
  kit,
  onOpen,
  onCopied,
  eager = false,
  adminFree = false,
}: {
  kit: AnimationKit;
  onOpen: () => void;
  onCopied: (msg: string) => void;
  eager?: boolean;
  adminFree?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const price = kit.coinPrice ?? 100;

  async function copyMd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!kit.mdUrl) return;
    try {
      const res = await fetch(kit.mdUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied("Copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopied("Could not copy");
    }
  }

  const showPoster = Boolean(kit.posterOnly || kit.posterUrl);

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
      <div className="relative isolate aspect-[16/10] overflow-hidden bg-[#111]">
        <span className="absolute left-3 top-3 z-10 inline-flex min-w-9 items-center justify-center rounded-[10px] border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[13px] font-bold tracking-tight text-white backdrop-blur-md">
          #{kit.number}
        </span>
        <CoinBadge price={price} adminFree={adminFree} />
        {showPoster && kit.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={kit.posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : kit.htmlUrl ? (
          <LazyHtmlFrame
            id={`kit-${kit.id}`}
            src={kit.htmlUrl}
            title={kit.title}
            eager={eager}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <Download className="size-7 text-white/35" />
            <p className="text-[12px] font-medium text-white/45">
              {[
                kit.zipUrl ? "ZIP" : null,
                kit.mdUrl ? "MD" : null,
                ...(kit.files?.map((f) => f.label) ?? []),
              ]
                .filter(Boolean)
                .join(" · ") || "File pack"}
            </p>
          </div>
        )}
      </div>

      <div className="relative z-[1] flex flex-col gap-3 bg-[#0a0a0c] px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            #{kit.number} · {kit.category}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-white">
            {kit.title}
          </h3>
          <p className="mt-1 text-[11px] text-white/40">
            {adminFree
              ? "Unlocked for admin"
              : `Earn coins in לימודים · ${ACADEMY_URL.replace(/^https?:\/\//, "")}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {kit.htmlUrl && (
            <FormatButton
              label="Enter"
              icon={<ExternalLink className="size-3.5" />}
              onClick={onOpen}
            />
          )}
          {kit.zipUrl && (
            <FormatButton
              label="ZIP"
              icon={<Download className="size-3.5" />}
              href={kit.zipUrl}
              primary={!kit.htmlUrl && !kit.mdUrl}
            />
          )}
          {(kit.files ?? []).map((file) => (
            <FormatButton
              key={file.url}
              label={file.label}
              icon={<Download className="size-3.5" />}
              href={file.url}
            />
          ))}
          {kit.mdUrl && (
            <FormatButton
              label="Copy"
              icon={<Copy className="size-3.5" />}
              onClick={(e) => void copyMd(e)}
              primary={!kit.htmlUrl}
              done={copied}
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
  src,
  number,
  onOpen,
  onCopied,
  eager = false,
}: {
  prompt: PromptDTO;
  html?: string;
  src?: string;
  number: number;
  onOpen: () => void;
  onCopied: () => void;
  eager?: boolean;
}) {
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1600);
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
      <div className="relative isolate aspect-[16/10] overflow-hidden bg-[#111]">
        <span className="absolute left-3 top-3 z-10 inline-flex min-w-9 items-center justify-center rounded-[10px] border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[13px] font-bold tracking-tight text-white backdrop-blur-md">
          #{number}
        </span>
        <LazyHtmlFrame
          id={prompt.id}
          html={html}
          src={src}
          title={prompt.title}
          eager={eager}
        />
      </div>

      <div className="relative z-[1] flex flex-col gap-3 bg-[#0a0a0c] px-4 py-3.5">
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
            label="Copy"
            icon={<Copy className="size-3.5" />}
            onClick={copyPrompt}
            primary
            done={copied}
          />
        </div>
      </div>
    </article>
  );
}

export function AnimationsApp() {
  const { isAdmin } = useIsAdmin();
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
      .map((p) => ({
        prompt: p,
        html: resolveHtml(p) ?? undefined,
        src: resolveLiveSrc(p) ?? undefined,
      }))
      .filter(
        (x) =>
          Boolean(x.src) ||
          Boolean(x.html) ||
          hasAnimationPreview(x.prompt),
      );
  }, [prompts]);

  const kits = ANIMATION_KITS;
  const htmlKits = useMemo(
    () => kits.filter((k) => Boolean(k.htmlUrl)),
    [kits],
  );
  const filePacks = useMemo(() => kits.filter(isFilePack), [kits]);
  const listLen =
    source === "mine"
      ? htmlKits.length
      : source === "files"
        ? filePacks.length
        : vaultAnimations.length;
  const showKits =
    source === "mine"
      ? htmlKits.slice(0, visibleCount)
      : source === "files"
        ? filePacks.slice(0, visibleCount)
        : ([] as AnimationKit[]);
  const showVault =
    source === "vault"
      ? vaultAnimations.slice(0, visibleCount)
      : ([] as typeof vaultAnimations);

  return (
    <div className="relative min-h-svh overflow-x-clip bg-black text-white">
      <SiteHeader active="animations" />

      <div className="relative z-50 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <ModeSwitcher active="animations" />
        </div>
      </div>

      <main className="mobile-dock-clear mobile-pad-x relative z-10 mx-auto max-w-[1400px] pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              Live HTML · ZIP · MD
            </p>
            <h1 className="mt-2 text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold tracking-tight text-white">
              Animations
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-white/45">
              Click a card to enter and scroll inside. Use the source menu for
              kits, vault HTML, or ZIP / non-HTML packs.
            </p>
          </div>

          <SourceMenu
            source={source}
            mineCount={htmlKits.length}
            vaultCount={vaultAnimations.length}
            filesCount={filePacks.length}
            onChange={setSource}
          />
        </div>

        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
          {source === "mine"
            ? `My kits · live HTML from your folder`
            : source === "files"
              ? `ZIP & files · packs without live HTML`
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
              : source === "files"
                ? "No ZIP / file packs yet."
                : "No vault HTML animations yet."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {showKits.map((kit, i) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  eager={i < 3 && !kit.posterOnly}
                  adminFree={isAdmin}
                  onOpen={() => setSelectedKit(kit)}
                  onCopied={(msg) => showToast(msg)}
                />
              ))}
              {showVault.map(({ prompt, html, src }, i) => (
                <PromptAnimationCard
                  key={prompt.id}
                  prompt={prompt}
                  html={html}
                  src={src}
                  number={i + 1}
                  eager={i < 3}
                  onOpen={() => setSelected(prompt)}
                  onCopied={() => showToast("Copied")}
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
