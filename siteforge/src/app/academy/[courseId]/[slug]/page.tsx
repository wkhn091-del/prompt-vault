import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Shell } from "../../../../components/Shell";
import { LessonClient } from "../../../../components/academy/LessonClient";
import { loadCourse, listCourseIds } from "../../../../lib/courses/load";
import {
  coreStages,
  getStage,
  nextCoreStage,
} from "../../../../lib/courses/adapter";
import { stageLessonPayload } from "../../../../lib/courses/summary";
import type { CourseId } from "../../../../lib/courses/types";

export const metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  const params: { courseId: string; slug: string }[] = [];
  for (const courseId of listCourseIds()) {
    const course = loadCourse(courseId);
    for (const s of course.stages) {
      params.push({ courseId, slug: s.slug });
    }
  }
  return params;
}

async function LessonInner({
  params,
}: {
  params: Promise<{ courseId: string; slug: string }>;
}) {
  const { courseId: raw, slug } = await params;
  if (!listCourseIds().includes(raw as CourseId)) notFound();
  if (slug === "exam" || slug === "certificate") notFound();

  const courseId = raw as CourseId;
  const course = loadCourse(courseId);
  const stage = getStage(course, slug);
  if (!stage) notFound();

  const lesson = stageLessonPayload(course, stage);
  const next = nextCoreStage(course, stage.id);

  return (
    <LessonClient
      courseId={courseId}
      lesson={lesson}
      gate={{
        scriptsGateStage: course.scripts_gate?.stage,
        coreIds: coreStages(course).map((s) => s.id),
        stageId: stage.id,
        isBonus: stage.bonus,
        unlocksAfter: stage.unlocks_after,
        nextCoreId: next?.id ?? null,
      }}
    />
  );
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; slug: string }>;
}) {
  return (
    <Shell active="academy">
      <main className="mobile-pad-x mx-auto max-w-[900px] px-4 pb-20 pt-8 sm:px-6">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
              טוען שיעור…
            </div>
          }
        >
          <LessonInner params={params} />
        </Suspense>
      </main>
    </Shell>
  );
}
