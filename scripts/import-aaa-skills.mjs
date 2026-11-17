import fs from "fs";
import path from "path";

const index = JSON.parse(
  fs.readFileSync(".tmp-aaas-skills/skills.json", "utf8"),
);
const bodiesPath = "src/data/tools-bodies.json";
const bodies = JSON.parse(fs.readFileSync(bodiesPath, "utf8"));

// Drop previous AAA imports if re-running
for (const key of Object.keys(bodies)) {
  if (key.startsWith("aaa-")) delete bodies[key];
}

const catMeta = {
  "ui-ux": {
    id: "aaa-ui-ux",
    number: "09",
    title: "AAA · עיצוב UX/UI",
    blurb:
      "סקילים מאושרים מ־aaas.solutions — ממשקים, אנימציה, RTL ונגישות.",
  },
  graphic: {
    id: "aaa-graphic",
    number: "10",
    title: "AAA · עיצוב גרפי ומיתוג",
    blurb: "מיתוג, באנרים, פוסטרים וערכות עיצוב מהספרייה של AAA.",
  },
  "app-dev": {
    id: "aaa-app-dev",
    number: "11",
    title: "AAA · פיתוח ו־Vibe Coding",
    blurb: "Supabase, shadcn, בדיקות, דיבאג ובוטים — סקילים מאושרים.",
  },
  video: {
    id: "aaa-video",
    number: "12",
    title: "AAA · וידאו ומושן",
    blurb: "Remotion, HyperFrames, מצגות ועריכת וידאו בעברית.",
  },
  productivity: {
    id: "aaa-productivity",
    number: "13",
    title: "AAA · פרודוקטיביות וחיסכון",
    blurb: "תוכניות עבודה, כיווץ טוקנים, מסירה בין שיחות ואימות.",
  },
  marketing: {
    id: "aaa-marketing",
    number: "14",
    title: "AAA · שיווק וצמיחה",
    blurb: "SEO, CRO, קופי, השקה, מיילים ותוכן לרשתות.",
  },
};

const categories = [];

for (const c of index.categories) {
  const meta = catMeta[c.id];
  if (!meta) continue;
  const skills = index.skills.filter((s) => s.category === c.id);
  const tools = skills.map((s) => {
    const toolId = `aaa-${s.name}`;
    const skillMd = path.join(
      ".tmp-aaas-skills/skills",
      s.name,
      "SKILL.md",
    );
    let body = "";
    if (fs.existsSync(skillMd)) {
      body = fs.readFileSync(skillMd, "utf8");
    }
    const header = [
      "> מקור: aaas.solutions / Adidinahon/skills",
      `> התקנה: ${s.install_command}`,
      `> GitHub: ${s.github_url}`,
      s.author
        ? `> מחבר: ${s.author}${s.license ? ` · ${s.license}` : ""}`
        : null,
      "",
    ]
      .filter((line) => line !== null)
      .join("\n");
    bodies[toolId] = `${header}\n${body.trim()}`;
    return {
      id: toolId,
      title: s.title_he || s.name,
      summary: s.description_he || s.description || "",
      href: `https://aaas.solutions/skills/${s.name}`,
    };
  });
  categories.push({ ...meta, tools });
}

fs.writeFileSync(bodiesPath, `${JSON.stringify(bodies, null, 2)}\n`, "utf8");
fs.writeFileSync(
  "src/data/aaa-skills-categories.json",
  `${JSON.stringify(categories, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify({
    categories: categories.length,
    tools: categories.reduce((n, c) => n + c.tools.length, 0),
    bodyKeys: Object.keys(bodies).length,
    bodiesBytes: fs.statSync(bodiesPath).size,
  }),
);
