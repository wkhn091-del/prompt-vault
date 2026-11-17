"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { PromptDTO } from "@/lib/types";
import { MediaPreview } from "./MediaPreview";

type PromptCardProps = {
  prompt: PromptDTO;
  onOpen: (prompt: PromptDTO) => void;
  onCopied: () => void;
};

export function PromptCard({ prompt, onOpen, onCopied }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* toast handled by parent if needed */
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(prompt)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(prompt);
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0c0c0e] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,0.8,0.24,1)] hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <MediaPreview
          mediaUrl={prompt.mediaUrl}
          mediaType={prompt.mediaType}
          previewHtml={prompt.previewHtml}
          backdropColor={prompt.backdropColor}
          title={prompt.title}
          slug={prompt.slug}
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">
            {prompt.title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] font-medium tracking-wide text-white/40">
            {prompt.category}
          </p>
        </div>

        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white/70 transition hover:border-white/20 hover:bg-white hover:text-black"
          aria-label="Copy prompt"
          title="Copy prompt"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400 group-hover:text-emerald-600" />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </article>
  );
}
