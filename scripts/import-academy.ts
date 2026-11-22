/**
 * Import 38 redesigned format guides into Prompt Vault.
 *
 * Source: Drive folder "Prompt Vault – 38 פורמטים מעוצבים"
 *   entries.json → prompts table (+ covers → public/academy/)
 *
 * Default: dry-run (print create/skip). Never overwrites existing slugs.
 *
 *   npx tsx --env-file=.env.local scripts/import-academy.ts
 *   npx tsx --env-file=.env.local scripts/import-academy.ts --apply
 *
 * Optional:
 *   --entries <path>   default: .tmp-academy-import/entries.json
 *   --folders <path>   Drive subfolder map (order → folder id)
 */

import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ROOT = path.resolve(__dirname, "..");
const DRIVE_ROOT = "1om64QKfD6-hwuVZKYAomCiX-lLMYjiM7";
const PUBLIC_ACADEMY = path.join(ROOT, "public", "academy");

type ImportMeta = {
  order?: number;
  cover?: string;
  tagline?: string;
  accent?: string;
  status?: string;
};

type Entry = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  promptText: string;
  mediaUrl: string | null;
  mediaType: string | null;
  previewHtml: string | null;
  backdropColor: string | null;
  isPremium: boolean | null;
  price: number | null;
  _import?: ImportMeta;
};

type FolderMap = { order: number; id: string; slug: string };

type PlanRow = {
  slug: string;
  title: string;
  category: string;
  action: "create" | "skip";
  mediaUrl: string;
  coverSource: string;
  reason?: string;
};

function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

