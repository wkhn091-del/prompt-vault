import data from "@/data/backgrounds.json";

export type BackgroundItem = {
  id: string;
  title: string;
  videoUrl: string;
  category: string;
  featured?: boolean;
  popular?: boolean;
  premium?: boolean;
  likes?: number;
};

export const BG_SORTS = ["Featured", "Popular", "Recent"] as const;
export type BgSort = (typeof BG_SORTS)[number];

export const BG_CATEGORIES = [
  "All",
  "Dark",
  "Light",
  "Abstract",
  "Nature",
  "Space",
  "Illustrated",
  "Surreal",
  "People",
  "Characters",
  "Objects",
  "City",
] as const;

export type BgCategory = (typeof BG_CATEGORIES)[number];

export const BACKGROUNDS = data as BackgroundItem[];

export function filterBackgrounds(
  sort: BgSort,
  category: BgCategory,
): BackgroundItem[] {
  let list = [...BACKGROUNDS];
  if (category !== "All") {
    list = list.filter((b) => b.category === category);
  }
  if (sort === "Featured") {
    list = list.filter((b) => b.featured).concat(list.filter((b) => !b.featured));
  } else if (sort === "Popular") {
    list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  } else {
    list = [...list].reverse();
  }
  return list;
}

export function featuredBackgrounds(): BackgroundItem[] {
  const featured = BACKGROUNDS.filter((b) => b.featured);
  return featured.length >= 3 ? featured.slice(0, 8) : BACKGROUNDS.slice(0, 6);
}
