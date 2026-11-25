"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MedalShowcaseData } from "../../../lib/courses/medal-showcase";
import { ACADEMY_DEV_UNLOCK_ALL, loadCourseProgress } from "../../../lib/courses/progress";
import { courseHref } from "../../../lib/courses/adapter";

const MedalSolo = dynamic(
  () => import("./MedalSolo").then((m) => m.MedalSolo),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[28px] border border-[#c4a574]/30 bg-[#080706] text-[#9a8b7e]">
        טוען מדליה…
      </div>
    ),
  },
);

export function MedalShowcase({ data }: { data: MedalShowcaseData }) {
  const progress = useMemo(
    () => loadCourseProgress(data.courseId),
    [data.courseId],
  );
  const open =
    ACADEMY_DEV_UNLOCK_ALL ||
    Boolean(progress.medals?.includes(data.medal.id)) ||
    (data.skills.length > 0 &&
      data.skills.every((s) => progress.completed.includes(s.id)));

  const [spin, setSpin] = useState(true);

  return (
    <div dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/academy/medals?course=${data.courseId}`}
          className="rounded-full border border-[#2a211b] px-4 py-2 text-[12px] font-bold text-[#b9a89b]"
        >
          ← חדר המדליות
        </Link>
        <Link
          href={courseHref(data.courseId)}
          className="rounded-full border border-dashed border-[#c4a574]/35 px-4 py-2 text-[12px] font-bold text-[#c4a574]"
        >
          מפת הקורס
        </Link>
      </div>

      <p className="font-mono text-[11px] tracking-[0.26em] text-[#c4a574]/80 [direction:ltr] [text-align:right]">
        MEDAL · TIER {data.medal.tier} · {data.module.id}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#e8c78a] sm:text-4xl">
        {data.medal.name}
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#9a8b7e]">
        {data.module.title}
        {data.module.week ? ` · ${data.module.week}` : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <MedalSolo
            medal={{
              id: data.medal.id,
              name: data.medal.name,
              emoji: data.medal.emoji,
              tier: data.medal.tier,
              open,
            }}
            glbUrl={data.glbUrl}
            autoSpin={spin}
          />
          <button
            type="button"
            onClick={() => setSpin((s) => !s)}
            className="mt-3 text-[12px] font-bold text-[#c4a574]/80"
          >
            {spin ? "עצירת סיבוב" : "סיבוב אוטומטי"}
          </button>
        </div>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#c4a574]/30 bg-[linear-gradient(165deg,rgba(196,160,116,0.12),transparent_50%),#0c0a09] p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#c4a574]/75 [direction:ltr]">
              HOW YOU WIN
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-[#ffe0a8]">
              איך אתה מוצלח
            </h2>
            {data.module.lead ? (
              <p className="mt-3 text-[14px] leading-relaxed text-[#d2c0b0]">
                {data.module.lead}
              </p>
            ) : null}
            {data.module.reward ? (
              <p className="mt-4 rounded-2xl border border-[#c4a574]/25 bg-black/30 px-4 py-3 text-[13px] text-[#e8c78a]">
                <span className="font-bold">הפרס שלך: </span>
                {data.module.reward}
              </p>
            ) : null}
            <p className="mt-3 font-mono text-[11px] text-[#9a8b7e]">
              נפתח ב{data.medal.earnedAt}
              {open ? " · המדליה שלך פתוחה" : " · עדיין בדרך"}
            </p>
          </section>

          <section className="rounded-[24px] border border-[#1f1a16] bg-[#0a0908] p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#c4a574]/75 [direction:ltr]">
              WHAT YOU KNOW
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-[#f5ede6]">
              מה אתה יודע
            </h2>
            <ul className="mt-4 space-y-3">
              {data.skills.map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-[#2a2520] bg-[#100e0c] px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#2a1c10,#120e0a)] font-mono text-[11px] font-bold text-[#f0c14b] ring-1 ring-[#c4a574]/40">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#f5ede6]">
                        {s.title}
                      </p>
                      {s.outcome ? (
                        <p className="mt-1 text-[12px] leading-relaxed text-[#9a8b7e]">
                          {s.outcome}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
