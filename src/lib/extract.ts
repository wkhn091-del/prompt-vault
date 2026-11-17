import { createHash } from "crypto";
import { detectCategories, type FilterCategory } from "./categories";

const URL_RE =
  /https?:\/\/[^\s<>"'`)\]}]+/gi;

const VIDEO_EXT_RE = /\.(mp4|webm|mov)(\?|#|$)/i;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i;
const IMAGE_HOST_RE =
  /(images\.higgs\.ai|cloudfront\.net|imgur\.com|unsplash\.com|images\.unsplash\.com)/i;

export type ExtractedMedia = {
  videoUrls: string[];
  imageUrls: string[];
  videoUrl: string | null;
  imageUrl: string | null;
  previewUrl: string | null;
};

export type ExtractedPrompt = ExtractedMedia & {
  title: string;
  slug: string;
  categories: FilterCategory[];
  normalizedText: string;
  normalizedHash: string;
};

function cleanUrl(raw: string): string {
  return raw.replace(/[),.;:!?\]]+$/g, "");
}

export function extractMedia(promptText: string): ExtractedMedia {
  const matches = promptText.match(URL_RE) ?? [];
  const urls = [...new Set(matches.map(cleanUrl))];

  const videoUrls = urls.filter((u) => VIDEO_EXT_RE.test(u));
  const imageUrls = urls.filter((u) => {
    if (VIDEO_EXT_RE.test(u)) return false;
    return IMAGE_EXT_RE.test(u) || IMAGE_HOST_RE.test(u);
  });

  const videoUrl = videoUrls[0] ?? null;
  const imageUrl = imageUrls[0] ?? null;

  return {
    videoUrls,
    imageUrls,
    videoUrl,
    imageUrl,
    previewUrl: videoUrl ?? imageUrl,
  };
}

export function extractTitle(promptText: string): string {
  const heading = promptText.match(/^#\s+(.+)$/m);
  if (heading?.[1]) {
    const raw = heading[1].trim();
    // "Stride — plant protein..." or "Stride - ..." or "Stride: ..."
    const primary = raw.split(/\s+[—–\-|:]\s+/)[0]?.trim() ?? raw;
    // Drop trailing marketing fluff after em dash glued without spaces
    return primary.replace(/\s+/g, " ").slice(0, 80) || "Untitled Prompt";
  }

  const firstLine = promptText
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith("http"));

  if (firstLine) {
    return firstLine.replace(/^#+\s*/, "").slice(0, 60);
  }

  return "Untitled Prompt";
}

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return base || `prompt-${Date.now().toString(36)}`;
}

export function normalizePromptText(text: string): string {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/[#>*_\-~\[\](){}|]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashNormalized(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

export function extractFromPrompt(promptText: string): ExtractedPrompt {
  const media = extractMedia(promptText);
  const title = extractTitle(promptText);
  const categories = detectCategories(promptText);
  const normalizedText = normalizePromptText(promptText);
  const normalizedHash = hashNormalized(normalizedText);

  return {
    ...media,
    title,
    slug: slugify(title),
    categories,
    normalizedText,
    normalizedHash,
  };
}
