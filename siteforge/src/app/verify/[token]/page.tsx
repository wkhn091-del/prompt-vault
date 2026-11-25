import { Suspense } from "react";
import Link from "next/link";
import { Shell } from "../../../components/Shell";
import { verifyCertToken } from "../../../lib/courses/exam-server";
import { loadCourse } from "../../../lib/courses/load";
import type { CourseId } from "../../../lib/courses/types";

export const metadata = {
  title: "אימות תעודה · SiteForge",
};

async function VerifyInner({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = verifyCertToken(decodeURIComponent(token));

  let courseTitle = "";
  if (payload?.c) {
    try {
      courseTitle = loadCourse(payload.c as CourseId).title;
    } catch {
      courseTitle = String(payload.c);
    }
  }

  return (
    <>
      {payload ? (
        <>
          <p className="text-5xl">✓</p>
          <h1 className="mt-4 text-2xl font-extrabold text-[#ffe0a8]">
            תעודה תקפה
          </h1>
          <div className="mt-6 space-y-2 rounded-2xl border border-[#2a211b] bg-[#16120f] px-5 py-5 text-[15px] text-[#f5ede6]">
            <p>
              <span className="text-[#6f6259]">שם: </span>
              {payload.n}
            </p>
            <p>
              <span className="text-[#6f6259]">קורס: </span>
              {courseTitle || payload.c}
            </p>
            <p>
              <span className="text-[#6f6259]">תאריך: </span>
              {payload.d}
            </p>
            <p>
              <span className="text-[#6f6259]">ציון: </span>
              {payload.s}%
            </p>
            <p className="font-mono text-[13px] text-[#ffb35c] [direction:ltr]">
              {payload.id}
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="text-5xl">✗</p>
          <h1 className="mt-4 text-2xl font-extrabold text-[#ff7a45]">
            לא תקפה
          </h1>
          <p className="mt-3 text-[#b9a89b]">
            הקישור אינו מזוהה כתעודת SiteForge.
          </p>
        </>
      )}
      <Link href="/" className="mt-8 inline-block text-[13px] text-[#6f6259]">
        ← דף הבית
      </Link>
    </>
  );
}

export default function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Shell>
      <main className="mx-auto max-w-lg px-4 py-16 text-center" dir="rtl">
        <Suspense fallback={<p className="text-[#b9a89b]">בודק…</p>}>
          <VerifyInner params={params} />
        </Suspense>
      </main>
    </Shell>
  );
}
