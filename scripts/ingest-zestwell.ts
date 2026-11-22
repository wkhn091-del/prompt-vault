/**
 * Ingest Zestwell — Citrus Season gallery (separate from Leon Vasari).
 *   npx tsx --env-file=.env.local scripts/ingest-zestwell.ts
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

  const promptPath = resolve("scripts/data/zestwell-prompt.md");
  const videoPath = resolve("zestwell-demo.mp4");
  if (!existsSync(promptPath) || !existsSync(videoPath)) {
    throw new Error("Missing zestwell-prompt.md or zestwell-demo.mp4");
  }

  const PROMPT = readFileSync(promptPath, "utf8");
  const title = "Zestwell";
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
  console.log("Public URL:", mediaUrl);

  const payload = {
    title,
    slug,
    category: "Hero",
    prompt_text: PROMPT,
    media_url: mediaUrl,
    media_type: "video",
    backdrop_color: "#FFF9EC",
    normalized_hash: hash,
    is_premium: false,
    price: 0,
  };

  if (existingId) {
    const { data, error } = await supabase
      .from("prompts")
      .update(payload)
      .eq("id", existingId)
      .select("id, title, slug, media_type, media_url")
      .single();
    if (error) throw error;
    console.log("Updated:", data);
  } else {
    const { data, error } = await supabase
      .from("prompts")
      .insert(payload)
      .select("id, title, slug, media_type, media_url")
      .single();
    if (error) throw error;
    console.log("Inserted:", data);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
