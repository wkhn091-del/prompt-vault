import fs from "fs";

const pages = [
  // offset 100+ — titles that build standard Motionsites preview URLs
  ...JSON.parse(fs.readFileSync("scripts/data/_ms-pages/extra.json", "utf8")),
];

const listPath = "scripts/data/ms-list-premium.json";
const byId = new Map(
  JSON.parse(fs.readFileSync(listPath, "utf8")).map((x) => [x.id, x]),
);

function thumb(title, pathKind = "preview") {
  const enc = encodeURIComponent(title);
  if (pathKind === "a") {
    return `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/${enc}.mp4`;
  }
  return `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/avideo%20preview/${enc}.mp4`;
}

for (const row of pages) {
  if (!row.id || !row.title) continue;
  const thumbnail_url =
    row.thumbnail_url || thumb(row.title, row.pathKind || "preview");
  byId.set(row.id, {
    id: row.id,
    title: row.title,
    access: "premium",
    thumbnail_url,
  });
}

const out = [...byId.values()];
fs.writeFileSync(listPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify({ premium: out.length }));
