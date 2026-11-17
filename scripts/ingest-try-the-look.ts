/**
 * Ingest "Try the Look — Runway" (no .mp4 → live iframe of the real demo).
 * Skips if title/slug/text already exists (>85% or same name).
 *
 *   npx tsx --env-file=.env.local scripts/ingest-try-the-look.ts
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
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
import { buildRunwayLivePreviewHtml } from "../src/lib/runway-preview";
import { mirrorToSupabase } from "../src/lib/storage";

const LIVE_SITE = "https://reel-ref-try-the-look.vercel.app/";
const MODEL_1 =
  "https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp";

const FALLBACK_PROMPT = `# Try the Look. — Runway: exact recreation prompt

Build a single page that recreates the Shopify "runway" section called "Try the Look." exactly.
Nike-branded streetwear outfit carousel — six full-body models on a white stage, 3D ring, 5s autoplay, pins, "In this look" panel, styling bag.

Live reference: ${LIVE_SITE}
Primary model: ${MODEL_1}

Categories: Ecommerce, Hero, Animations, Landing Page
`;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const promptPath = resolve("scripts/data/try-the-look-prompt.md");
  const PROMPT = existsSync(promptPath)
    ? readFileSync(promptPath, "utf8")
    : FALLBACK_PROMPT;

  if (!existsSync(promptPath)) {
    writeFileSync(promptPath, PROMPT, "utf8");
    console.log("Wrote fallback prompt →", promptPath);
  }

  const extracted = extractFromPrompt(PROMPT);
  const title = "Try the Look.";
  const slug = slugify(title);
  const norm = normalizePromptText(PROMPT);
  const hash = hashNormalized(norm);

  const { data: existing } = await supabase
    .from("prompts")
    .select("id, title, slug, prompt_text, normalized_hash");

  let existingId: string | null = null;
  for (const row of existing ?? []) {
    const sameName =
      row.title.trim().toLowerCase() === title.toLowerCase() ||
      row.slug.trim().toLowerCase() === slug;
    if (sameName) {
      existingId = row.id;
      break;
    }
    if (row.normalized_hash === hash) {
      console.log(`Skipped duplicate (exact hash): ${row.title}`);
      return;
    }
    const sim = similarityPercent(norm, normalizePromptText(row.prompt_text));
    if (sim >= DUPLICATE_THRESHOLD) {
      console.log(`Skipped duplicate: ${row.title} (${sim}%)`);
      return;
    }
  }

  console.log("Mirroring hero model…");
  const mirrored = await mirrorToSupabase(supabase, MODEL_1);
  const mediaUrl = mirrored?.publicUrl ?? MODEL_1;
  console.log(mediaUrl);

  const previewHtml = buildRunwayLivePreviewHtml();

  const payload = {
    title,
    slug,
    category: "Ecommerce",
    prompt_text: PROMPT,
    media_url: mediaUrl,
    media_type: "live_preview" as const,
    preview_html: previewHtml,
    backdrop_color: "#ffffff",
    normalized_hash: hash,
    is_premium: false,
    price: 0,
  };

  if (existingId) {
    const { data, error } = await supabase
      .from("prompts")
      .update(payload)
      .eq("id", existingId)
      .select("id, title, category, media_type, media_url")
      .single();
    if (error) throw error;
    console.log("Updated existing (no duplicate insert):", data);
  } else {
    const { data, error } = await supabase
      .from("prompts")
      .insert(payload)
      .select("id, title, category, media_type, media_url")
      .single();
    if (error) throw error;
    console.log("Inserted:", data);
  }
  console.log("categories hint:", extracted.categories.join(", "));
  console.log("Live reference →", LIVE_SITE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
