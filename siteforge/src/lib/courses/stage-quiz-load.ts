import fs from "fs";
import path from "path";
import type { CourseId } from "./types";
import type { StageQuizQuestion } from "./stage-quiz";

export function loadStageQuizzes(courseId: CourseId): Record<
  string,
  StageQuizQuestion[]
> {
  const file = path.join(
    process.cwd(),
    "content",
    "courses",
    `${courseId}-quizzes.json`,
  );
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    StageQuizQuestion[]
  >;
}

export function loadStageQuizAnswers(
  courseId: CourseId,
): Record<string, number[]> {
  const file = path.join(
    process.cwd(),
    "content",
    "courses",
    `${courseId}-quiz-answers.json`,
  );
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, number[]>;
}
