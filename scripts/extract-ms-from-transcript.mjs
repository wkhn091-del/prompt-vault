import fs from "fs";
import path from "path";

const roots = [
  path.resolve(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-user-OneDrive-Desktop-stydy-prompt-vault/agent-transcripts",
  ),
];

const freeById = new Map();
const premiumById = new Map();

function slim(row) {
  return {
    id: row.id,
    title: row.title,
    access: row.access,
    thumbnail_url: row.thumbnail_url,
  };
}

function ingest(payload) {
  if (!payload || typeof payload !== "object") return;
  const results = payload.results;
  if (!Array.isArray(results)) return;
  for (const row of results) {
    if (!row?.id || !row?.thumbnail_url) continue;
    const item = slim(row);
    if (item.access === "premium") premiumById.set(item.id, item);
    else if (item.access === "free") freeById.set(item.id, item);
  }
}

function tryParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const x of node) walk(x);
    return;
  }
  if (Array.isArray(node.results) && node.results[0]?.thumbnail_url) {
    ingest(node);
  }
  for (const v of Object.values(node)) {
    if (typeof v === "string" && v.includes("thumbnail_url")) {
      let parsed = tryParse(v);
      if (parsed) ingest(parsed);
      // unescape common JSON-in-string forms
      const unescaped = v
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      parsed = tryParse(unescaped);
      if (parsed) ingest(parsed);
      const idx = v.indexOf('"results"');
      if (idx > 0) {
        const start = v.lastIndexOf("{", idx);
        if (start >= 0) {
          // brace match
          let depth = 0;
          for (let i = start; i < v.length; i++) {
            if (v[i] === "{") depth++;
            else if (v[i] === "}") {
              depth--;
              if (depth === 0) {
                parsed = tryParse(v.slice(start, i + 1));
                if (parsed) ingest(parsed);
                break;
              }
            }
          }
        }
      }
    } else if (v && typeof v === "object") {
      walk(v);
    }
  }
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkFiles(p);
      continue;
    }
    if (!/\.(jsonl|md|json|txt)$/i.test(ent.name)) continue;
    let text;
    try {
      text = fs.readFileSync(p, "utf8");
    } catch {
      continue;
    }
    if (!text.includes("thumbnail_url")) continue;
    // JSONL
    if (p.endsWith(".jsonl")) {
      for (const line of text.split("\n")) {
        if (!line.includes("thumbnail_url")) continue;
        const rec = tryParse(line);
        if (rec) walk(rec);
        else walk({ raw: line });
      }
    } else {
      walk({ raw: text });
      // also scan for embedded JSON objects with results arrays
      const re =
        /\{\s*"count"\s*:\s*\d+\s*,\s*"results"\s*:\s*\[[\s\S]*?\]\s*\}/g;
      let m;
      while ((m = re.exec(text))) {
        const parsed = tryParse(m[0]);
        if (parsed) ingest(parsed);
      }
    }
  }
}

for (const r of roots) walkFiles(r);

const outDir = path.resolve("scripts/data");
fs.mkdirSync(outDir, { recursive: true });
const free = [...freeById.values()];
const premium = [...premiumById.values()];
fs.writeFileSync(
  path.join(outDir, "ms-list-free.json"),
  `${JSON.stringify(free, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outDir, "ms-list-premium.json"),
  `${JSON.stringify(premium, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    free: free.length,
    premium: premium.length,
    totalListed: free.length + premium.length,
  }),
);
