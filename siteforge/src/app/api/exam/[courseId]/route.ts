import { NextResponse } from "next/server";
import { listCourseIds, loadExam } from "../../../../lib/courses/load";
import {
  gradeExam,
  prepareExamAttempt,
} from "../../../../lib/courses/exam-server";
import type { CourseId } from "../../../../lib/courses/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const { courseId: raw } = await ctx.params;
  if (!listCourseIds().includes(raw as CourseId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const courseId = raw as CourseId;
  const exam = loadExam(courseId);
  const attempt = prepareExamAttempt(exam);
  return NextResponse.json(attempt);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const { courseId: raw } = await ctx.params;
  if (!listCourseIds().includes(raw as CourseId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const courseId = raw as CourseId;
  const body = (await req.json()) as {
    attemptToken?: string;
    answers?: Record<string, string>;
    name?: string;
  };
  if (!body.attemptToken || !body.answers) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  try {
    const exam = loadExam(courseId);
    const result = gradeExam(
      courseId,
      body.attemptToken,
      body.answers,
      body.name ?? "",
      exam,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "attempt_expired" }, { status: 400 });
  }
}
