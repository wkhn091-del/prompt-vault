"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CourseMap, type MapPayload } from "./CourseMap";
import {
  loadCourseProgress,
  ACADEMY_DEV_UNLOCK_ALL,
} from "../../lib/courses/progress";
import type { CourseId } from "../../lib/courses/types";

type ServerData = {
  courseId: CourseId;
  title: string;
  map: MapPayload;
  slugById: Record<string, string>;
  coreIds: string[];
  medals: {
    id: string;
    name: string;
    emoji: string;
    module: string;
    icon: string;
    tier: number;
  }[];
  modules: {
    id: string;
    title: string;
    week?: string;
    stageIds: string[];
  }[];
};

export function CourseMapClient({ data }: { data: ServerData }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [current, setCurrent] = useState(data.map.current);
  const [examPassed, setExamPassed] = useState(false);

  useEffect(() => {
    const p = loadCourseProgress(data.courseId);
    setCompleted(p.completed);
    const firstOpen =
      data.coreIds.find((id) => !p.completed.includes(id)) ??
      data.coreIds[data.coreIds.length - 1] ??
      "st-1";
    setCurrent(p.current && data.coreIds.includes(p.current) ? p.current : firstOpen);
    setExamPassed(Boolean(p.examPassed));
    setReady(true);
  }, [data.courseId, data.coreIds]);

  const examUnlocked =
    ACADEMY_DEV_UNLOCK_ALL ||
    data.coreIds.every((id) => completed.includes(id));

  if (!ready) {
    return (
      <div className="py-20 text-center text-[#b9a89b]" dir="rtl">
        טוען מפה…
      </div>
    );
  }

  const progressPct = Math.round(
    (completed.filter((id) => data.coreIds.includes(id)).length /
      Math.max(data.coreIds.length, 1)) *
      100,
  );

  const map: MapPayload = { ...data.map, current };

  return (
    <div dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[#ff7a45]/70 [direction:ltr] [text-align:right]">
            ACADEMY · {data.courseId.toUpperCase()}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#f5ede6] sm:text-2xl">
            {data.title}
          </h2>
          <p className="mt-1 text-[13px] text-[#b9a89b]">
            התקדמות: {progressPct}% ·{" "}
            {completed.filter((c) => data.coreIds.includes(c)).length}/
            {data.coreIds.length} שלבים
            {examPassed ? " · מבחן עבר ✓" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/#courses"
            className="rounded-full border border-[#2a211b] px-4 py-2 text-[12px] font-bold text-[#b9a89b]"
          >
            ← הקורסים שלי
          </Link>
        </div>
      </div>

      <CourseMap
        courseId={data.courseId}
        map={map}
        examPassed={examPassed}
        examUnlocked={examUnlocked}
        completedIds={completed}
        slugById={data.slugById}
        allowAllLinks={ACADEMY_DEV_UNLOCK_ALL}
      />

      <section className="relative mt-10 overflow-hidden rounded-[28px] border border-[#c4a574]/22 bg-[radial-gradient(ellipse_at_top_left,rgba(196,160,116,0.12),transparent_50%),#0a0908] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-[#c4a574]/75 [direction:ltr] [text-align:right]">
              PRIVATE COLLECTION
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#e8c78a]">מדליות</h3>
            <p className="mt-1.5 max-w-md text-[13px] text-[#7a6c60]">
              אוסף תלת ממד · סובבו כל מדליה ביד בחדר המדליות
            </p>
          </div>
          <Link
            href={`/academy/medals?course=${data.courseId}`}
            className="rounded-full bg-gradient-to-l from-[#c45a28] to-[#e8a05a] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] shadow-[0_10px_28px_rgba(196,90,40,0.28)] transition hover:brightness-110"
          >
            כניסה לחדר 3D ←
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {data.medals.map((m) => {
            const mod = data.modules.find((x) => x.id === m.module);
            const earned =
              ACADEMY_DEV_UNLOCK_ALL ||
              (mod
                ? mod.stageIds.every((id) => completed.includes(id))
                : false);
            return (
              <Link
                key={m.id}
                href={`/academy/medals?course=${data.courseId}`}
                className={`inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${
                  earned
                    ? "bg-[linear-gradient(135deg,rgba(232,199,138,0.18),rgba(20,14,10,0.9))] text-[#ffe0a8] ring-1 ring-[#c4a574]/45 hover:ring-[#e8c78a]/75"
                    : "bg-[#0c0a09] text-[#6f6259] ring-1 ring-[#1f1a16] hover:ring-[#2a2520]"
                }`}
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-[10px] ${
                    earned
                      ? "bg-[conic-gradient(from_210deg,#ffe0a8,#8a5a28,#f0c14b,#5a3810,#ffe0a8)] text-[#1a1008]"
                      : "bg-[#16120f] text-[#4a433c]"
                  }`}
                  aria-hidden
                >
                  {earned ? "★" : "◌"}
                </span>
                {m.name}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
