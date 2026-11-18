"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { ModeSwitcher } from "./ModeSwitcher";

type VaultFilterBarProps = {
  sort: "featured" | "popular" | "recent";
  onSortChange: (sort: "featured" | "popular" | "recent") => void;
  category: string;
  onCategoryChange: (category: string) => void;
  onClear: () => void;
};

export function VaultFilterBar({
  sort,
  onSortChange,
  category,
  onCategoryChange,
  onClear,
}: VaultFilterBarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sorts = [
    { id: "featured" as const, label: "Featured" },
    { id: "popular" as const, label: "Popular" },
    { id: "recent" as const, label: "Recent" },
  ];

  function scrollBy(dir: number) {
    scrollerRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  }

  return (
    <div className="border-b border-white/[0.05] bg-black/50">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-4 lg:px-8">
        <div className="flex shrink-0 items-center gap-2">
          <ModeSwitcher active="stats" />
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-2 text-[13px] font-medium text-white/40 transition hover:text-white/70"
          >
            Clear all
          </button>
        </div>

        <div className="flex h-10 shrink-0 items-center rounded-full border border-white/[0.1] bg-white/[0.02] p-1">
          {sorts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSortChange(s.id)}
              className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition ${
                sort === s.id
                  ? "bg-white/[0.12] text-white"
                  : "text-white/45 hover:text-white/75"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="hidden size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/45 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <div
            ref={scrollerRef}
            className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-0.5 scrollbar-none"
          >
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
