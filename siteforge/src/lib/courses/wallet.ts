"use client";

import type { CourseId, CourseProgress, RawCourse } from "./types";
import { loadCourseProgress, saveCourseProgress } from "./progress";

export const COINS_PER_STAGE = 15;
export const COINS_MEDAL_BONUS = 50;
export const WALLET_EVENT = "siteforge-wallet";

export function notifyWallet() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WALLET_EVENT));
}

export function courseCoins(courseId: CourseId): number {
  return loadCourseProgress(courseId).coins ?? 0;
}

export function totalCoins(courseIds: CourseId[]): number {
  return courseIds.reduce((n, id) => n + courseCoins(id), 0);
}

export function isMedalEarned(
  progress: CourseProgress,
  course: RawCourse,
  medalId: string,
): boolean {
  if (progress.medals?.includes(medalId)) return true;
  const mod = course.modules.find((m) => m.medal === medalId);
  if (!mod) return false;
  return mod.stages.every((id) => progress.completed.includes(id));
}

/**
 * Call AFTER the stage is marked completed in progress.
 * Awards stage coins once + medal bonus when a module medal unlocks.
 */
export function awardStageCompletion(
  courseId: CourseId,
  stageId: string,
  course: {
    modules: Array<{ id: string; medal: string; stages: string[] }>;
  },
): { coinsGained: number; newMedals: string[] } {
  const p = loadCourseProgress(courseId);
  const paid = p.coinStages ?? [];
  let coinsGained = 0;
  const newMedals: string[] = [];
  const medals = new Set(p.medals ?? []);

  if (!paid.includes(stageId)) {
    coinsGained += COINS_PER_STAGE;
    p.coinStages = [...paid, stageId];
  }

  for (const mod of course.modules) {
    if (mod.id === "B" || !mod.medal) continue;
    if (medals.has(mod.medal)) continue;
    if (!mod.stages.includes(stageId)) continue;
    const allDone = mod.stages.every((id) => p.completed.includes(id));
    if (allDone) {
      medals.add(mod.medal);
      newMedals.push(mod.medal);
      coinsGained += COINS_MEDAL_BONUS;
    }
  }

  if (coinsGained > 0 || newMedals.length) {
    p.coins = (p.coins ?? 0) + coinsGained;
    p.medals = [...medals];
    saveCourseProgress(p);
    notifyWallet();
  }

  return { coinsGained, newMedals };
}
