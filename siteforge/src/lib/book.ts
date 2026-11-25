import fs from "fs";
import path from "path";
import { load as yamlLoad } from "js-yaml";

export type Track = { track_id: string; title: string };

export type StageMeta = {
  stage_id: string;
  title: string;
  track: string;
  prereq: string | null;
  kind: string;
  suggested_script_ids?: string[];
  source_refs?: string[];
};

export type Toc = {
  brand: string;
  locale: string;
  version: string;
  stage_count: number;
  tracks: Track[];
  projects: { project_id: string; stage_id: string; title: string }[];
  medals: { medal_id: string; stage_id: string }[];
  stages: StageMeta[];
};

export type StageDoc = {
  meta: Record<string, unknown> & {
    stage_id?: string;
    title?: string;
    track?: string;
    kind?: string;
    duration_min?: number;
    pass_score?: number;
    script_ids?: string[];
  };
  sections: { heading: string; body: string }[];
  raw: string;
};

function bookRoot() {
  return path.join(process.cwd(), "..", "academy-import", "siteforge-book");
}

export function getToc(): Toc {
  const file = path.join(bookRoot(), "toc.yaml");
  const raw = fs.readFileSync(file, "utf8");
  return yamlLoad(raw) as Toc;
}

function sanitizeFrontmatter(fm: string): string {
  // Quote scalar values that contain ":" so titles like "AI: …" parse.
  return fm
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
      if (!m) return line;
      const [, key, raw] = m;
      const v = raw.trim();
      if (
        v === "null" ||
        v === "[]" ||
        v.startsWith("[") ||
        v.startsWith("{") ||
        v.startsWith('"') ||
        v.startsWith("'") ||
        v.startsWith("-") ||
        !v.includes(":")
      ) {
        return line;
      }
      return `${key}: "${v.replace(/"/g, '\\"')}"`;
    })
    .join("\n");
}

function parseFrontmatter(md: string): { meta: Record<string, unknown>; body: string } {
  if (!md.startsWith("---")) return { meta: {}, body: md };
  const end = md.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: md };
  const fm = sanitizeFrontmatter(md.slice(3, end).trim());
  const body = md.slice(end + 4).replace(/^\r?\n/, "");
  try {
    const meta = (yamlLoad(fm) as Record<string, unknown>) || {};
    return { meta, body };
  } catch {
    return { meta: {}, body: md };
  }
}

function splitSections(body: string): { heading: string; body: string }[] {
  const parts = body.split(/^## /m).filter(Boolean);
  return parts.map((part) => {
    const nl = part.indexOf("\n");
    if (nl === -1) return { heading: part.trim(), body: "" };
    return { heading: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
  });
}

export function getStage(stageId: string): StageDoc | null {
  const file = path.join(bookRoot(), "stages", `${stageId}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return { meta, sections: splitSections(body), raw };
}

export function listStageIds(): string[] {
  const dir = path.join(bookRoot(), "stages");
  return fs
    .readdirSync(dir)
    .filter((f) => /^S\d+\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export function trackTitle(toc: Toc, trackId: string): string {
  return toc.tracks.find((t) => t.track_id === trackId)?.title ?? trackId;
}

export function stagesByTrack(toc: Toc): Map<string, StageMeta[]> {
  const map = new Map<string, StageMeta[]>();
  for (const t of toc.tracks) map.set(t.track_id, []);
  for (const s of toc.stages) {
    const list = map.get(s.track) ?? [];
    list.push(s);
    map.set(s.track, list);
  }
  return map;
}
