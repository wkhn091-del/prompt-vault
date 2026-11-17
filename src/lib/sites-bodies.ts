import bodies from "@/data/sites-bodies.json";
import type { SiteItem } from "./sites-library";

const BODIES = bodies as Record<string, string>;

export function getSiteCopyText(item: SiteItem): string {
  const body = BODIES[item.id] || "";
  if (body.trim()) {
    return `# ${item.title}\n\n${item.summary}\n\n---\n\n${body.trim()}`;
  }
  return `# ${item.title}\n\n${item.summary}\n\nDrive:\n${item.href}`;
}

export function hasSiteBody(itemId: string): boolean {
  return Boolean(BODIES[itemId]);
}
