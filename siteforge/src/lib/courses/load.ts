import fs from "fs";
import path from "path";
import type { CourseId, RawCourse, RawExam } from "./types";

function coursesDir() {
  return path.join(process.cwd(), "content", "courses");
}

export function loadCourse(id: CourseId): RawCourse {
  const file = path.join(coursesDir(), `${id}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as RawCourse;
}

export function loadExam(id: CourseId): RawExam {
  const file = path.join(coursesDir(), `${id}-exam.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as RawExam;
}

export function listCourseIds(): CourseId[] {
  return ["sites", "agents"];
}
