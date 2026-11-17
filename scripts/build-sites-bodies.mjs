import fs from "fs";
import path from "path";

const root = path.resolve("src/data/sites");
const outJson = path.resolve("src/data/sites-bodies.json");

const map = {
  ui: "ui.txt",
  ux: "ux.txt",
  animations: "animations.txt",
  formats: "formats.txt",
  agency: "agency.txt",
  method: "method.txt",
  "site-kit": "site-kit.txt",
  "ecom-3d": "ecom-3d.txt",
  "ecom-classic": "ecom-classic.txt",
  demo: "demo.txt",
  landing: "landing.txt",
  "pre-sale": "pre-sale.txt",
};

const bodies = {};
for (const [id, file] of Object.entries(map)) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.warn("missing", file);
    continue;
  }
  bodies[id] = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "").trim();
  console.log(id, bodies[id].length);
}
fs.writeFileSync(outJson, JSON.stringify(bodies));
console.log("wrote", outJson, "keys", Object.keys(bodies).length);
