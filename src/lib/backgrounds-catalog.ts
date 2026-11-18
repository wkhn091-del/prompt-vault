import data from "@/data/backgrounds.json";

export type BackgroundItem = {
  id: string;
  title: string;
  /** Clean full video — used for Copy URL */
  videoUrl: string;
  /** Lightweight preview for on-page playback (fast) */
  previewUrl?: string;
  category: string;
  featured?: boolean;
  popular?: boolean;
  premium?: boolean;
  likes?: number;
};

export const BG_SORTS = ["Featured", "Popular", "Recent"] as const;
export type BgSort = (typeof BG_SORTS)[number];

export const BG_ACCESS = ["All", "Free", "Paid"] as const;
export type BgAccess = (typeof BG_ACCESS)[number];

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

export function displayVideoUrl(item: BackgroundItem): string {
  // Free clips: always clean CloudFront. Motionsites previewUrls bake in their logo.
  if (!item.premium) return item.videoUrl;
  return item.previewUrl || item.videoUrl;
}

export function filterBackgrounds(
  sort: BgSort,
  category: BgCategory,
  access: BgAccess = "All",
): BackgroundItem[] {
  let list = [...BACKGROUNDS];
  if (access === "Free") {
    list = list.filter((b) => !b.premium);
  } else if (access === "Paid") {
    list = list.filter((b) => Boolean(b.premium));
  }
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

export function featuredBackgrounds(access: BgAccess = "All"): BackgroundItem[] {
  let pool = BACKGROUNDS;
  if (access === "Free") pool = pool.filter((b) => !b.premium);
  if (access === "Paid") pool = pool.filter((b) => Boolean(b.premium));
  const featured = pool.filter((b) => b.featured);
  if (featured.length >= 4) return featured.slice(0, 8);
  return pool.slice(0, 8);
}

export function accessCounts() {
  return {
    all: BACKGROUNDS.length,
    free: BACKGROUNDS.filter((b) => !b.premium).length,
    paid: BACKGROUNDS.filter((b) => Boolean(b.premium)).length,
  };
}
