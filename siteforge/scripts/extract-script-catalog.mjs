import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libPath = path.join(__dirname, "..", "..", "src", "lib", "sites-library.ts");
const outPath = path.join(__dirname, "..", "src", "lib", "script-catalog.json");
const text = fs.readFileSync(libPath, "utf8");

/** @type {Record<string, { title: string; summary: string; href: string; courseId?: string; courseTitle?: string }>} */
const catalog = {};

const courseBlocks = text.split(/\n  \{\n    id: "/).slice(1);
for (const block of courseBlocks) {
  const courseId = block.match(/^([^"]+)"/)?.[1];
  const courseTitle = block.match(/title: "([^"]+)"/)?.[1];
  const stepRe =
    /\{\s*\n\s*id: "([^"]+)"\s*,\s*\n\s*title: "([^"]*)"\s*,\s*\n\s*summary: "([^"]*)"\s*,\s*\n\s*href: "([^"]+)"/g;
  let m;
  while ((m = stepRe.exec(block))) {
    const [, id, title, summary, href] = m;
    catalog[id] = {
      title,
      summary,
      href,
      courseId,
      courseTitle,
    };
  }
}

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
console.log(`Wrote ${Object.keys(catalog).length} scripts → ${outPath}`);
console.log(
  "sample acd-laptop:",
  catalog["acd-laptop-dive-portfolio-hero"] ? "ok" : "MISSING",
);
