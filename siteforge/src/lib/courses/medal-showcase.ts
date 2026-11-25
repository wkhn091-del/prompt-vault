import { deDash } from "./adapter";
import type { CourseId, RawCourse, RawMedal, RawModule, RawStage } from "./types";

export type MedalShowcaseData = {
  courseId: CourseId;
  courseTitle: string;
  medal: {
    id: string;
    name: string;
    emoji: string;
    tier: number;
    earnedAt: string;
    icon: string;
  };
  module: {
    id: string;
    title: string;
    lead: string;
    week: string;
    reward: string;
  };
  /** What you know — stage titles from the module */
  skills: { id: string; n: string; title: string; outcome?: string }[];
  glbUrl: string | null;
};

/** Pull "מה יוצא" cells from the module intro markdown table when present. */
function outcomesFromIntro(intro: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of intro.split("\n")) {
    const m = line.match(
      /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/,
    );
    if (!m) continue;
    const a = m[1]!.trim();
    const b = m[2]!.trim();
    const c = m[3]!.trim();
    if (a === "שלב" || a.startsWith("---") || !/^\d/.test(a)) continue;
    out[a.replace(/[^\d].*$/, "") || a] = deDash(c.replace(/`/g, ""));
    void b;
  }
  return out;
}

export function buildMedalShowcase(
  course: RawCourse,
  medal: RawMedal,
  glbUrl: string | null = null,
): MedalShowcaseData | null {
  const mod: RawModule | undefined = course.modules.find(
    (m) => m.id === medal.module,
  );
  if (!mod) return null;

  const outcomes = outcomesFromIntro(mod.intro_md || "");
  const stages: RawStage[] = mod.stages
    .map((id) => course.stages.find((s) => s.id === id))
    .filter((s): s is RawStage => Boolean(s) && !s!.bonus);

  return {
    courseId: course.id,
    courseTitle: deDash(course.title),
    medal: {
      id: medal.id,
      name: deDash(medal.name),
      emoji: medal.emoji,
      tier: medal.tier,
      earnedAt: deDash(medal.earned_at),
      icon: medal.icon,
    },
    module: {
      id: mod.id,
      title: deDash(mod.title),
      lead: deDash(mod.lead || ""),
      week: deDash(mod.week || ""),
      reward: deDash(mod.reward || ""),
    },
    skills: stages.map((s) => {
      const key = String(s.n);
      return {
        id: s.id,
        n: key,
        title: deDash(s.title),
        outcome: outcomes[key] || outcomes[String(s.n)] || undefined,
      };
    }),
    glbUrl,
  };
}
