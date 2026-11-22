/**
 * Build Academy courses + copy bodies from Drive packs:
 * - Prompt Vault 79 (series → courses)
 * - Academy מאגר (category → courses)
 * Never writes to Vault/Sites prompts table.
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TMP = path.join(ROOT, ".tmp-academy-import");
const bodiesPath = path.join(ROOT, "src", "data", "sites-bodies.json");

const entries79 = JSON.parse(
  fs.readFileSync(path.join(TMP, "entries-79.json"), "utf8"),
).entries;
const academy = JSON.parse(
  fs.readFileSync(path.join(TMP, "academy-import.json"), "utf8"),
);

const bodies = JSON.parse(fs.readFileSync(bodiesPath, "utf8"));

const SERIES_META = [
  {
    series: "פורמטים",
    id: "method-formats",
    number: "20",
    title: "מהשיטה · פורמטים",
    blurb: "פרומפטים לבניית אתר — העתקה מסבירה מה עושים ולמה.",
  },
  {
    series: "אנימציה",
    id: "method-motion",
    number: "21",
    title: "מהשיטה · אנימציה",
    blurb: "תנועה, חשיפות וגלילה — סקריפטים מוכנים להדבקה.",
  },
  {
    series: "UI",
    id: "method-ui",
    number: "22",
    title: "מהשיטה · UI",
    blurb: "מנוע UI, הירו ואלמנטים — שלב־שלב עם העתקה.",
  },
  {
    series: "UX",
    id: "method-ux",
    number: "23",
    title: "מהשיטה · UX",
    blurb: "זרימה, המרות וחוויית משתמש — סקריפטים מלאים.",
  },
  {
    series: "דימו",
    id: "method-demo",
    number: "24",
    title: "מהשיטה · אתר דימו",
    blurb: "אתר הדגמה להמרות — מהבסיס עד הגנה על זכויות.",
  },
  {
    series: "נחיתה",
    id: "method-landing",
    number: "25",
    title: "מהשיטה · דף נחיתה",
    blurb: "פורמט נחיתה, פסיכולוגיית המרות ו־Go-Live.",
  },
  {
    series: "איקומרס 3D",
    id: "method-ecom-3d",
    number: "26",
    title: "מהשיטה · איקומרס 3D",
    blurb: "חנות אימרסיבית Tier 2/3 — WebGL, אבטחה והשקה.",
  },
  {
    series: "איקומרס Tier1",
    id: "method-ecom-t1",
    number: "27",
    title: "מהשיטה · איקומרס קלאסי",
    blurb: "חנות Tier 1 — חיפוש, עגלה, מבצר והשקה.",
  },
  {
    series: "סינון",
    id: "method-filter",
    number: "28",
    title: "מהשיטה · סינון ואיכות",
    blurb: "בדיקות לקוח, אבטחה וכשירות לפני מסירה.",
  },
];

const CAT_META = [
  {
    category: "Claude Code & סוכנים",
    id: "pack-claude-agents",
    number: "30",
    title: "מאגר · Claude Code וסוכנים",
    blurb: "סקריפטים מוכנים לסוכנים, סקילים וזרימות Claude.",
  },
  {
    category: "כסף ומיסים",
    id: "pack-money",
    number: "31",
    title: "מאגר · כסף ומיסים",
    blurb: "משכנתאות, מיסים ותכנון כספי — פרומפטים להעתקה.",
  },
  {
    category: "שיווק ותוכן",
    id: "pack-marketing",
    number: "32",
    title: "מאגר · שיווק ותוכן",
    blurb: "שיחות מכירה, תוכן וקמפיינים — עם הסבר מלא.",
  },
  {
    category: "עיצוב ואתרים",
    id: "pack-design",
    number: "33",
    title: "מאגר · עיצוב ואתרים",
    blurb: "עיצוב, בנייה ושיפור אתרים.",
  },
  {
    category: "כלים",
    id: "pack-tools",
    number: "34",
    title: "מאגר · כלים",
    blurb: "כלי עבודה יומיומיים לסוכנים ולצוות.",
  },
  {
    category: "אבטחה",
    id: "pack-security",
    number: "35",
    title: "מאגר · אבטחה",
    blurb: "בדיקות אבטחה והגנות לפני עלייה לאוויר.",
  },
  {
    category: "אוטומציה",
    id: "pack-automation",
    number: "36",
    title: "מאגר · אוטומציה",
    blurb: "זרימות אוטומטיות שמחברות כלים ותהליכים.",
  },
  {
    category: "SEO",
    id: "pack-seo",
    number: "37",
    title: "מאגר · SEO",
    blurb: "קידום אורגני עם Claude — תבניות מוכנות.",
  },
  {
    category: "וידאו",
    id: "pack-video",
    number: "38",
    title: "מאגר · וידאו",
    blurb: "סקריפטי וידאו ופרימיום ליצירה.",
  },
];

function esc(s) {
  return JSON.stringify(s ?? "");
}

function summaryFrom(entry) {
  const excerpt = entry._import?.descriptionExcerpt;
  if (excerpt && String(excerpt).trim()) return String(excerpt).trim().slice(0, 160);
  const text = (entry.promptText || "").replace(/\s+/g, " ").trim();
  if (text.length > 20) return text.slice(0, 140) + (text.length > 140 ? "…" : "");
  return entry.category || entry._import?.series || "סקריפט להעתקה";
}

function hrefFrom79(e) {
  return (
    e._import?.organizedStepDocUrl ||
    e._import?.sourceTabUrl ||
    e._import?.sourceDocUrl ||
    e._import?.organizedFolderUrl ||
    "https://drive.google.com/drive/folders/1QeSPwREP08DfDOzCIyYC3WlMljR5D3XR"
  );
}

function hrefFromAcademy(e) {
  // Prefer Drive folder of the pack root; scripts live as md in source folders
  const src = e._import?.source;
  const map = {
    מהשיחות: "https://drive.google.com/drive/folders/1AMzgZOjIids3euKa2zOvRCHy9-vcr4IO",
    Dev10x: "https://drive.google.com/drive/folders/1Usa3EPViDlO5oZ5ho8uCMSH9x8nBPgz-",
    "Niv Zarfati":
      "https://drive.google.com/drive/folders/1pVGtk9oV_XJbnNVA18Q5dQjTFCyOHnSM",
    "AY Digital (עמיר יעקובי)":
      "https://drive.google.com/drive/folders/1ySPZ0AQMnrC4_0oiWDFBHv05IteiYXNP",
    "Elad Amrani (אלעד עמרני)":
      "https://drive.google.com/drive/folders/1t9M0mB6zYrO9QRgd89mmKmxWtAsHDRaJ",
  };
  return map[src] || "https://drive.google.com/drive/folders/1xQn4dRyrUL7WOiDfCtEauwsuwzadn22u";
}

const courses = [];
let bodyCount = 0;
let skippedNoPrompt = 0;

for (const meta of SERIES_META) {
  const items = entries79.filter((e) => e._import?.series === meta.series);
  const steps = [];
  for (const e of items) {
    const prompt = (e.promptText || "").trim();
    if (prompt.length < 40) {
      skippedNoPrompt += 1;
      continue;
    }
    const id = `m79-${e.slug}`;
    bodies[id] = prompt;
    bodyCount += 1;
    steps.push(`      {
        id: ${esc(id)},
        title: ${esc(e.title)},
        summary: ${esc(summaryFrom(e))},
        href: ${esc(hrefFrom79(e))},
        kind: "doc",
      }`);
  }
  if (!steps.length) continue;
  courses.push(`  {
    id: ${esc(meta.id)},
    number: ${esc(meta.number)},
    title: ${esc(meta.title)},
    blurb: ${esc(meta.blurb)},
    folderHref: ${esc("https://drive.google.com/drive/folders/1QeSPwREP08DfDOzCIyYC3WlMljR5D3XR")},
    steps: [
${steps.join(",\n")}
    ],
  }`);
}

for (const meta of CAT_META) {
  const items = academy.entries.filter((e) => e.category === meta.category);
  const steps = [];
  for (const e of items) {
    const prompt = (e.promptText || "").trim();
    if (prompt.length < 40) {
      skippedNoPrompt += 1;
      continue;
    }
    const id = `acd-${e.slug}`;
    bodies[id] = prompt;
    bodyCount += 1;
    const tagline =
      e._import?.source && e._import.source !== "מהשיחות"
        ? `${e._import.source} · ${summaryFrom(e)}`
        : summaryFrom(e);
    steps.push(`      {
        id: ${esc(id)},
        title: ${esc(e.title)},
        summary: ${esc(tagline.slice(0, 180))},
        href: ${esc(hrefFromAcademy(e))},
        kind: "doc",
      }`);
  }
  if (!steps.length) continue;
  courses.push(`  {
    id: ${esc(meta.id)},
    number: ${esc(meta.number)},
    title: ${esc(meta.title)},
    blurb: ${esc(meta.blurb)},
    folderHref: ${esc("https://drive.google.com/drive/folders/1xQn4dRyrUL7WOiDfCtEauwsuwzadn22u")},
    steps: [
${steps.join(",\n")}
    ],
  }`);
}

const snippet = courses.join(",\n") + ",";
fs.writeFileSync(path.join(TMP, "packs-courses-snippet.ts"), snippet);
fs.writeFileSync(bodiesPath, JSON.stringify(bodies, null, 2) + "\n");

console.log({
  courses: courses.length,
  bodiesAdded: bodyCount,
  skippedNoPrompt,
  totalBodies: Object.keys(bodies).length,
});
