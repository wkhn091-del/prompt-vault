/**
 * Fuzzy duplicate detection via Jaccard similarity on word trigrams.
 * Returns a 0–1 score; threshold for blocking is typically 0.85.
 */

export function wordTrigrams(text: string): Set<string> {
  const words = text.split(/\s+/).filter(Boolean);
  const grams = new Set<string>();

  if (words.length === 0) return grams;
  if (words.length < 3) {
    grams.add(words.join(" "));
    return grams;
  }

  for (let i = 0; i <= words.length - 3; i++) {
    grams.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return grams;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function similarityPercent(a: string, b: string): number {
  const score = jaccardSimilarity(wordTrigrams(a), wordTrigrams(b));
  return Math.round(score * 1000) / 10; // one decimal place
}

export const DUPLICATE_THRESHOLD = 85;
