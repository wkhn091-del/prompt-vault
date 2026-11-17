import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const EXT_FROM_TYPE: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function extensionFromUrl(url: string): string {
  const clean = url.split("?")[0]?.split("#")[0] ?? url;
  const match = clean.match(/\.(mp4|webm|mov|png|jpe?g|webp|gif|avif)$/i);
  if (!match) return "";
  const ext = match[1].toLowerCase();
  return ext === "jpeg" ? ".jpg" : `.${ext}`;
}

export type UploadedMedia = {
  publicUrl: string;
  mediaType: "video" | "image";
  path: string;
};

/**
 * Fetch remote media on the server and upload into the Supabase `previews` bucket.
 */
export async function mirrorToSupabase(
  supabase: SupabaseClient,
  remoteUrl: string,
): Promise<UploadedMedia | null> {
  try {
    const res = await fetch(remoteUrl, {
      signal: AbortSignal.timeout(60_000),
      headers: { "User-Agent": "PromptVault/1.0" },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > 100 * 1024 * 1024) {
      return null;
    }

    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    const ext =
      EXT_FROM_TYPE[contentType] ||
      extensionFromUrl(remoteUrl) ||
      (contentType.startsWith("video/") ? ".mp4" : ".bin");

    const mediaType: "video" | "image" =
      contentType.startsWith("video/") ||
      /\.(mp4|webm|mov)$/i.test(ext) ||
      VIDEO_HINT.test(remoteUrl)
        ? "video"
        : "image";

    const hash = createHash("sha1").update(remoteUrl).digest("hex").slice(0, 20);
    const path = `${hash}${ext}`;

    const { error } = await supabase.storage.from("previews").upload(path, buffer, {
      contentType: contentType || (mediaType === "video" ? "video/mp4" : "image/webp"),
      upsert: true,
      cacheControl: "31536000",
    });

    if (error) {
      console.error("Supabase storage upload failed:", error.message);
      return null;
    }

    const { data } = supabase.storage.from("previews").getPublicUrl(path);
    return {
      publicUrl: data.publicUrl,
      mediaType,
      path,
    };
  } catch (err) {
    console.error("mirrorToSupabase error:", err);
    return null;
  }
}

const VIDEO_HINT = /\.(mp4|webm|mov)(\?|#|$)/i;
