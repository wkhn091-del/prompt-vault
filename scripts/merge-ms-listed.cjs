const fs = require("fs");
const cats = ["Dark","Light","Abstract","Nature","Space","Illustrated","Surreal","People","Characters","Objects","City"];
const existing = JSON.parse(fs.readFileSync("src/data/backgrounds.json","utf8"));
const byId = new Map(existing.map(x => [x.id, x]));

// Ensure all existing free stay free; we'll add premium from files if present
for (const f of fs.readdirSync("scripts/data").filter(x => x.startsWith("ms-list-") && x.endsWith(".json"))) {
  const rows = JSON.parse(fs.readFileSync("scripts/data/" + f, "utf8"));
  let i = byId.size;
  for (const row of rows) {
    if (!row?.id || !row?.thumbnail_url) continue;
    const prev = byId.get(row.id);
    const premium = row.access === "premium" || Boolean(prev?.premium);
    const keepClean = prev?.videoUrl && String(prev.videoUrl).includes("cloudfront");
    byId.set(row.id, {
      id: row.id,
      title: row.title || prev?.title || row.id.slice(0,8),
      videoUrl: keepClean ? prev.videoUrl : row.thumbnail_url,
      previewUrl: row.thumbnail_url || prev?.previewUrl,
      category: prev?.category ?? cats[i % cats.length],
      featured: prev?.featured ?? (!premium && i < 12),
      popular: prev?.popular ?? i % 4 === 0,
      premium,
      likes: prev?.likes ?? (i * 11) % 55,
    });
    i++;
  }
}
const out = [...byId.values()];
fs.writeFileSync("src/data/backgrounds.json", JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify({ total: out.length, free: out.filter(x=>!x.premium).length, paid: out.filter(x=>x.premium).length }));
