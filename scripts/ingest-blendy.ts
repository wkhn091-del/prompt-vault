/**
 * Mirror Blendy flavour sheets + insert/update the Hero live_preview row.
 *
 * Prefer full `preview_html` + `live_preview` when migrate-live-preview.sql
 * has been applied. Falls back to an image row (UI still renders full HTML
 * via src/lib/live-registry.ts keyed by slug `blendy`).
 *
 *   npx tsx --env-file=.env.local scripts/ingest-blendy.ts
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { buildBlendyFullPreviewHtml } from "../src/lib/blendy-preview";
import { BLENDY_SHEETS } from "../src/lib/live-registry";
import {
  extractFromPrompt,
  hashNormalized,
  normalizePromptText,
  slugify,
} from "../src/lib/extract";
import {
  DUPLICATE_THRESHOLD,
  similarityPercent,
} from "../src/lib/similarity";
import { mirrorToSupabase } from "../src/lib/storage";

const SOURCE_SHEETS = {
  berry:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_8803e421-29b1-4c24-8efd-54cae3f479b4.png",
  kiwi:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_b5695e60-72da-4b5b-bfb7-a091d528af75.png",
  banana:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_053958_6cf14029-4bce-4c9a-b9fc-1c5b185082e3.png",
  strawberry:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_055135_cbfb5a8d-c52b-4358-a6ee-d941c6c42285.png",
};

async function columnsReady(
  supabase: ReturnType<typeof createClient>,
): Promise<boolean> {
  const { error } = await supabase
    .from("prompts")
    .select("preview_html, backdrop_color")
    .limit(1);
  return !error;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const promptPath = "scripts/data/blendy-prompt.md";
  const PROMPT = existsSync(promptPath)
    ? readFileSync(promptPath, "utf8")
    : `# Blendy — smoothie flavour slider hero\n\n${SOURCE_SHEETS.berry}\n`;

  const extracted = extractFromPrompt(PROMPT);
  const norm = normalizePromptText(PROMPT);
  const hash = hashNormalized(norm);

  const { data: existing } = await supabase
    .from("prompts")
    .select("id, title, prompt_text, normalized_hash");

  for (const row of existing ?? []) {
    if (row.title === "Blendy") continue;
    if (row.normalized_hash === hash) {
      console.log(`Skipped duplicate: ${row.title}`);
      return;
    }
    const sim = similarityPercent(norm, normalizePromptText(row.prompt_text));
    if (sim >= DUPLICATE_THRESHOLD) {
      console.log(`Skipped duplicate: ${row.title} (${sim}%)`);
      return;
    }
  }

  console.log("Mirroring 4 flavour sheets…");
  const mirrored: Record<string, string> = { ...BLENDY_SHEETS };
  for (const [flavour, remote] of Object.entries(SOURCE_SHEETS)) {
    const up = await mirrorToSupabase(supabase, remote);
    mirrored[flavour] = up?.publicUrl ?? mirrored[flavour] ?? remote;
    console.log(flavour, mirrored[flavour]);
  }

  const previewHtml = buildBlendyFullPreviewHtml({
    berry: mirrored.berry,
    kiwi: mirrored.kiwi,
    banana: mirrored.banana,
    strawberry: mirrored.strawberry,
  });

  const hasLiveCols = await columnsReady(supabase);
  console.log(
    hasLiveCols
      ? "Schema ready — inserting live_preview + preview_html"
      : "Schema missing preview_html — inserting image row (UI uses live-registry)",
  );

  const base = {
    title: "Blendy",
    slug: slugify("Blendy"),
    category: "Hero",
    prompt_text: PROMPT,
    media_url: mirrored.berry,
    normalized_hash: hash,
    is_premium: false,
    price: 0,
  };

  const payload = hasLiveCols
    ? {
        ...base,
        media_type: "live_preview" as const,
        preview_html: previewHtml,
        backdrop_color: "#C2B0DC",
      }
    : {
        ...base,
        media_type: "image" as const,
      };

  const { data: old } = await supabase
    .from("prompts")
    .select("id")
    .eq("title", "Blendy");

  if (old?.[0]) {
    const upd = await supabase
      .from("prompts")
      .update(payload)
      .eq("id", old[0].id)
      .select("id, title, media_type, category")
      .maybeSingle();
    if (upd.error) throw upd.error;
    if (upd.data) {
      console.log("Updated:", upd.data, "html bytes:", previewHtml.length);
      return;
    }
    await supabase.from("prompts").delete().eq("id", old[0].id);
  }

  const { data, error } = await supabase
    .from("prompts")
    .insert(payload)
    .select("id, title, category, media_type, media_url")
    .single();

  if (error) throw error;
  console.log("Inserted:", data);
  console.log("preview_html bytes:", previewHtml.length);
  console.log("categories:", extracted.categories.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
