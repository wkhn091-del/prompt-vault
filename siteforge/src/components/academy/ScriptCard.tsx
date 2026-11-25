"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { pasteHint } from "../../lib/courses/adapter";

export function ScriptCard({
  id,
  text,
  note,
}: {
  id: string;
  text: string;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="my-4 overflow-hidden rounded-2xl border border-[#ffb35c]/30 bg-[#0c0a09]"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5">
        <code className="font-mono text-[11px] font-bold text-[#ffb35c] [direction:ltr]">
          {id}
        </code>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#ffb35c]/35 bg-[#ff7a45]/15 px-3 text-[12px] font-bold text-[#ffe0a8]"
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> הועתק ✓
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> העתק הכל
            </>
          )}
        </button>
      </div>
      <p className="border-b border-white/[0.06] bg-[#16120f] px-3 py-2 text-[12px] text-[#ffb08a]">
        {pasteHint()}
      </p>
      {note && (
        <p className="px-3 pt-2 text-[12px] text-white/45">{note}</p>
      )}
      <pre
        className="max-h-[420px] overflow-auto whitespace-pre-wrap px-3 py-3 font-mono text-[12px] leading-relaxed text-[#f5ede6]"
        dir="auto"
      >
        {text}
      </pre>
    </div>
  );
}
