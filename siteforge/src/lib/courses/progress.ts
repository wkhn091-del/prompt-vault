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

/** Dev: open all for browsing maps */
export const ACADEMY_DEV_UNLOCK_ALL = true;
