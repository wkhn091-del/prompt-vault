import type { PromptRow } from "./supabase";
import type { PromptDTO } from "./types";

/** Safe list/card fields — no prompt_text / hash / price leakage. */
export function toPublicPromptDTO(row: PromptRow): PromptDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    promptText: "",
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    previewHtml: row.preview_html ?? null,
    backdropColor: row.backdrop_color ?? null,
    isPremium: row.is_premium,
    price: 0,
    createdAt: row.created_at,
  };
}

export function toPromptDTO(row: PromptRow): PromptDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    // promptText is for clipboard copy only — never render in the UI
    promptText: row.prompt_text,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    previewHtml: row.preview_html ?? null,
    backdropColor: row.backdrop_color ?? null,
    isPremium: row.is_premium,
    price: typeof row.price === "string" ? Number(row.price) : row.price,
    createdAt: row.created_at,
  };
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
