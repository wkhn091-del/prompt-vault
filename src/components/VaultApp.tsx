"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import type { PromptDTO } from "@/lib/types";
import { PasteModal } from "./PasteModal";
import { PreviewModal } from "./PreviewModal";
import { PromptCard } from "./PromptCard";
import { SiteHeader } from "./SiteHeader";
import { Toast } from "./Toast";
import { VaultFilterBar } from "./VaultFilterBar";

export function VaultApp() {
  const { isAdmin } = useIsAdmin();
  const [prompts, setPrompts] = useState<PromptDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"featured" | "popular" | "recent">(
    "featured",
  );
  const [pasteOpen, setPasteOpen] = useState(false);
  const [selected, setSelected] = useState<PromptDTO | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

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
          setConfigError(
            (data as { error?: string }).error ??
              `Failed to load prompts (${res.status})`,
          );
          setPrompts([]);
          return;
        }

        setConfigError(null);
        setPrompts(((data as { prompts?: PromptDTO[] }).prompts ?? []) as PromptDTO[]);
      } catch {
        if (!cancelled) setConfigError("Failed to load prompts (network)");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Submit nav link → /#add opens the paste modal (admin only)
  useEffect(() => {
    function openFromHash() {
      if (isAdmin && window.location.hash === "#add") setPasteOpen(true);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = prompts.filter((p) => {
      const catOk = category === "All" || p.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    if (sort === "recent") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === "popular") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [prompts, query, category, sort]);

  function openExisting(id: string) {
    void import("@/lib/auth-fetch")
      .then(({ authFetch }) => authFetch(`/api/prompts/${id}`))
      .then((r) => r.json())
      .then((d) => {
        if (d.prompt) setSelected(d.prompt as PromptDTO);
      })
      .catch(() => {
        /* keep card-level selection */
      });
  }

  function clearFilters() {
    setCategory("All");
    setSort("featured");
    setQuery("");
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden
      />

      <SiteHeader
        active="sites"
        showSearch
        searchValue={query}
        onSearchChange={setQuery}
      />

      <VaultFilterBar
        sort={sort}
        onSortChange={setSort}
        category={category}
        onCategoryChange={setCategory}
        onClear={clearFilters}
      />

      <main className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {configError && (
          <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100">
            {configError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[22px] bg-white/[0.03]"
              >
                <div className="aspect-[16/10] animate-pulse bg-white/[0.04]" />
                <div className="h-14 animate-pulse bg-white/[0.02]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-28 text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              {prompts.length === 0 ? "Your vault is empty" : "No prompts match"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/40">
              {prompts.length === 0
                ? "Paste a prompt to extract media, mirror it to Supabase, and showcase it."
                : "Try another category or clear the search."}
            </p>
            {isAdmin && prompts.length === 0 && !configError && (
              <button
                type="button"
                onClick={() => setPasteOpen(true)}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                <Plus className="size-4" />
                Add your first prompt
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered
              .filter(
                (p) =>
                  Boolean(p.mediaUrl?.trim()) ||
                  Boolean(p.previewHtml && p.previewHtml.length > 40) ||
                  Boolean(p.slug),
              )
              .map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onOpen={(card) => {
                  setSelected(card);
                  // Hydrate full promptText from server (not in list payload)
                  void openExisting(card.id);
                }}
                onCopied={() => showToast("Prompt copied!")}
                onVideoCopied={(ok, error) =>
                  showToast(
                    ok
                      ? "Video link copied — paste into chat"
                      : error || "Copy video failed",
                    ok ? "success" : "error",
                  )
                }
              />
            ))}
          </div>
        )}
      </main>

      {isAdmin && (
        <PasteModal
          open={pasteOpen}
          onClose={() => setPasteOpen(false)}
          onSaved={(p) => {
            setPrompts((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
          }}
          onViewExisting={openExisting}
          onToast={showToast}
        />
      )}

      <PreviewModal
        prompt={selected}
        onClose={() => setSelected(null)}
        onCopied={() => showToast("Copied!")}
        onVideoCopied={(ok, error) =>
          showToast(
            ok
              ? "Video link copied — paste into chat"
              : error || "Copy video failed",
            ok ? "success" : "error",
          )
        }
        onUpdated={(p) => {
          setPrompts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
          setSelected(p);
          showToast("HTML saved");
        }}
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
