import fs from "fs";

const entries = JSON.parse(
  fs.readFileSync(".tmp-academy-import/entries.json", "utf8"),
).entries;
const bodiesPath = "src/data/sites-bodies.json";
const bodies = JSON.parse(fs.readFileSync(bodiesPath, "utf8"));

let n = 0;
for (const e of entries) {
  const text = (e.promptText || "").trim();
  if (text.length < 40) continue;
  bodies[e.slug] = text;
  n += 1;
}

fs.writeFileSync(bodiesPath, JSON.stringify(bodies, null, 2) + "\n");
console.log("injected", n, "format-38 bodies; total keys", Object.keys(bodies).length);
