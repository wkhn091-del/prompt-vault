import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Shell } from "../../../../components/Shell";
import { CertificateClient } from "../../../../components/academy/CertificateClient";
import { listCourseIds, loadCourse } from "../../../../lib/courses/load";
import type { CourseId } from "../../../../lib/courses/types";

export const metadata = {
  title: "תעודה · SiteForge",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return listCourseIds().map((courseId) => ({ courseId }));
}

async function CertInner({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: raw } = await params;
  if (!listCourseIds().includes(raw as CourseId)) notFound();
  const course = loadCourse(raw as CourseId);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  return (
    <CertificateClient
      courseId={raw as CourseId}
      courseTitle={course.title}
      siteUrl={siteUrl}
    />
  );
}

export default function CertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Shell active="academy">
      <main className="mobile-pad-x mx-auto max-w-[1000px] px-4 pb-20 pt-10 sm:px-6">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
              טוען תעודה…
            </div>
          }
        >
          <CertInner params={params} />
        </Suspense>
      </main>
    </Shell>
  );
}
