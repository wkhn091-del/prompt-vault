import type { Metadata } from "next";
import { NocheVivaHero } from "../components/home/NocheVivaHero";
import { NvHomeMount } from "../components/home/NvHomeMount";
import { listCourseIds, loadCourse } from "../lib/courses/load";
import { coreStages } from "../lib/courses/adapter";
import "../components/home/noche-viva.css";

export const metadata: Metadata = {
  title: "SiteForge Havana after dark",
  description:
    "A colonial street that splits open, slides out building by building and falls into neon night. SiteForge Academy sites & agents.",
};

const EN: Record<string, { en: string; he: string; blurb: string }> = {
  sites: {
    en: "SITES",
    he: "קורס 1: אתרים (דפי נחיתה)",
    blurb:
      "מדפי נחיתה ועד לקוח ראשון: מפה, סקריפטים, חידונים ומבחן סיום. הכל באתר.",
  },
  agents: {
    en: "AGENTS",
    he: "קורס בוטים וסוכני AI (לימוד בלבד)",
    blurb:
      "בוטים וסוכני AI בעברית: שלבים, תרגול והעתקה מהאתר בלי Drive.",
  },
};

export default function HomePage() {
  const courses = listCourseIds().map((id) => {
    const c = loadCourse(id);
    const meta = EN[id] ?? {
      en: id.toUpperCase(),
      he: c.title,
      blurb: c.title,
    };
    return {
      id,
      en: meta.en,
      he: meta.he,
      blurb: meta.blurb,
      stats: `${c.modules.filter((m) => m.id !== "B").length} modules · ${coreStages(c).length} stages · ${c.stages.reduce((n, s) => n + (s.scripts?.length ?? 0), 0)} scripts`,
    };
  });

  return (
    <>
      <NvHomeMount />
      <NocheVivaHero courses={courses} />
    </>
  );
}
