import data from "@/data/animation-kits.json";

export type AnimationKit = {
  id: string;
  /** Folder number from Desktop kits (1, 4, 5… / B1, B2) */
  number: string;
  title: string;
  category: string;
  slug: string;
  htmlUrl: string | null;
  zipUrl: string | null;
  mdUrl: string | null;
};

export const ANIMATION_KITS = data as AnimationKit[];
