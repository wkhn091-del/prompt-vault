import type { CourseId, RawCourse, RawStage } from "./types";
import { buildMapPayload, coreStages, bonusStages } from "./adapter";

/** Lightweight stage payload for lesson pages (no other stages' bodies). */
export type StageLessonPayload = {
  id: string;
  slug: string;
  n: number | string;
  title: string;
  module: string;
  moduleTitle: string;
  bonus: boolean;
  unlocks_after?: string;
  goal?: string;
  body_md: string;
  scripts: { id: string; text: string; note?: string }[];
  prevSlug: string | null;
  nextSlug: string | null;
};

export function stageLessonPayload(
  course: RawCourse,
  stage: RawStage,
): StageLessonPayload {
  const cores = coreStages(course);
  const all = course.stages;
  const idx = all.findIndex((s) => s.id === stage.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const mod = course.modules.find((m) => m.id === stage.module);
  // for core navigation prefer core neighbors
  const cIdx = cores.findIndex((s) => s.id === stage.id);
  const prevCore = cIdx > 0 ? cores[cIdx - 1] : null;
  const nextCore = cIdx >= 0 && cIdx < cores.length - 1 ? cores[cIdx + 1] : null;

  return {
    id: stage.id,
    slug: stage.slug,
    n: stage.n,
    title: stage.title,
    module: stage.module,
    moduleTitle: mod?.title ?? stage.module,
    bonus: stage.bonus,
    unlocks_after: stage.unlocks_after,
    goal: stage.goal,
    body_md: stage.body_md,
    scripts: stage.scripts.map((s) => ({
      id: s.id,
      text: s.text,
      note: s.note,
    })),
    prevSlug: stage.bonus
      ? (prev?.slug ?? null)
      : (prevCore?.slug ?? null),
    nextSlug: stage.bonus
      ? (next?.slug ?? null)
      : (nextCore?.slug ?? null),
  };
}

export function courseMapServerData(course: RawCourse, current: string) {
  const map = buildMapPayload(course, current);
  const slugById: Record<string, string> = {};
  for (const s of course.stages) slugById[s.id] = s.slug;
  return {
    courseId: course.id as CourseId,
    title: course.title,
    source: course.source,
    map,
    slugById,
    coreIds: coreStages(course).map((s) => s.id),
    bonusCount: bonusStages(course).length,
    medals: course.medals.map((m) => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      module: m.module,
      icon: m.icon,
      tier: m.tier,
    })),
    modules: course.modules
      .filter((m) => m.id !== "B")
      .map((m) => ({
        id: m.id,
        title: m.title,
        week: m.week,
        stageIds: m.stages,
      })),
  };
}
