import fs from "fs";
import path from "path";

const cats = [
  "Dark",
  "Light",
  "Abstract",
  "Nature",
  "Space",
  "Illustrated",
  "Surreal",
  "People",
  "Characters",
  "Objects",
  "City",
];

const root = path.resolve("scripts/data");
const listed = fs
  .readdirSync(root)
  .filter((f) => f.startsWith("ms-list-") && f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8")));

const existing = JSON.parse(
  fs.readFileSync("src/data/backgrounds.json", "utf8"),
);
const byId = new Map(existing.map((x) => [x.id, x]));

let i = 0;
for (const row of listed) {
  if (!row?.id || !row?.thumbnail_url) continue;
  const prev = byId.get(row.id);
  const premium = row.access === "premium" || Boolean(prev?.premium);
  const keepClean =
    prev?.videoUrl &&
    (String(prev.videoUrl).includes("cloudfront") ||
      (!premium && prev.videoUrl !== row.thumbnail_url));

  byId.set(row.id, {
    id: row.id,
    title: row.title || prev?.title || row.id.slice(0, 8),
    videoUrl: keepClean ? prev.videoUrl : row.thumbnail_url,
    previewUrl: row.thumbnail_url || prev?.previewUrl,
    category: prev?.category ?? cats[i % cats.length],
    featured: prev?.featured ?? (!premium && i < 12),
    popular: prev?.popular ?? i % 4 === 0,
    premium,
    likes: prev?.likes ?? (i * 11) % 55,
  });
  i += 1;
}

const out = [...byId.values()];
fs.writeFileSync(
  "src/data/backgrounds.json",
  `${JSON.stringify(out, null, 2)}\n`,
);
const free = out.filter((x) => !x.premium).length;
const paid = out.filter((x) => x.premium).length;
console.log(JSON.stringify({ total: out.length, free, paid }));
