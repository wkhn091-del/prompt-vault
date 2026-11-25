import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { CourseMapClient } from "../../../components/academy/CourseMapClient";
import { loadCourse, listCourseIds } from "../../../lib/courses/load";
import { courseMapServerData } from "../../../lib/courses/summary";
import type { CourseId } from "../../../lib/courses/types";

export const metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return listCourseIds().map((courseId) => ({ courseId }));
}

async function MapInner({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: raw } = await params;
  if (!listCourseIds().includes(raw as CourseId)) notFound();
  const courseId = raw as CourseId;
  const course = loadCourse(courseId);
  const data = courseMapServerData(course, "st-1");
  return <CourseMapClient data={data} />;
}

export default function CourseMapPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Shell active="academy">
      <main className="mobile-pad-x mx-auto max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-[#b9a89b]" dir="rtl">
              טוען מפה…
            </div>
          }
        >
          <MapInner params={params} />
        </Suspense>
      </main>
    </Shell>
  );
}
