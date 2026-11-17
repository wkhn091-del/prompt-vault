/**
 * Refresh Stride prompt_text only — keep existing video, never insert a duplicate.
 *   npx tsx --env-file=.env.local scripts/update-stride-prompt.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { hashNormalized, normalizePromptText } from "../src/lib/extract";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const prompt = readFileSync(resolve("scripts/data/stride-prompt.md"), "utf8");
  const hash = hashNormalized(normalizePromptText(prompt));

  const { data: existing } = await supabase
    .from("prompts")
    .select("id, title, media_type, media_url")
    .eq("title", "Stride")
    .maybeSingle();

  if (!existing) {
    console.error("Stride row not found — abort (will not invent a second insert).");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("prompts")
    .update({
      prompt_text: prompt,
      normalized_hash: hash,
      category: "3D / WebGL",
    })
    .eq("id", existing.id)
    .select("id, title, category, media_type, media_url")
    .single();

  if (error) throw error;
  console.log("Updated existing Stride (video kept, no duplicate):", data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
