"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { detectCategories } from "@/lib/categories";
import type { DuplicateMatch, PromptDTO } from "@/lib/types";
import { MediaPreview } from "./MediaPreview";

type PasteModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (prompt: PromptDTO) => void;
  onViewExisting: (id: string) => void;
  onToast: (message: string, variant?: "success" | "error" | "info") => void;
};

export function PasteModal({
  open,
  onClose,
  onSaved,
  onViewExisting,
  onToast,
}: PasteModalProps) {
  const [text, setText] = useState("");
  const [htmlText, setHtmlText] = useState("");
  const [titleOverride, setTitleOverride] = useState("");
  const [mediaOverride, setMediaOverride] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setHtmlText("");
      setTitleOverride("");
      setMediaOverride("");
      setDuplicate(null);
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const preview = useMemo(() => {
    if (!text.trim()) return null;
    const titleMatch = text.match(/^#\s+(.+)$/m);
    let title = "Untitled Prompt";
    if (titleMatch?.[1]) {
      title =
        titleMatch[1].trim().split(/\s+[—–\-|:]\s+/)[0]?.trim() ||
        titleMatch[1].trim();
    }
    const urls =
      text.match(/https?:\/\/[^\s<>"'`)\]}]+/gi)?.map((u) =>
        u.replace(/[),.;:!?\]]+$/g, ""),
      ) ?? [];
    const videoUrl =
      urls.find((u) => /\.(mp4|webm|mov)(\?|#|$)/i.test(u)) ?? null;
    const imageUrl =
      urls.find((u) => {
        if (/\.(mp4|webm|mov)(\?|#|$)/i.test(u)) return false;
        return (
          /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(u) ||
          /images\.higgs\.ai|cloudfront\.net/i.test(u)
        );
      }) ?? null;
    const categories = detectCategories(text);
    const mediaUrl = mediaOverride.trim() || videoUrl || imageUrl;
    const mediaType =
      mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl)
        ? ("video" as const)
        : mediaUrl
          ? ("image" as const)
          : null;
    return {
      title,
      category: categories[0] ?? "Creative",
      mediaUrl,
      mediaType,
    };
  }, [text, mediaOverride]);

  if (!open) return null;

  async function save(force = false) {
    setSaving(true);
    setError(null);
    setDuplicate(null);

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: text,
          title: titleOverride.trim() || undefined,
          mediaUrl: mediaOverride.trim() || undefined,
          previewHtml: htmlText.trim() || undefined,
          force,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setDuplicate(data.duplicate as DuplicateMatch);
        setError(data.error as string);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        onToast(data.error ?? "Failed to save", "error");
        setSaving(false);
        return;
      }

      onSaved(data.prompt as PromptDTO);
      onToast("Prompt saved");
      onClose();
    } catch {
      setError("Network error");
      onToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/[0.08] bg-[#0f0f11] shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Add prompt
            </h2>
            <p className="text-sm text-[#8b8b96]">
              Paste raw text — media is mirrored to Supabase Storage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#8b8b96] hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`# Stride — plant protein bar site\n\nPaste the full prompt. Include a .mp4 / .webm or image URL for the preview.`}
            className="min-h-[180px] resize-none rounded-xl border border-white/[0.06] bg-[#141416] px-4 py-3 font-mono text-sm leading-relaxed text-[#e4e4e7] outline-none placeholder:text-[#4a4a52] focus:border-white/15"
            autoFocus
          />

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label className="block text-xs text-[#6f6f78]">
                HTML companion{" "}
                <span className="text-[#4a4a52]">(optional)</span>
              </label>
              {htmlText.trim().length > 20 && (
                <span className="text-[11px] text-emerald-400/80">
                  Will save · copyable as HTML
                </span>
              )}
            </div>
            <textarea
              value={htmlText}
              onChange={(e) => setHtmlText(e.target.value)}
              placeholder={"<!DOCTYPE html>\n<html>… paste live HTML for this animation …</html>"}
              className="min-h-[120px] w-full resize-y rounded-xl border border-white/[0.06] bg-[#141416] px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e4e4e7] outline-none placeholder:text-[#4a4a52] focus:border-white/15"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#5a5a62]">
              For video-only clips: keep the MP4 preview, and store HTML so you
              can copy it from the white button later.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-[#6f6f78]">
                Title override
              </label>
              <input
                value={titleOverride}
                onChange={(e) => setTitleOverride(e.target.value)}
                placeholder={preview?.title ?? "Auto from # Heading"}
                className="w-full rounded-lg border border-white/[0.06] bg-[#141416] px-3 py-2 text-sm text-white outline-none focus:border-white/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#6f6f78]">
                Media URL override
              </label>
              <input
                value={mediaOverride}
                onChange={(e) => setMediaOverride(e.target.value)}
                placeholder="https://… .mp4 / .webp"
                className="w-full rounded-lg border border-white/[0.06] bg-[#141416] px-3 py-2 text-sm text-white outline-none focus:border-white/15"
              />
            </div>
          </div>

          {preview && (
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#141416]">
              <div className="aspect-video bg-[#0d0d10]">
                <MediaPreview
                  mediaUrl={preview.mediaUrl}
                  mediaType={preview.mediaType}
                  title={titleOverride || preview.title}
                />
              </div>
              <div className="flex items-baseline gap-2 px-3.5 py-3">
                <p className="truncate text-sm font-medium text-white">
                  {titleOverride || preview.title}
                </p>
                <span className="text-xs text-[#6f6f78]">{preview.category}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              <div className="mb-2 flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <p>{error}</p>
              </div>
              {duplicate && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onViewExisting(duplicate.id);
                      onClose();
                    }}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    View Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => save(true)}
                    disabled={saving}
                    className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-1.5 text-xs text-amber-50 hover:bg-amber-500/30"
                  >
                    Force Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicate(null);
                      setError(null);
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm text-[#a1a1aa] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || text.trim().length < 20}
            onClick={() => save(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0B] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
