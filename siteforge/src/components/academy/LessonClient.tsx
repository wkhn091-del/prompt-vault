"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LessonBody } from "./LessonBody";
import type { StageLessonPayload } from "../../lib/courses/summary";
import type { CourseId } from "../../lib/courses/types";
import {
  completeStage,
  loadCourseProgress,
  ACADEMY_DEV_UNLOCK_ALL,
} from "../../lib/courses/progress";
import { courseHref, stageHref } from "../../lib/courses/adapter";

type GateInfo = {
  scriptsGateStage?: string;
  coreIds: string[];
  stageId: string;
  isBonus: boolean;
  unlocksAfter?: string;
  nextCoreId: string | null;
};

export function LessonClient({
  courseId,
  lesson,
  gate,
}: {
  courseId: CourseId;
  lesson: StageLessonPayload;
  gate: GateInfo;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showScripts, setShowScripts] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = loadCourseProgress(courseId);
    const completed = p.completed;
    let ok = ACADEMY_DEV_UNLOCK_ALL;
    if (!ok) {
      if (gate.isBonus) {
        ok = gate.unlocksAfter
          ? completed.includes(gate.unlocksAfter)
          : true;
      } else {
        const idx = gate.coreIds.indexOf(gate.stageId);
        if (idx <= 0) ok = true;
        else ok = completed.includes(gate.coreIds[idx - 1]!);
      }
    }
    setUnlocked(ok);
    setDone(completed.includes(gate.stageId));

    const gateIdx = gate.scriptsGateStage
      ? gate.coreIds.indexOf(gate.scriptsGateStage)
      : -1;
    const stageIdx = gate.coreIds.indexOf(gate.stageId);
    const scriptsOk =
      ACADEMY_DEV_UNLOCK_ALL ||
      gate.isBonus ||
      gateIdx < 0 ||
      (stageIdx >= gateIdx &&
        (completed.includes(gate.scriptsGateStage!) || stageIdx >= gateIdx));
    setShowScripts(scriptsOk);
    setReady(true);
  }, [courseId, gate]);

  function finish() {
    completeStage(courseId, gate.stageId, gate.nextCoreId);
    setDone(true);
    if (lesson.nextSlug) {
      router.push(stageHref(courseId, lesson.nextSlug));
      return;
    }
    router.push(courseHref(courseId));
  }

  if (!ready) {
    return (
      <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
        טוען…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center" dir="rtl">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 text-2xl font-extrabold text-[#f5ede6]">
          {lesson.title}
        </h1>
        <p className="mt-3 text-[#b9a89b]">
          השלב נעול
          {gate.unlocksAfter
            ? ` — נפתח אחרי ${gate.unlocksAfter}`
            : " — השלימו את השלב הקודם"}
        </p>
        <Link
          href={courseHref(courseId)}
          className="mt-6 inline-flex rounded-full border border-[#ffb35c]/40 px-5 py-2.5 text-[13px] font-bold text-[#ffe0a8]"
        >
          חזרה למפה
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-[#ff7a45]/75">
            {lesson.module} · שלב {lesson.n}
            {lesson.bonus ? " · בונוס" : ""}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#f5ede6] sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-1 text-[13px] text-[#b9a89b]">{lesson.moduleTitle}</p>
        </div>
        <Link
          href={courseHref(courseId)}
          className="rounded-full border border-[#2a211b] px-4 py-2 text-[12px] font-bold text-[#b9a89b]"
        >
          ← מפה
        </Link>
      </div>

      {lesson.goal && (
        <div className="mb-5 rounded-2xl border border-[#ff7a45]/25 bg-[#16120f] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff7a45]">
            מטרה
          </p>
          <p className="mt-1 text-[14px] text-[#f5ede6]">{lesson.goal}</p>
        </div>
      )}

      <LessonBody
        bodyMd={lesson.body_md}
        scripts={lesson.scripts}
        showScripts={showScripts}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#2a211b] pt-6">
        {lesson.prevSlug ? (
          <Link
            href={stageHref(courseId, lesson.prevSlug)}
            className="rounded-full border border-[#2a211b] px-4 py-2 text-[13px] font-bold text-[#b9a89b]"
          >
            → הקודם
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={finish}
          className="min-h-[48px] rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-6 text-[14px] font-bold text-[#1a0e08]"
        >
          {done ? "סיימתי · המשך" : "סיימתי את השלב"}
        </button>
        {lesson.nextSlug ? (
          <Link
            href={stageHref(courseId, lesson.nextSlug)}
            className="rounded-full border border-[#ffb35c]/35 px-4 py-2 text-[13px] font-bold text-[#ffe0a8]"
          >
            הבא ←
          </Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
