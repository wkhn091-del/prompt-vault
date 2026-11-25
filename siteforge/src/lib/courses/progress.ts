"use client";

import type { CourseId, CourseProgress } from "./types";

const KEY = "siteforge-academy-progress-v1";

type Store = Record<string, CourseProgress>;

function defaults(courseId: CourseId): CourseProgress {
  return {
    courseId,
    completed: [],
    current: "st-1",
  };
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function loadCourseProgress(courseId: CourseId): CourseProgress {
  const store = readStore();
  return store[courseId] ?? defaults(courseId);
}

export function saveCourseProgress(progress: CourseProgress) {
  const store = readStore();
  store[progress.courseId] = progress;
  writeStore(store);
}

/** Minimum score to unlock the next stage after a stage quiz. */
export const STAGE_QUIZ_PASS_PERCENT = 80;

export function quizPercent(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

export function isQuizPassing(correct: number, total: number): boolean {
  return quizPercent(correct, total) >= STAGE_QUIZ_PASS_PERCENT;
}

export function markQuizPassed(
  courseId: CourseId,
  stageId: string,
): CourseProgress {
  const p = loadCourseProgress(courseId);
  const list = p.quizPassed ?? [];
  if (!list.includes(stageId)) {
    p.quizPassed = [...list, stageId];
    saveCourseProgress(p);
  }
  return p;
}

export function completeStage(
  courseId: CourseId,
  stageId: string,
  nextCoreId: string | null,
): CourseProgress {
  const p = loadCourseProgress(courseId);
  if (!p.completed.includes(stageId)) {
    p.completed = [...p.completed, stageId];
  }
  if (nextCoreId) p.current = nextCoreId;
  saveCourseProgress(p);
  // Wallet notify so header coins refresh even if award runs next
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("siteforge-wallet"));
  }
  return p;
}

export function markExamPassed(
  courseId: CourseId,
  score: number,
  percent: number,
  studentName: string,
): CourseProgress {
  const p = loadCourseProgress(courseId);
  p.examPassed = true;
  p.examScore = score;
  p.examPercent = percent;
  p.studentName = studentName.trim() || "תלמיד SiteForge";
  const stamp = Date.now().toString(36).toUpperCase();
  p.certificateId = `SF-${courseId.toUpperCase()}-2026-${stamp.slice(-8)}`;
  saveCourseProgress(p);
  return p;
}

/** Dev: open all stages + medals (bypasses locks). Quiz 80% gate still applies to mark a stage complete. */
export const ACADEMY_DEV_UNLOCK_ALL = true;
