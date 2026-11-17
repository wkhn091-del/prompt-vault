"use client";

import { CATEGORIES } from "@/lib/categories";

type CategoryPillsProps = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent" />
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-colors duration-200 ${
                isActive
                  ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                  : "bg-transparent text-white/45 hover:bg-white/[0.05] hover:text-white/80"
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
