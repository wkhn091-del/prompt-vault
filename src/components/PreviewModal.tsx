"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Code2,
  ExternalLink,
  Film,
  Heart,
  Loader2,
  X,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { copyAnimationVideo } from "@/lib/copy-screenshot";
import { localLivePreviewHtml } from "@/lib/live-registry";
import type { PromptDTO } from "@/lib/types";
import { CopyPromptMenu } from "./CopyPromptMenu";
import { MediaPreview } from "./MediaPreview";

type PreviewModalProps = {
  prompt: PromptDTO | null;
  onClose: () => void;
  onCopied: () => void;
  onUpdated?: (prompt: PromptDTO) => void;
  onVideoCopied?: (ok: boolean, error?: string) => void;
  /** Open on live HTML when companion HTML exists (Animations column). */
  preferHtml?: boolean;
};

export function PreviewModal({
  prompt,
  onClose,
  onCopied,
  onUpdated,
  onVideoCopied,
  preferHtml = false,
}: PreviewModalProps) {
  const [htmlDraft, setHtmlDraft] = useState("");
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [savingHtml, setSavingHtml] = useState(false);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [view, setView] = useState<"video" | "html">("video");
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    setHtmlDraft("");
    setShowHtmlEditor(false);
    setHtmlError(null);
    setSavingHtml(false);
    setVideoBusy(false);
    setVideoOk(false);
    setHtmlCopied(false);
    setView(preferHtml ? "html" : "video");
  }, [prompt?.id, preferHtml]);

  useEffect(() => {
    if (!prompt) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt, onClose]);

  if (!prompt) return null;

  const resolvedHtml =
    (prompt.previewHtml && prompt.previewHtml.trim().length > 20
      ? prompt.previewHtml
      : null) || localLivePreviewHtml(prompt.slug);
  const hasHtml = Boolean(resolvedHtml && resolvedHtml.trim().length > 20);
  const editingHtml = showHtmlEditor && !hasHtml;

  const hasVideo = Boolean(
    prompt.mediaUrl &&
      (prompt.mediaType === "video" ||
        /\.(mp4|webm|mov)(\?|#|$)/i.test(prompt.mediaUrl)),
  );
  const showHtmlView = hasHtml && (view === "html" || !hasVideo);

  async function copyHtml() {
    if (!resolvedHtml) return;
    try {
      await navigator.clipboard.writeText(resolvedHtml);
      setHtmlCopied(true);
      onCopied();
      setTimeout(() => setHtmlCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function browseHtml() {
    if (!resolvedHtml) return;
    const blob = new Blob([resolvedHtml], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function copyVideo() {
    if (!prompt || videoBusy) return;
    setVideoBusy(true);
    const result = await copyAnimationVideo({
      mediaUrl: prompt.mediaUrl,
      mediaType: prompt.mediaType,
    });
    setVideoBusy(false);
    if (result.ok) {
      setVideoOk(true);
      onVideoCopied?.(true);
      setTimeout(() => setVideoOk(false), 1600);
    } else {
      onVideoCopied?.(false, result.error);
    }
  }

  async function saveHtml() {
    if (!prompt || htmlDraft.trim().length < 20) {
      setHtmlError("Paste a full HTML snippet (at least 20 characters).");
      return;
    }
    setSavingHtml(true);
    setHtmlError(null);
    try {
      const { authFetch } = await import("@/lib/auth-fetch");
      const res = await authFetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewHtml: htmlDraft }),
      });
      const raw = await res.text();
      let data: { error?: string; prompt?: PromptDTO } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setHtmlError(
          `Save failed (${res.status}). Server returned a non-JSON response.`,
        );
        return;
      }
      if (!res.ok) {
        setHtmlError(data.error ?? `Failed to save HTML (${res.status})`);
        return;
      }
      if (!data.prompt) {
        setHtmlError("Save succeeded but no prompt returned.");
        return;
      }
      onUpdated?.(data.prompt);
      setShowHtmlEditor(false);
      setHtmlDraft("");
      onCopied();
    } catch (e) {
      setHtmlError(
        e instanceof Error ? e.message : "Network error while saving HTML",
      );
    } finally {
      setSavingHtml(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4 lg:p-6">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Motionsites-style: preview left · details right */}
      <div className="relative z-10 flex h-[100dvh] w-full max-w-[1280px] flex-col overflow-hidden bg-black sm:h-[min(86vh,820px)] sm:flex-row sm:rounded-[24px] sm:border sm:border-white/[0.08] sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* LEFT — video / live preview (~70%) */}
        <div className="relative min-h-[42vh] min-w-0 flex-1 bg-black sm:min-h-0 sm:flex-[1.65]">
          {hasHtml && hasVideo && (
            <div className="absolute left-3 top-3 z-20 flex gap-1 rounded-full border border-white/15 bg-black/70 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setView("video")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  !showHtmlView
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setView("html")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  showHtmlView
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                HTML
              </button>
            </div>
          )}
          <MediaPreview
            mediaUrl={prompt.mediaUrl}
            mediaType={prompt.mediaType}
            previewHtml={resolvedHtml}
            backdropColor={prompt.backdropColor}
            title={prompt.title}
            slug={prompt.slug}
            liveMode="modal"
            preferHtml={showHtmlView}
          />
        </div>

        {/* RIGHT — dark sidebar (~30%) */}
        <aside className="relative flex w-full max-w-none flex-col border-t border-white/[0.06] bg-[#0a0a0c] sm:w-[340px] sm:max-w-[38%] sm:shrink-0 sm:border-l sm:border-t-0 lg:w-[380px]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-20 flex size-9 items-center justify-center rounded-full bg-white/[0.04] text-white/40 transition hover:bg-white/[0.1] hover:text-white"
            aria-label="Close"
          >
            <X className="size-4 stroke-[1.5]" />
          </button>

          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-8 sm:px-7 sm:pt-10">
            <div className="pr-8">
              <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[28px]">
                {prompt.title}
              </h2>
              <p className="mt-2 text-[14px] font-medium text-white/40">
                {prompt.category}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[13px] text-white/35">
                <Heart className="size-3.5 fill-white/20 text-white/35" />
                {hasHtml ? "HTML ready" : "Prompt vault"}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {hasHtml && (
                <>
                  <button
                    type="button"
                    onClick={browseHtml}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3.5 text-[13px] font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    <ExternalLink className="size-4" />
                    Browse HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyHtml()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-[13px] font-bold text-black transition hover:bg-zinc-200"
                  >
                    {htmlCopied ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Code2 className="size-4" />
                    )}
                    {htmlCopied ? "HTML copied" : "Copy HTML"}
                  </button>
                </>
              )}

              {hasVideo && (
                <button
                  type="button"
                  onClick={() => void copyVideo()}
                  disabled={videoBusy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3.5 text-[13px] font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50"
                  title="Copy the animation video URL"
                >
                  {videoBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : videoOk ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Film className="size-4" />
                  )}
                  {videoOk ? "Video link copied" : "Copy video"}
                </button>
              )}

              <CopyPromptMenu
                promptText={prompt.promptText}
                html={resolvedHtml}
                onCopied={() => onCopied()}
                className="w-full"
                fullWidth
                menuPlacement="below"
              />
            </div>

            {isAdmin && !hasHtml && !editingHtml && (
              <button
                type="button"
                onClick={() => setShowHtmlEditor(true)}
                className="mt-3 w-full rounded-full border border-white/[0.1] bg-transparent px-4 py-3 text-[13px] font-medium text-white/55 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
              >
                Add HTML
              </button>
            )}

            {isAdmin && editingHtml && (
              <div className="mt-5 flex min-h-0 flex-1 flex-col">
                <label className="mb-2 block text-[12px] font-medium text-white/40">
                  Paste companion HTML
                </label>
                <textarea
                  value={htmlDraft}
                  onChange={(e) => setHtmlDraft(e.target.value)}
                  placeholder={"<!DOCTYPE html>\n<html>…</html>"}
                  className="min-h-[180px] flex-1 resize-none rounded-2xl border border-white/[0.08] bg-black/60 px-3.5 py-3 font-mono text-[11px] leading-relaxed text-white/85 outline-none placeholder:text-white/25 focus:border-white/20"
                  autoFocus
                />
                {htmlError && (
                  <p className="mt-2 text-[12px] text-amber-200/90">{htmlError}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHtmlEditor(false);
                      setHtmlDraft("");
                      setHtmlError(null);
                    }}
                    className="flex-1 rounded-full border border-white/[0.1] px-3 py-2.5 text-[12px] font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingHtml || htmlDraft.trim().length < 20}
                    onClick={() => void saveHtml()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-2.5 text-[12px] font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
                  >
                    {savingHtml && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    Save HTML
                  </button>
                </div>
              </div>
            )}

            {hasHtml && (
              <p className="mt-5 text-[12px] leading-relaxed text-white/30">
                Switch to HTML to scroll inside the live site, or Browse / Copy
                the full file.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
