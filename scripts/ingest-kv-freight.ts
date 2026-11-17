/**
 * Ingest KV Freight with trimmed screen-recording preview.
 *   npx tsx --env-file=.env.local scripts/ingest-kv-freight.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  hashNormalized,
  normalizePromptText,
  slugify,
} from "../src/lib/extract";
import {
  DUPLICATE_THRESHOLD,
  similarityPercent,
} from "../src/lib/similarity";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const promptPath = resolve("scripts/data/kv-freight-prompt.md");
  const videoPath = resolve("scripts/data/kv-freight-reference.mp4");
  if (!existsSync(promptPath) || !existsSync(videoPath)) {
    throw new Error("Missing kv-freight prompt or trimmed video");
  }

  const PROMPT = readFileSync(promptPath, "utf8");
  const title = "KV Freight";
  const slug = slugify(title);
  const norm = normalizePromptText(PROMPT);
  const hash = hashNormalized(norm);

  const { data: existing } = await supabase
    .from("prompts")
    .select("id, title, slug, prompt_text, normalized_hash");

  for (const row of existing ?? []) {
    if (
      row.title.trim().toLowerCase() === title.toLowerCase() ||
      row.slug.trim().toLowerCase() === slug
    ) {
      console.log(`Skipped duplicate (same title/slug): ${row.title}`);
      return;
    }
    if (row.normalized_hash === hash) {
      console.log(`Skipped duplicate (exact): ${row.title}`);
      return;
    }
    const sim = similarityPercent(norm, normalizePromptText(row.prompt_text));
    if (sim >= DUPLICATE_THRESHOLD) {
      console.log(`Skipped duplicate: ${row.title} (${sim}%)`);
      return;
    }
  }

  const buffer = readFileSync(videoPath);
  const path = `${createHash("sha1").update(buffer).digest("hex").slice(0, 20)}.mp4`;
  console.log(`Uploading ${buffer.byteLength} bytes → previews/${path}`);
  const { error: upErr } = await supabase.storage
    .from("previews")
    .upload(path, buffer, {
      contentType: "video/mp4",
      upsert: true,
      cacheControl: "31536000",
    });
  if (upErr) throw upErr;

  const mediaUrl = supabase.storage.from("previews").getPublicUrl(path).data
    .publicUrl;

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      title,
      slug,
      category: "Hero",
      prompt_text: PROMPT,
      media_url: mediaUrl,
      media_type: "video",
      backdrop_color: "#ffffff",
      normalized_hash: hash,
      is_premium: false,
      price: 0,
    })
    .select("id, title, category, media_type, media_url")
    .single();

  if (error) throw error;
  console.log("Inserted:", data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
