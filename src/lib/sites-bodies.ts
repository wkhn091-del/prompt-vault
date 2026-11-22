import bodies from "@/data/sites-bodies.json";
import type { SiteItem } from "./sites-library";

const BODIES = bodies as Record<string, string>;

export function getSiteBody(itemId: string): string {
  return (BODIES[itemId] || "").trim();
}

export function hasSiteBody(itemId: string): boolean {
  return Boolean(getSiteBody(itemId));
}

/** Clipboard payload — the format/script itself, not a Drive link. */
export function getSiteCopyText(item: SiteItem): string {
  const body = getSiteBody(item.id);
  if (body) {
    if (body.startsWith("#") || body.startsWith(item.title)) return body;
    return `# ${item.title}\n\n${body}`;
  }
  // Last resort for legacy steps without in-site body
  return `# ${item.title}\n\n${item.summary}`;
}
