"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Code2, Copy, FileText } from "lucide-react";

type CopyPromptMenuProps = {
  promptText: string;
  html: string | null;
  onCopied: (kind: "prompt" | "html") => void;
  className?: string;
  fullWidth?: boolean;
  menuPlacement?: "above" | "below";
};

export function CopyPromptMenu({
  promptText,
  html,
  onCopied,
  className = "",
  fullWidth = false,
  menuPlacement = "above",
}: CopyPromptMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"prompt" | "html" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasHtml = Boolean(html && html.trim().length > 20);

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

  async function copy(kind: "prompt" | "html") {
    const value = kind === "prompt" ? promptText : html;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      onCopied(kind);
      setOpen(false);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  const label =
    copied === "html"
      ? "HTML copied!"
      : copied === "prompt"
        ? "Copied!"
        : "Copy prompt";

  return (
    <div
      ref={rootRef}
      className={`relative ${fullWidth ? "flex w-full" : "inline-flex"} ${className}`}
    >
      <div
        className={`inline-flex overflow-hidden rounded-full bg-white shadow-sm ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => void copy("prompt")}
          className={`inline-flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold tracking-tight text-black transition hover:bg-zinc-100 ${
            fullWidth ? "flex-1 justify-center" : ""
          }`}
        >
          {copied ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {label}
        </button>
        <button
          type="button"
          aria-label="More copy options"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="border-l border-black/10 px-3 text-black/70 transition hover:bg-zinc-100 hover:text-black"
        >
          <ChevronDown
            className={`size-4 transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div
          className={`absolute left-0 right-0 z-30 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#141416] py-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] ${
            menuPlacement === "below"
              ? "top-[calc(100%+8px)]"
              : "bottom-[calc(100%+8px)]"
          } ${fullWidth ? "min-w-0" : "min-w-[200px]"}`}
        >
          <button
            type="button"
            onClick={() => void copy("prompt")}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-white/85 transition hover:bg-white/[0.06]"
          >
            <FileText className="size-3.5 text-white/45" />
            Prompt
          </button>
          <button
            type="button"
            disabled={!hasHtml}
            onClick={() => void copy("html")}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-white/85 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Code2 className="size-3.5 text-white/45" />
            HTML
            {!hasHtml && (
              <span className="ml-auto text-[11px] font-normal text-white/30">
                none
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
