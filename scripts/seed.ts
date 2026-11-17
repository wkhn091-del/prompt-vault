/**
 * Seed the Stride example into Supabase.
 *
 * Prerequisites:
 * 1. Run supabase/schema.sql (+ allow-anon-insert.sql if no service_role)
 * 2. Fill .env.local with URL + anon/publishable key
 *
 *   npm run seed
 */

import { createClient } from "@supabase/supabase-js";
import {
  extractFromPrompt,
  hashNormalized,
  normalizePromptText,
  slugify,
} from "../src/lib/extract";
import { mirrorToSupabase } from "../src/lib/storage";

const STRIDE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261116_131908_b6239896-c077-450c-ad91-575153973fcf.mp4";

const SAMPLE = `# Stride — plant protein bar site with kinetic hero

Build a dark, premium landing page for Stride, a plant protein bar brand.
Hero section with bold typography, sticky product shot, and smooth scroll animations using GSAP and Lenis.
Include Three.js WebGL product orbit for the bar packaging.
Shop / cart CTA, SaaS-style pricing strip for subscription boxes.
AI-assisted copy tone: athletic, clean, modern.

Preview video:
${STRIDE_VIDEO}
`;

function env(name: string, optional = false): string {
  const v = process.env[name]?.trim() ?? "";
  if (!v && !optional) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

async function main() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    env("SUPABASE_SERVICE_ROLE_KEY", true) ||
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count, error: countError } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    console.log(`Skip seed — ${count} prompt(s) already exist.`);
    return;
  }

  const extracted = extractFromPrompt(SAMPLE);
  console.log("Mirroring Stride video to Supabase Storage…");
  const uploaded = await mirrorToSupabase(supabase, STRIDE_VIDEO);

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      title: extracted.title,
      slug: slugify(extracted.title),
      category: extracted.categories[0] ?? "Landing Page",
      prompt_text: SAMPLE,
      media_url: uploaded?.publicUrl ?? STRIDE_VIDEO,
      media_type: uploaded?.mediaType ?? "video",
      normalized_hash: hashNormalized(normalizePromptText(SAMPLE)),
      is_premium: false,
      price: 0,
    })
    .select("id, title, media_url")
    .single();

  if (error) throw error;

  console.log("Seeded:", data.title);
  console.log("Media:", data.media_url);
  console.log("Categories detected:", extracted.categories.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
