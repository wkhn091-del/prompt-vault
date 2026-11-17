"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import type { PromptDTO } from "@/lib/types";
import { CategoryPills } from "./CategoryPills";
import { PasteModal } from "./PasteModal";
import { PreviewModal } from "./PreviewModal";
import { PromptCard } from "./PromptCard";
import { Toast } from "./Toast";

export function VaultApp() {
  const [prompts, setPrompts] = useState<PromptDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [selected, setSelected] = useState<PromptDTO | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" | "info" = "success") => {
      setToast({ message, variant });
    },
    [],
  );

  useEffect(() => {
    // Guard against React Strict Mode double-invoke remounting a fetch loop
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/prompts");
        const data = await res.json();
        if (cancelled) return;

        if (res.status === 503) {
          setConfigError(data.error ?? "Supabase not configured");
          setPrompts([]);
          return;
        }

        setConfigError(null);
        if (res.ok) setPrompts(data.prompts as PromptDTO[]);
      } catch {
        if (!cancelled) setConfigError("Failed to load prompts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      const catOk = category === "All" || p.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [prompts, query, category]);

  function openExisting(id: string) {
    const found = prompts.find((p) => p.id === id);
    if (found) {
      setSelected(found);
      return;
    }
    void fetch(`/api/prompts/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.prompt) setSelected(d.prompt as PromptDTO);
      });
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.035),_transparent_50%)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0A0B]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.06] bg-[#141416]">
              <Sparkles className="size-4 text-white" />
            </div>
            <p className="text-sm font-semibold tracking-tight">Prompt Vault</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6f6f78]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-white/[0.06] bg-[#141416] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#5a5a62] focus:border-white/15"
            />
          </div>

          <button
            type="button"
            onClick={() => setPasteOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0A0A0B] transition hover:bg-zinc-200"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="mb-6">
          <CategoryPills active={category} onChange={setCategory} />
        </div>

        {configError && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {configError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] animate-pulse rounded-xl bg-[#141416]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#141416]/40 px-6 py-24 text-center">
            <Sparkles className="mb-4 size-8 text-[#5a5a62]" />
            <h2 className="text-xl font-semibold tracking-tight">
              {prompts.length === 0 ? "Your vault is empty" : "No prompts match"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#8b8b96]">
              {prompts.length === 0
                ? "Paste a prompt to extract media, mirror it to Supabase, and showcase it."
                : "Try another category or clear the search."}
            </p>
            {prompts.length === 0 && !configError && (
              <button
                type="button"
                onClick={() => setPasteOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0A0A0B] hover:bg-zinc-200"
              >
                <Plus className="size-4" />
                Add your first prompt
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onOpen={setSelected}
                onCopied={() => showToast("Prompt copied!")}
              />
            ))}
          </div>
        )}
      </main>

      <PasteModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onSaved={(p) => {
          setPrompts((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
        }}
        onViewExisting={openExisting}
        onToast={showToast}
      />

      <PreviewModal
        prompt={selected}
        onClose={() => setSelected(null)}
        onCopied={() => showToast("Prompt copied!")}
      />

      <Toast
        visible={Boolean(toast)}
        message={toast?.message ?? ""}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
