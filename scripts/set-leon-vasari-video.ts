/**
 * Restore Leon Vasari card preview to the real VHS shelf recording.
 *   npx tsx --env-file=.env.local scripts/set-leon-vasari-video.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filePath = resolve("scripts/data/leon-vasari-reference.mp4");
  const buffer = readFileSync(filePath);
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 20);
  const path = `${hash}.mp4`;

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

  const { data, error } = await supabase
    .from("prompts")
    .update({ media_url: mediaUrl, media_type: "video" })
    .or("title.ilike.%Leon Vasari%,slug.ilike.%leon-vasari%")
    .select("id, title, slug, media_type, media_url");

  if (error) throw error;
  console.log("Updated:", data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
