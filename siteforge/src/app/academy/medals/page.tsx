import { Suspense } from "react";
import fs from "fs";
import path from "path";
import { Shell } from "../../../components/Shell";
import { MedalsClient } from "../../../components/academy/MedalsClient";
import { listCourseIds, loadCourse } from "../../../lib/courses/load";
import type { CourseId } from "../../../lib/courses/types";

export const metadata = {
  title: "חדר המדליות · SiteForge Academy",
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

function buildCourses() {
  return listCourseIds().map((id) => {
    const c = loadCourse(id);
    return {
      courseId: id,
      title: c.title,
      medals: c.medals.map((m) => {
        const mod = c.modules.find((x) => x.id === m.module);
        return {
          id: m.id,
          name: m.name,
          emoji: m.emoji,
          module: m.module,
          moduleTitle: mod?.title ?? m.module,
          earnedAt: m.earned_at,
          tier: m.tier,
          stageIds: mod?.stages ?? [],
          glbUrl: medalGlbUrl(id, m.id),
        };
      }),
    };
  });
}

async function MedalsInner({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const sp = await searchParams;
  const initial: CourseId =
    sp.course === "agents" || sp.course === "sites" ? sp.course : "sites";
  return <MedalsClient courses={buildCourses()} initialCourse={initial} />;
}

export default function MedalsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  return (
    <Shell active="medals">
      <main className="mobile-pad-x mx-auto max-w-[1200px] px-4 pb-20 pt-10 sm:px-6">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
              טוען חדר מדליות…
            </div>
          }
        >
          <MedalsInner searchParams={searchParams} />
        </Suspense>
      </main>
    </Shell>
  );
}
