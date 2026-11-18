import data from "@/data/animation-kits.json";

export type AnimationKit = {
  id: string;
  title: string;
  category: string;
  slug: string;
  htmlUrl: string | null;
  zipUrl: string | null;
  mdUrl: string | null;
};

export const ANIMATION_KITS = data as AnimationKit[];