function argValue(name: string): string | null {
  const i = process.argv.indexOf(name);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

function env(name: string, optional = false): string {
  const v = process.env[name]?.trim() ?? "";
  if (!v && !optional) throw new Error(`Missing ${name}`);
  return v;
}

function hashNormalized(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

function loadEntries(filePath: string): Entry[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    entries?: Entry[];
  };
  const list = Array.isArray(raw) ? (raw as Entry[]) : raw.entries;
  if (!list?.length) throw new Error(`No entries in ${filePath}`);
  return list;
}

function loadFolders(filePath: string): Map<string, FolderMap> {
  if (!fs.existsSync(filePath)) return new Map();
  const rows = JSON.parse(fs.readFileSync(filePath, "utf8")) as FolderMap[];
  return new Map(rows.map((r) => [r.slug, r]));
}

function mediaPathFor(slug: string): string {
  return `/academy/${slug}.png`;
}

async function existingSlugs(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase.from("prompts").select("slug");
  if (error) throw error;
  return new Set((data ?? []).map((r: { slug: string }) => r.slug));
}

/** Resolve PNG file id inside a Drive subfolder (apply only). */
async function findCoverFileId(
  folderId: string,
  token: string,
): Promise<{ id: string; name: string } | null> {
  const q = encodeURIComponent(
    `'${folderId}' in parents and mimeType='image/png' and trashed=false`,
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=5`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Drive list failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as {
    files?: { id: string; name: string }[];
  };
  const files = json.files ?? [];
  return files[0] ?? null;
}

async function downloadCover(
  fileId: string,
  destPath: string,
  token: string,
): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Drive download failed (${res.status}) for ${fileId}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

async function insertPrompt(
  supabase: SupabaseClient,
  entry: Entry,
  mediaUrl: string,
): Promise<void> {
  const row = {
    title: entry.title,
    slug: entry.slug,
    category: entry.category,
    prompt_text: entry.promptText,
    media_url: mediaUrl,
    media_type: "image" as const,
    preview_html: entry.previewHtml,
    backdrop_color: entry.backdropColor,
    normalized_hash: hashNormalized(entry.promptText),
    is_premium: false,
    price: 0,
  };

  const { error } = await supabase.from("prompts").insert(row);
  if (error) throw new Error(`${entry.slug}: ${error.message}`);
}

async function main() {
  const apply = argFlag("--apply");
  const entriesPath =
    argValue("--entries") ??
    path.join(ROOT, ".tmp-academy-import", "entries.json");
  const foldersPath =
    argValue("--folders") ??
    path.join(ROOT, ".tmp-academy-import", "folders.json");

  if (!fs.existsSync(entriesPath)) {
    throw new Error(
      `Missing ${entriesPath}. Download entries.json from Drive root first.`,
    );
  }

  const entries = loadEntries(entriesPath);
  const folders = loadFolders(foldersPath);

  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    env("SUPABASE_SERVICE_ROLE_KEY", true) ||
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const known = await existingSlugs(supabase);
  const plan: PlanRow[] = [];

  for (const entry of entries) {
    const mediaUrl = mediaPathFor(entry.slug);
    const folder = folders.get(entry.slug);
    const coverSource = folder
      ? `drive:${folder.id} (order ${folder.order})`
      : entry._import?.cover
        ? `meta:${entry._import.cover}`
        : "unknown";

    if (known.has(entry.slug)) {
      plan.push({
        slug: entry.slug,
        title: entry.title,
        category: entry.category,
        action: "skip",
        mediaUrl,
        coverSource,
        reason: "slug already exists",
      });
      continue;
    }

    plan.push({
      slug: entry.slug,
      title: entry.title,
      category: entry.category,
      action: "create",
      mediaUrl,
      coverSource,
    });
  }

  const toCreate = plan.filter((p) => p.action === "create");
  const toSkip = plan.filter((p) => p.action === "skip");

  console.log("");
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Drive root: ${DRIVE_ROOT}`);
  console.log(`Entries: ${entries.length}`);
  console.log(`Would create: ${toCreate.length}`);
  console.log(`Would skip:   ${toSkip.length}`);
  console.log(`mediaType: image (supported — not video-only)`);
  console.log(`isPremium=false, price=0 for all creates`);
  console.log("");

  console.log("--- CREATE ---");
  for (const row of toCreate) {
    console.log(
      `+ ${row.slug}\n  title: ${row.title}\n  category: ${row.category}\n  mediaUrl: ${row.mediaUrl}\n  cover: ${row.coverSource}`,
    );
  }

  console.log("");
  console.log("--- SKIP ---");
  if (!toSkip.length) {
    console.log("(none)");
  } else {
    for (const row of toSkip) {
      console.log(`· ${row.slug} — ${row.reason}`);
    }
  }

  // Category gap note
  const cats = [...new Set(entries.map((e) => e.category))];
  console.log("");
  console.log("--- CATEGORIES ---");
  console.log(cats.join(" | "));

  if (!apply) {
    console.log("");
    console.log(
      "Dry-run only. Re-run with --apply to insert rows (covers must already be in public/academy/).",
    );
    return;
  }

  fs.mkdirSync(PUBLIC_ACADEMY, { recursive: true });
  const token = env("GOOGLE_DRIVE_ACCESS_TOKEN", true);

  let created = 0;
  for (const row of toCreate) {
    const entry = entries.find((e) => e.slug === row.slug)!;
    const dest = path.join(PUBLIC_ACADEMY, `${row.slug}.png`);

    if (!fs.existsSync(dest)) {
      if (!token) {
        throw new Error(
          `Missing cover ${dest}. Download via Drive MCP first, or set GOOGLE_DRIVE_ACCESS_TOKEN.`,
        );
      }
      const folder = folders.get(row.slug);
      if (!folder) {
        throw new Error(`No Drive folder mapped for slug ${row.slug}`);
      }
      const cover = await findCoverFileId(folder.id, token);
      if (!cover) {
        throw new Error(
          `No PNG cover in Drive folder ${folder.id} (${row.slug})`,
        );
      }
      console.log(`Downloading ${cover.name} → ${dest}`);
      await downloadCover(cover.id, dest, token);
    } else {
      console.log(`Cover OK: ${dest}`);
    }

    await insertPrompt(supabase, entry, row.mediaUrl);
    created += 1;
    console.log(`Inserted ${row.slug}`);
  }

  console.log("");
  console.log(`Done. Created ${created}, skipped ${toSkip.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
