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
  source: Record<string, string | undefined>;
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
          {data.source.book_pdf && (
            <a
              href={data.source.book_pdf}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#ffb35c]/35 bg-[#241a0e] px-4 py-2 text-[12px] font-bold text-[#ffe0a8]"
            >
              PDF הספר ↗
            </a>
          )}
          {data.source.decks_folder && (
            <a
              href={data.source.decks_folder}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#2a211b] bg-[#16120f] px-4 py-2 text-[12px] font-bold text-[#b9a89b]"
            >
              דקים ↗
            </a>
          )}
          <Link
            href="/academy"
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

      <section className="mt-10">
        <h3 className="text-lg font-extrabold text-[#ffe0a8]">מדליות</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.medals.map((m) => {
            const mod = data.modules.find((x) => x.id === m.module);
            const earned =
              ACADEMY_DEV_UNLOCK_ALL ||
              (mod
                ? mod.stageIds.every((id) => completed.includes(id))
                : false);
            return (
              <span
                key={m.id}
                className={`rounded-full border px-3 py-1.5 text-[12px] ${
                  earned
                    ? "border-[#ffb35c]/50 bg-[#241a0e] text-[#ffe0a8]"
                    : "border-[#2a211b] text-[#6f6259]"
                }`}
              >
                {m.emoji} {m.name}
                {!earned && " 🔒"}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
