import { buildBlendyFullPreviewHtml } from "./blendy-preview";

/** Mirrored flavour sheets in Supabase Storage `previews`. */
export const BLENDY_SHEETS = {
  berry:
    "https://nbaiesobfntxhitwgwjo.supabase.co/storage/v1/object/public/previews/d08e5c8eebf241202dcf.png",
  kiwi:
    "https://nbaiesobfntxhitwgwjo.supabase.co/storage/v1/object/public/previews/ecf76113248ce152629a.png",
  banana:
    "https://nbaiesobfntxhitwgwjo.supabase.co/storage/v1/object/public/previews/8d418c366b92b1c204bd.png",
  strawberry:
    "https://nbaiesobfntxhitwgwjo.supabase.co/storage/v1/object/public/previews/03e87e040665b06fff52.png",
} as const;

/**
 * Local full-fidelity live previews keyed by slug.
 * Used when `preview_html` is not yet in the DB row (pre-migration) or as a
 * high-fidelity override for known MotionSites recreations.
 */
const BUILDERS: Record<string, () => string> = {
  blendy: () => buildBlendyFullPreviewHtml({ ...BLENDY_SHEETS }),
  // try-the-look uses the screen-recording .mp4 (demo blocks iframe embed)
};

export function localLivePreviewHtml(slug: string): string | null {
  const build = BUILDERS[slug.toLowerCase()];
  return build ? build() : null;
}
