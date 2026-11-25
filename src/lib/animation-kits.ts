import data from "@/data/animation-kits.json";

export type AnimationKitFile = {
  label: string;
  url: string;
};

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
  /** Extra non-HTML downloads (PDF, assets, etc.) */
  files?: AnimationKitFile[];
  /** Cost in academy coins to unlock (display + future spend). */
  coinPrice?: number;
  /** Grid card shows poster only — no live iframe. */
  posterOnly?: boolean;
  /** Static preview image for the card. */
  posterUrl?: string | null;
};

export const ANIMATION_KITS = data as AnimationKit[];
