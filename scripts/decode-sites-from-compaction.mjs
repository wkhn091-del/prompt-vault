import fs from "fs";
import path from "path";

const seg =
  "C:/Users/user/.cursor/projects/c-Users-user-OneDrive-Desktop-stydy-prompt-vault/agent-transcripts/9f2aad91-8a23-4089-9dfa-714fc9efe346/compaction/segment_003.md";
const outDir =
  "C:/Users/user/OneDrive/Desktop/stydy/prompt-vault/src/data/sites";
fs.mkdirSync(outDir, { recursive: true });

const text = fs.readFileSync(seg, "utf8");

const nameMap = {
  "agency-starter-kit.md": "agency.txt",
  "השיטה שלי": "method.txt",
  "תקיה בסיסית לאתר": "site-kit.txt",
  "איקומרס 3D / אימרסיבי Tier 2/3": "ecom-3d.txt",
  " איקומרס קלאסי Tier 1": "ecom-classic.txt",
  "איקומרס קלאסי Tier 1": "ecom-classic.txt",
  "סקריפט לאתר דימו": "demo.txt",
  "פורמט דף נחיתה 1": "landing.txt",
  "הפורמט שמאשר מכירה": "pre-sale.txt",
};

const re =
  /\{"name":"([^"]+)","mimeType":"text\/plain","format":"txt","base64":"([A-Za-z0-9+/=]+)"\}/g;

const seen = new Set();
let m;
while ((m = re.exec(text)) !== null) {
  const name = m[1];
  const b64 = m[2];
  const file = nameMap[name];
  if (!file || seen.has(file)) continue;
  seen.add(file);
  const body = Buffer.from(b64, "base64")
    .toString("utf8")
    .replace(/^\uFEFF/, "");
  fs.writeFileSync(path.join(outDir, file), body, "utf8");
  console.log("decoded", file, body.length);
}

console.log(
  "files:",
  fs.readdirSync(outDir).map((f) => {
    const size = fs.statSync(path.join(outDir, f)).size;
    return `${f}(${size})`;
  }),
);
