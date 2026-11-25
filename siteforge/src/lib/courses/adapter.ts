import type {
  CourseId,
  RawCourse,
  RawMedal,
  RawModule,
  RawStage,
} from "./types";
import { academyUnlockAll } from "./progress";

const PASTE_LINE =
  "📍 איפה מדביקים: בפאנל הסוכן של Cursor (Ctrl+I, מצב Agent) כשתיקיית הפרויקט פתוחה, או ב-Claude.";

/** Strip typographic makafim (— – ־) from visible copy. Number ranges → "עד". */
export function deDash(s: string): string {
  return s
    .replace(/(\d)\s*[—–‐‑−]\s*(\d)/g, "$1 עד $2")
    .replace(/\s*[—–־]\s*/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

export function shortLabel(title: string, max = 17): string {
  const t = deDash(title.replace(/^🏅\s*/, "")).trim();
  if (t.length <= max) return t;
  const words = t.split(/\s+/);
  const lines: string[] = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if ((cur + " " + w).trim().length > max && lines.length < 2) lines.push(w);
    else lines[lines.length - 1] = (cur + " " + w).trim();
  }
  if (lines[1] && lines[1].length > 19) lines[1] = lines[1].slice(0, 18) + "…";
  return lines.join(" ").slice(0, max + 20);
}

export function coreStages(course: RawCourse): RawStage[] {
  return course.stages.filter((s) => !s.bonus);
}

export function bonusStages(course: RawCourse): RawStage[] {
  return course.stages.filter((s) => s.bonus);
}

export function getStage(course: RawCourse, slugOrId: string): RawStage | null {
  return (
    course.stages.find((s) => s.slug === slugOrId || s.id === slugOrId) ?? null
  );
}

export function getModule(course: RawCourse, moduleId: string): RawModule | null {
  return course.modules.find((m) => m.id === moduleId) ?? null;
}

export function getMedal(course: RawCourse, medalId: string): RawMedal | null {
  return course.medals.find((m) => m.id === medalId) ?? null;
}

export function stageIndex(course: RawCourse, stageId: string): number {
  return coreStages(course).findIndex((s) => s.id === stageId);
}

export function isStageUnlocked(
  course: RawCourse,
  stageId: string,
  completed: string[],
  current: string,
): boolean {
  if (academyUnlockAll()) return true;
  const stage = getStage(course, stageId);
  if (!stage) return false;
  if (stage.bonus) {
    const after = stage.unlocks_after;
    return after ? completed.includes(after) || after === current : true;
  }
  const cores = coreStages(course);
  const idx = cores.findIndex((s) => s.id === stageId);
  if (idx <= 0) return true;
  const prev = cores[idx - 1];
  return completed.includes(prev.id) || stageId === current;
}

export function scriptsUnlocked(course: RawCourse, completed: string[]): boolean {
  if (academyUnlockAll()) return true;
  const gate = course.scripts_gate?.stage;
  if (!gate) return true;
  const idx = stageIndex(course, gate);
  if (idx < 0) return true;
  // scripts open after completing the gate stage (or being past it)
  return completed.includes(gate) || stageIndex(course, completed[completed.length - 1] ?? "") > idx;
}

export function canAccessScriptsOnStage(
  course: RawCourse,
  stage: RawStage,
  completed: string[],
): boolean {
  if (stage.bonus) return true;
  const gate = course.scripts_gate?.stage;
  if (!gate) return true;
  const gateIdx = stageIndex(course, gate);
  const stageIdx = stageIndex(course, stage.id);
  if (stageIdx < 0) return true;
  // stages before gate: no scripts (manual)
  if (stageIdx < gateIdx) return false;
  return scriptsUnlocked(course, completed) || stageIdx >= gateIdx;
}

export function nextCoreStage(
  course: RawCourse,
  stageId: string,
): RawStage | null {
  const cores = coreStages(course);
  const i = cores.findIndex((s) => s.id === stageId);
  if (i < 0 || i >= cores.length - 1) return null;
  return cores[i + 1];
}

export function allCoreDone(course: RawCourse, completed: string[]): boolean {
  return coreStages(course).every((s) => completed.includes(s.id));
}

export function moduleComplete(
  course: RawCourse,
  moduleId: string,
  completed: string[],
): boolean {
  const mod = getModule(course, moduleId);
  if (!mod) return false;
  return mod.stages.every((id) => {
    const st = getStage(course, id);
    if (!st || st.bonus) return true;
    return completed.includes(id);
  });
}

export function pasteHint(): string {
  return PASTE_LINE;
}

export function courseHref(courseId: CourseId) {
  return `/academy/${courseId}`;
}

export function stageHref(courseId: CourseId, slug: string) {
  return `/academy/${courseId}/${slug}`;
}

export function examHref(courseId: CourseId) {
  return `/academy/${courseId}/exam`;
}

export function certificateHref(courseId: CourseId) {
  return `/academy/${courseId}/certificate`;
}

/** Build MAP payload for CourseMap (matches map-sites.html / map-agents.html). */
export function buildMapPayload(
  course: RawCourse,
  currentStageId: string,
) {
  const cores = coreStages(course);
  const bonuses = bonusStages(course);
  const scriptCount = course.stages.reduce(
    (n, s) => n + (s.scripts?.length ?? 0),
    0,
  );

  const gateOn: Record<string, string> = {};
  if (course.scripts_gate?.stage) {
    gateOn[course.scripts_gate.stage] = "שער הסקריפטים";
  }
  if (course.id === "sites") {
    gateOn["st-43"] = 'השער: כשיר למכור';
  }
  if (course.final_gate?.stage) {
    gateOn[course.final_gate.stage] = "השער: הבוט עובד";
  }

  const bonusByAfter: Record<string, { id: string; label: string }[]> = {};
  for (const b of bonuses) {
    const after = b.unlocks_after ?? "";
    if (!after) continue;
    const bid = String(b.n).startsWith("B") ? String(b.n) : `B${b.n}`;
    (bonusByAfter[after] ??= []).push({
      id: bid,
      label: shortLabel(b.title, 14),
    });
  }

  const modules = course.modules
    .filter((m) => m.id !== "B")
    .map((m) => {
      const medal = getMedal(course, m.medal) ?? {
        name: m.medal,
        icon: "star",
        tier: 0,
      };
      return {
        id: m.id,
        title: deDash(m.title),
        week: m.week ? deDash(m.week) : m.week,
        medal: {
          name: deDash(medal.name),
          icon: medal.icon || "star",
          tier: medal.tier ?? 0,
        },
        stages: m.stages
          .map((id) => getStage(course, id))
          .filter((s): s is RawStage => Boolean(s) && !s!.bonus)
          .map((s) => ({
            id: s.id,
            n: s.n,
            label: shortLabel(s.title),
            gate: gateOn[s.id],
            bonus: bonusByAfter[s.id] ?? [],
          })),
      };
    });

  const isSites = course.id === "sites";
  return {
    kicker: isSites
      ? "SITEFORGE · COURSE 1 · ROADMAP"
      : "SITEFORGE · COURSE 2 · ROADMAP",
    title: "מפת הדרך",
    titleEm: isSites ? "קורס אתרים" : "קורס סוכנים",
    sub: isSites
      ? "מאפס ועד שתי סגירות בחודש: דף נחיתה, באוויר, בגוגל, ושיחות שסוגרות."
      : "ממושגים ראשונים ועד בוט הצעת מחיר מלא, לימוד עצמי, שלב אחרי שלב.",
    foot: isSites
      ? "STAGES 1 to 50 · GATE AFTER STAGE 3 · LIVE"
      : "STAGES 1 to 28 · FINAL GATE: AI BOT JUDGE · LIVE",
    current: currentStageId,
    stats: [
      [modules.length, "מודולים"],
      [cores.length, "שלבים"],
      [bonuses.length, "בונוס"],
      [course.medals.length, "מדליות"],
      [1, "מבחן סיום + תעודה"],
      [scriptCount, "סקריפטים להעתקה"],
    ] as [number, string][],
    modules,
    bonusList: bonuses.map((b) => ({
      id: String(b.n).startsWith("B") ? String(b.n) : `B${b.n}`,
      stageId: b.id,
      title: deDash(b.title),
      after: String(
        cores.find((c) => c.id === b.unlocks_after)?.n ?? b.unlocks_after ?? "?",
      ),
      unlocksAfterId: b.unlocks_after ?? "",
    })),
    final: {
      questions: course.final_exam.questions,
      pass: course.final_exam.pass_percent,
    },
  };
}
