import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Shell } from "../../../../components/Shell";
import { ExamClient } from "../../../../components/academy/ExamClient";
import { listCourseIds, loadCourse } from "../../../../lib/courses/load";
import type { CourseId } from "../../../../lib/courses/types";

export const metadata = {
  title: "מבחן סיום · SiteForge",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return listCourseIds().map((courseId) => ({ courseId }));
}

async function ExamInner({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: raw } = await params;
  if (!listCourseIds().includes(raw as CourseId)) notFound();
  const course = loadCourse(raw as CourseId);
  return (
    <ExamClient courseId={raw as CourseId} courseTitle={course.title} />
  );
}

export default function ExamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Shell active="academy">
      <main className="mobile-pad-x mx-auto max-w-[800px] px-4 pb-20 pt-10 sm:px-6">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
              טוען מבחן…
            </div>
          }
        >
          <ExamInner params={params} />
        </Suspense>
      </main>
    </Shell>
  );
}
