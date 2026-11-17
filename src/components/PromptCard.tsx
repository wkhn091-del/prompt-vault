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
      className="group cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-[#141416] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0d10]">
        <MediaPreview
          mediaUrl={prompt.mediaUrl}
          mediaType={prompt.mediaType}
          title={prompt.title}
          className="transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0 flex items-baseline gap-2">
          <h3 className="truncate text-[15px] font-medium tracking-tight text-white">
            {prompt.title}
          </h3>
          <span className="shrink-0 truncate text-[13px] text-[#6f6f78]">
            {prompt.category}
          </span>
        </div>

        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#8b8b96] transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Copy prompt"
          title="Copy prompt"
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </article>
  );
}
