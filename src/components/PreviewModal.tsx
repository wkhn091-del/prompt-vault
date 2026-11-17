"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import type { PromptDTO } from "@/lib/types";
import { MediaPreview } from "./MediaPreview";

type PreviewModalProps = {
  prompt: PromptDTO | null;
  onClose: () => void;
  onCopied: () => void;
};

export function PreviewModal({ prompt, onClose, onCopied }: PreviewModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [prompt?.id]);

  useEffect(() => {
    if (!prompt) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt, onClose]);

  if (!prompt) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt!.promptText);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="aspect-video w-full bg-black sm:aspect-[16/9]">
          <MediaPreview
            mediaUrl={prompt.mediaUrl}
            mediaType={prompt.mediaType}
            title={prompt.title}
            controls
          />
        </div>

        <div className="flex flex-col items-center gap-4 px-5 py-6 sm:flex-row sm:justify-between sm:px-7">
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="truncate text-xl font-semibold tracking-tight text-white">
              {prompt.title}
            </h2>
            <p className="mt-1 text-sm text-[#6f6f78]">{prompt.category}</p>
          </div>

          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0A0A0B] transition hover:bg-zinc-200"
          >
            {copied ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
