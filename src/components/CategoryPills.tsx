"use client";

import { CATEGORIES } from "@/lib/categories";

type CategoryPillsProps = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0A0A0B] to-transparent" />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-white/20 bg-white text-[#0A0A0B]"
                  : "border-white/[0.06] bg-[#141416] text-[#a1a1aa] hover:border-white/12 hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
