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
};

/** Same-origin kit HTML (keeps scripts/CDN — better than sanitized srcdoc). */
const LIVE_SRC: Record<string, string> = {
  haldoren: "/kits/haldoren/index.html",
  "kv-freight": "/kits/kv-freight/index.html",
  "maison-vell": "/kits/maison-vell/index.html",
  "beit-kodesh": "/kits/beit-kodesh/index.html",
  virtualfit: "/kits/virtualfit/index.html",
  "leon-vasari": "/kits/leon-vasari/index.html",
  mossline: "/kits/mossline/index.html",
  fernhollow: "/kits/fernhollow/index.html",
  vell: "/kits/vell/index.html",
  harborlux: "/kits/harborlux/index.html",
  "try-the-look": "/kits/try-the-look/index.html",
  blendy: "/kits/blendy/index.html",
  stride: "/kits/stride/index.html",
  jack: "/kits/jack/index.html",
};

export function localLivePreviewHtml(slug: string): string | null {
  const build = BUILDERS[slug.toLowerCase()];
  return build ? build() : null;
}

export function localLivePreviewSrc(slug: string): string | null {
  return LIVE_SRC[slug.toLowerCase()] ?? null;
}

export function hasLocalLivePreview(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase();
  return Boolean(LIVE_SRC[key] || BUILDERS[key]);
}
