import type { CourseId } from "./types";

/** Client-safe course id list (mirrors content/courses). */
export function listCourseIds(): CourseId[] {
  return ["sites", "agents"];
}
