"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LessonBody } from "./LessonBody";
import type { StageLessonPayload } from "../../lib/courses/summary";
import type { CourseId } from "../../lib/courses/types";
import type { StageQuizQuestion } from "../../lib/courses/stage-quiz";
import {
  completeStage,
  loadCourseProgress,
  markQuizPassed,
  ACADEMY_DEV_UNLOCK_ALL,
  STAGE_QUIZ_PASS_PERCENT,
} from "../../lib/courses/progress";
import { awardStageCompletion } from "../../lib/courses/wallet";
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
  quiz,
  quizAnswers,
  modules,
}: {
  courseId: CourseId;
  lesson: StageLessonPayload;
  gate: GateInfo;
  quiz?: StageQuizQuestion[];
  quizAnswers?: number[];
  modules: { id: string; medal: string; stages: string[] }[];
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showScripts, setShowScripts] = useState(false);
  const [done, setDone] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [coinToast, setCoinToast] = useState<string | null>(null);

  const hasQuiz = Boolean(quiz && quiz.length > 0 && quizAnswers?.length);

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
    setQuizPassed(
      completed.includes(gate.stageId) ||
        (p.quizPassed ?? []).includes(gate.stageId),
    );

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

  const onQuizPass = useCallback(
    (_percent: number) => {
      markQuizPassed(courseId, gate.stageId);
      setQuizPassed(true);
    },
    [courseId, gate.stageId],
  );

  const canFinish = !hasQuiz || quizPassed || done;

  function finish() {
    if (!canFinish) return;
    const wasDone = done;
    completeStage(courseId, gate.stageId, gate.nextCoreId);
    if (!wasDone) {
      const { coinsGained, newMedals } = awardStageCompletion(
        courseId,
        gate.stageId,
        { modules },
      );
      if (coinsGained > 0) {
        const medalNote =
          newMedals.length > 0 ? ` · מדליה חדשה!` : "";
        setCoinToast(`+${coinsGained} 🪙${medalNote}`);
      }
    }
    setDone(true);
    window.setTimeout(() => {
      if (lesson.nextSlug) {
        router.push(stageHref(courseId, lesson.nextSlug));
        return;
      }
      router.push(courseHref(courseId));
    }, wasDone ? 0 : 650);
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
            ? ` נפתח אחרי ${gate.unlocksAfter}`
            : " השלימו את השלב הקודם (חידון ≥80%)"}
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

      {coinToast && (
        <p className="mb-4 rounded-xl border border-[#ffb35c]/40 bg-[#241a0e] px-4 py-2 text-center text-[14px] font-bold text-[#ffe0a8]">
          {coinToast}
        </p>
      )}

      <LessonBody
        bodyMd={lesson.body_md}
        scripts={lesson.scripts}
        showScripts={showScripts}
        quiz={quiz}
        quizAnswers={quizAnswers}
        quizAlreadyPassed={quizPassed}
        onQuizPass={onQuizPass}
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
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={finish}
            disabled={!canFinish}
            className="min-h-[48px] rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-6 text-[14px] font-bold text-[#1a0e08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {done ? "סיימתי · המשך" : "סיימתי את השלב"}
          </button>
          {hasQuiz && !canFinish && (
            <p className="text-center text-[12px] text-[#ffb08a]">
              עברו את החידון ב־{STAGE_QUIZ_PASS_PERCENT}%+ כדי לפתוח את השלב הבא
            </p>
          )}
        </div>
        {lesson.nextSlug && canFinish ? (
          <Link
            href={stageHref(courseId, lesson.nextSlug)}
            onClick={() => {
              if (!done) {
                completeStage(courseId, gate.stageId, gate.nextCoreId);
                setDone(true);
              }
            }}
            className="rounded-full border border-[#ffb35c]/35 px-4 py-2 text-[13px] font-bold text-[#ffe0a8]"
          >
            הבא ←
          </Link>
        ) : lesson.nextSlug ? (
          <span
            className="rounded-full border border-[#2a211b] px-4 py-2 text-[13px] font-bold text-[#6f6259]"
            title={`נעול עד ${STAGE_QUIZ_PASS_PERCENT}% בחידון`}
          >
            הבא 🔒
          </span>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
