import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coursesDir = path.join(__dirname, "..", "content", "courses");

function parseQuiz(body) {
  const idx = body.indexOf("### ◎ חידון");
  if (idx < 0) {
    const idx2 = body.indexOf("### ◎");
    if (idx2 < 0 || !body.slice(idx2).includes("QUIZ")) return null;
  }
  const start = body.search(/### ◎\s*חידון/);
  if (start < 0) return null;
  let block = body.slice(start);
  const end = block.search(/\n---\s*$/);
  if (end > 0) block = block.slice(0, end);

  const qs = [];
  const re = /\*\*Q(\d+)\s*·\s*([^*]+)\*\*/g;
  const headers = [...block.matchAll(re)];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const next = headers[i + 1];
    const chunk = block.slice(h.index, next ? next.index : block.length);
    const prompt = h[2].trim().replace(/\?$/, "?");
    const choices = [...chunk.matchAll(/[-*]\s*◯\s*([אבגד])\.\s*(.+)/g)].map(
      (m) => ({ letter: m[1], text: m[2].trim() }),
    );
    if (choices.length >= 2) qs.push({ id: `q${h[1]}`, prompt, choices });
  }
  return qs.length ? qs : null;
}

for (const course of ["sites", "agents"]) {
  const raw = JSON.parse(
    fs.readFileSync(path.join(coursesDir, `${course}.json`), "utf8"),
  );
  const out = {};
  for (const s of raw.stages) {
    const q = parseQuiz(s.body_md || "");
    if (q) out[s.id] = q;
  }
  const dest = path.join(coursesDir, `${course}-quizzes.json`);
  fs.writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
  console.log(course, Object.keys(out).length, "->", dest);
}
