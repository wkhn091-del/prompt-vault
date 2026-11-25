import Link from "next/link";
import { Shell } from "../../components/Shell";
import { listCourseIds, loadCourse } from "../../lib/courses/load";
import { coreStages } from "../../lib/courses/adapter";

export const metadata = {
  title: "הקורסים שלי · SiteForge Academy",
  robots: { index: false, follow: false },
};

export default function AcademyIndexPage() {
  const courses = listCourseIds().map((id) => {
    const c = loadCourse(id);
    return {
      id,
      title: c.title,
      modules: c.modules.filter((m) => m.id !== "B").length,
      stages: coreStages(c).length,
      bonuses: c.stages.filter((s) => s.bonus).length,
      medals: c.medals.length,
      scripts: c.stages.reduce((n, s) => n + (s.scripts?.length ?? 0), 0),
    };
  });

  return (
    <Shell active="academy">
      <main className="mobile-pad-x mx-auto max-w-[1000px] px-4 pb-20 pt-10 sm:px-6" dir="rtl">
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#ff7a45]/75 [direction:ltr] [text-align:right]">
          SITEFORGE ACADEMY · STUDIO OMEK
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#f5ede6] sm:text-4xl">
          הקורסים שלי
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-[#b9a89b]">
          בחרו קורס, עקבו אחרי המפה, והעתיקו סקריפטים ישירות ל-Cursor.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/academy/${c.id}`}
              className="group rounded-3xl border border-[#2a211b] bg-gradient-to-b from-[#16120f] to-[#0c0a09] p-6 transition hover:border-[#ff7a45]/45"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff7a45]">
                {c.id}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-[#f5ede6] group-hover:text-[#ffe0a8]">
                {c.title}
              </h2>
              <p className="mt-3 text-[13px] text-[#b9a89b]">
                {c.modules} מודולים · {c.stages} שלבים · {c.bonuses} בונוס ·{" "}
                {c.medals} מדליות · {c.scripts} סקריפטים
              </p>
              <span className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-4 py-2 text-[13px] font-bold text-[#1a0e08]">
                פתח מפה ←
              </span>
            </Link>
          ))}
        </div>
      </main>
    </Shell>
  );
}
