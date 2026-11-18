import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractFromPrompt, normalizePromptText } from "@/lib/extract";
import {
  buildGenericLivePreviewHtml,
  extractBackdropColor,
} from "@/lib/live-preview";
import { toPromptDTO, toPublicPromptDTO, uniqueSlug } from "@/lib/prompts";
import {
  DUPLICATE_THRESHOLD,
  similarityPercent,
} from "@/lib/similarity";
import { createServiceClient, hasSupabaseEnv, type PromptRow } from "@/lib/supabase";
import { requireAdmin } from "@/lib/supabase-server";
import { mirrorToSupabase } from "@/lib/storage";
import type { DuplicateMatch, MediaType } from "@/lib/types";

export const runtime = "nodejs";

const createSchema = z
  .object({
    promptText: z.string().min(20, "Prompt is too short").max(500_000),
    title: z.string().min(1).max(120).optional(),
    category: z.string().min(1).max(60).optional(),
    mediaUrl: z.string().url().max(2000).nullable().optional(),
    /** Optional HTML companion — saved even when preview is video/image. */
    previewHtml: z.string().min(20).max(2_000_000).optional(),
    force: z.boolean().optional().default(false),
    isPremium: z.boolean().optional().default(false),
    price: z.number().nonnegative().max(1_000_000).optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          prompts: [],
        },
        { status: 503 },
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = req.nextUrl;
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const category = (searchParams.get("category") ?? "All").trim();

    // Prefer public_prompts (safe view). Fall back to prompts table.
    const publicSelect = await supabase
      .from("public_prompts")
      .select(
        "id, title, slug, category, media_url, media_type, preview_html, backdrop_color, is_premium, created_at",
      )
      .order("created_at", { ascending: false });

    let rows: PromptRow[] = [];

    if (!publicSelect.error && Array.isArray(publicSelect.data)) {
      rows = publicSelect.data as PromptRow[];
    } else {
      const full = await supabase
        .from("prompts")
        .select(
          "id, title, slug, category, media_url, media_type, preview_html, backdrop_color, is_premium, created_at",
        )
        .order("created_at", { ascending: false });

      if (full.error) {
        return NextResponse.json(
          {
            error:
              full.error.message ||
              publicSelect.error?.message ||
              "Failed to load prompts",
            prompts: [],
          },
          { status: 500 },
        );
      }
      rows = (full.data as PromptRow[] | null) ?? [];
    }

    let filtered = rows.map(toPublicPromptDTO);

    if (category && category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({ prompts: filtered });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load prompts";
    return NextResponse.json({ error: message, prompts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Add keys to .env.local (see .env.example).",
      },
      { status: 503 },
    );
  }

  const gate = await requireAdmin(req);
  if ("response" in gate) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { sanitizePreviewHtml } = await import("@/lib/sanitize-html");

  const input = parsed.data;
  const extracted = extractFromPrompt(input.promptText);
  const title = input.title?.trim() || extracted.title;
  const category =
    input.category?.trim() || extracted.categories[0] || "Creative";

  const supabase = createServiceClient();

  const { data: existing, error: listError } = await supabase
    .from("prompts")
    .select("id, title, slug, prompt_text, normalized_hash");

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  let duplicate: DuplicateMatch | null = null;
  const rows = existing ?? [];
  const titleKey = title.trim().toLowerCase();
  const slugKey = extracted.slug.trim().toLowerCase();

  const sameIdentity = rows.find(
    (r) =>
      r.title.trim().toLowerCase() === titleKey ||
      r.slug.trim().toLowerCase() === slugKey,
  );
  if (sameIdentity) {
    duplicate = {
      id: sameIdentity.id,
      title: sameIdentity.title,
      slug: sameIdentity.slug,
      similarity: 100,
      exact: true,
    };
  }

  const exact = rows.find((r) => r.normalized_hash === extracted.normalizedHash);
  if (!duplicate && exact) {
    duplicate = {
      id: exact.id,
      title: exact.title,
      slug: exact.slug,
      similarity: 100,
      exact: true,
    };
  } else if (!duplicate) {
    let best: DuplicateMatch | null = null;
    for (const row of rows) {
      const otherNorm = normalizePromptText(row.prompt_text);
      const sim = similarityPercent(extracted.normalizedText, otherNorm);
      if (sim >= DUPLICATE_THRESHOLD && (!best || sim > best.similarity)) {
        best = {
          id: row.id,
          title: row.title,
          slug: row.slug,
          similarity: sim,
          exact: false,
        };
      }
    }
    duplicate = best;
  }

  if (duplicate && !input.force) {
    return NextResponse.json(
      {
        error: `Duplicate Detected! ${duplicate.similarity}% match with existing prompt: '${duplicate.title}'.`,
        duplicate,
      },
      { status: 409 },
    );
  }

  const sourceMediaUrl =
    input.mediaUrl !== undefined
      ? input.mediaUrl
      : extracted.videoUrl ?? extracted.imageUrl;

  const backdropColor = extractBackdropColor(input.promptText);
  const prefersVideo =
    Boolean(extracted.videoUrl) ||
    (!!sourceMediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(sourceMediaUrl));

  let mediaUrl: string | null = sourceMediaUrl;
  let mediaType: MediaType | null = prefersVideo
    ? "video"
    : extracted.imageUrl
      ? "image"
      : null;
  let previewHtml: string | null = input.previewHtml?.trim()
    ? sanitizePreviewHtml(input.previewHtml.trim())
    : null;

  if (sourceMediaUrl && /^https?:\/\//i.test(sourceMediaUrl)) {
    const uploaded = await mirrorToSupabase(supabase, sourceMediaUrl);
    if (uploaded) {
      mediaUrl = uploaded.publicUrl;
      mediaType = uploaded.mediaType;
    }
  }

  const wantsLive =
    !previewHtml &&
    mediaType !== "video" &&
    !prefersVideo &&
    Boolean(mediaUrl);
  if (wantsLive && mediaUrl) {
    mediaType = "live_preview";
    previewHtml = buildGenericLivePreviewHtml({
      imageUrl: mediaUrl,
      backdrop: backdropColor || "#141416",
      label: title.split(/\s+/)[0] || title,
    });
  }

  if (prefersVideo || (mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl))) {
    mediaType = "video";
  }

  const slug = await uniqueSlug(extracted.slug, async (s) => {
    const { data } = await supabase
      .from("prompts")
      .select("id")
      .eq("slug", s)
      .maybeSingle();
    return Boolean(data);
  });

  const baseRow = {
    title,
    slug,
    category,
    prompt_text: input.promptText,
    media_url: mediaUrl,
    media_type: mediaType,
    normalized_hash: extracted.normalizedHash,
    is_premium: input.isPremium ?? false,
    price: input.price ?? 0,
  };

  const hasHtmlFields = Boolean(previewHtml) || Boolean(backdropColor);

  let created: PromptRow | null = null;
  let insertError: { message: string; code?: string } | null = null;

  if (hasHtmlFields || wantsLive) {
    const full = await supabase
      .from("prompts")
      .insert({
        ...baseRow,
        preview_html: previewHtml,
        backdrop_color: backdropColor,
      })
      .select("*")
      .single();
    created = (full.data as PromptRow | null) ?? null;
    insertError = full.error;
  }

  if (
    !created &&
    (insertError?.message?.includes("preview_html") ||
      insertError?.message?.includes("backdrop_color") ||
      insertError?.message?.includes("live_preview") ||
      insertError?.code === "PGRST204" ||
      !hasHtmlFields)
  ) {
    const fallback = await supabase
      .from("prompts")
      .insert({
        ...baseRow,
        media_type:
          mediaType === "live_preview"
            ? mediaUrl && /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl)
              ? "video"
              : "image"
            : mediaType,
      })
      .select("*")
      .single();
    created = (fallback.data as PromptRow | null) ?? null;
    insertError = fallback.error;
  }

  if (insertError || !created) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save prompt" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      prompt: toPromptDTO(created as PromptRow),
      duplicateWarning: duplicate,
    },
    { status: 201 },
  );
}
