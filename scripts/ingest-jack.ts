/**
 * Ingest Jack — 3D Creator portfolio (live kit + hero screenshot).
 *   npx tsx --env-file=.env.local scripts/ingest-jack.ts
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

  const promptPath = resolve("scripts/data/jack-prompt.md");
  const imagePath = resolve("scripts/data/jack-reference.png");
  if (!existsSync(promptPath) || !existsSync(imagePath)) {
    throw new Error("Missing jack-prompt.md or jack-reference.png");
  }

  const PROMPT = readFileSync(promptPath, "utf8");
  const title = "Jack";
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

  const buffer = readFileSync(imagePath);
  const path = `${createHash("sha1").update(buffer).digest("hex").slice(0, 20)}.png`;
  console.log(`Uploading ${buffer.byteLength} bytes → previews/${path}`);
  const { error: upErr } = await supabase.storage
    .from("previews")
    .upload(path, buffer, {
      contentType: "image/png",
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
    media_type: "image",
    backdrop_color: "#0C0C0C",
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
