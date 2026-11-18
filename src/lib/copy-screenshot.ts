/**
 * Copy the animation video URL (הסרטון) to the clipboard.
 * Prefer the media URL so it can be pasted into an AI chat.
 */

export async function copyAnimationVideo(opts: {
  mediaUrl?: string | null;
  mediaType?: string | null;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const url = opts.mediaUrl?.trim();
  if (!url) {
    return { ok: false, error: "No video on this animation." };
  }

  const isVideo =
    opts.mediaType === "video" || /\.(mp4|webm|mov)(\?|#|$)/i.test(url);

  if (!isVideo && opts.mediaType === "live_preview") {
    return { ok: false, error: "This item is a live HTML preview — no video file." };
  }

  try {
    await navigator.clipboard.writeText(url);
    return { ok: true, url };
  } catch {
    return { ok: false, error: "Could not copy video link." };
  }
}

/** @deprecated use copyAnimationVideo */
export async function copyAnimationScreenshot(opts: {
  mediaUrl?: string | null;
  mediaType?: string | null;
  previewRoot?: HTMLElement | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await copyAnimationVideo(opts);
  if (result.ok) return { ok: true };
  return result;
}
