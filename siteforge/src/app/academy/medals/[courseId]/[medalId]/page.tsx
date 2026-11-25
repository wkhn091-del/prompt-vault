import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Shell } from "../../../../../components/Shell";
import { MedalShowcase } from "../../../../../components/academy/medals/MedalShowcase";
import { buildMedalShowcase } from "../../../../../lib/courses/medal-showcase";
import { loadCourse, listCourseIds } from "../../../../../lib/courses/load";
import type { CourseId } from "../../../../../lib/courses/types";

export const metadata = {
  title: "מדליה SiteForge Academy",
  robots: { index: false, follow: false },
};

function medalGlbUrl(courseId: string, medalId: string): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "medals", courseId, `${medalId}.glb`),
    path.join(process.cwd(), "public", "medals", `${courseId}-${medalId}.glb`),
    path.join(process.cwd(), "public", "medals", `${medalId}.glb`),
  ];
  for (const file of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ file)) {
      const rel = path.relative(path.join(process.cwd(), "public"), file);
      return `/${rel.split(path.sep).join("/")}?v=6`;
    }
  }
  return null;
}

export function generateStaticParams() {
  return listCourseIds().flatMap((courseId) => {
    const c = loadCourse(courseId);
    return c.medals.map((m) => ({ courseId, medalId: m.id }));
  });
}

export default async function MedalDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; medalId: string }>;
}) {
  const { courseId, medalId } = await params;
  if (courseId !== "sites" && courseId !== "agents") notFound();
  const course = loadCourse(courseId as CourseId);
  const medal = course.medals.find((m) => m.id === medalId);
  if (!medal) notFound();

  const data = buildMedalShowcase(
    course,
    medal,
    medalGlbUrl(courseId, medal.id),
  );
  if (!data) notFound();

  return (
    <Shell active="medals">
      <main className="mobile-pad-x mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
        <MedalShowcase data={data} />
      </main>
    </Shell>
  );
}
