"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourseId } from "../../lib/courses/types";
import { loadCourseProgress } from "../../lib/courses/progress";
import {
  COINS_MEDAL_BONUS,
  COINS_PER_STAGE,
  courseCoins,
  WALLET_EVENT,
} from "../../lib/courses/wallet";
import { courseHref } from "../../lib/courses/adapter";
import { useAuth } from "../auth/AuthProvider";
import type { RoomMedal } from "./medals/MedalsRoom";
import { GoldCoin } from "./GoldCoin";

const MedalsRoom = dynamic(
  () => import("./medals/MedalsRoom").then((m) => m.MedalsRoom),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(76vh,700px)] items-center justify-center rounded-[28px] border border-[#c4a574]/30 bg-[#080706] text-[#b9a89b]">
        פותחים את חדר המדליות…
      </div>
    ),
  },
);

export type MedalCardData = {
  id: string;
  name: string;
  emoji: string;
  module: string;
  moduleTitle: string;
  earnedAt: string;
  tier: number;
  stageIds: string[];
  glbUrl?: string | null;
};

export type CourseMedalsPayload = {
  courseId: CourseId;
  title: string;
  medals: MedalCardData[];
};

export function MedalsClient({
  courses,
  initialCourse,
}: {
  courses: CourseMedalsPayload[];
  initialCourse: CourseId;
}) {
  const router = useRouter();
  const { unlockAll } = useAuth();
  const [tab, setTab] = useState<CourseId>(initialCourse);
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WALLET_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(WALLET_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const active = courses.find((c) => c.courseId === tab) ?? courses[0]!;
  const progress = useMemo(
    () => loadCourseProgress(active.courseId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active.courseId, tick],
  );
  const coins = courseCoins(active.courseId);

  function earned(m: MedalCardData) {
    if (unlockAll) return true;
    if (progress.medals?.includes(m.id)) return true;
    return m.stageIds.every((id) => progress.completed.includes(id));
  }

  const roomMedals: RoomMedal[] = useMemo(
    () =>
      active.medals.map((m) => ({
        id: m.id,
        name: m.name,
        emoji: m.emoji,
        tier: m.tier,
        open: earned(m),
        moduleTitle: m.moduleTitle,
        earnedAt: m.earnedAt,
        glbUrl: m.glbUrl ?? null,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, progress, tick],
  );

  const unlocked = roomMedals.filter((m) => m.open).length;
  const selected = roomMedals.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    setSelectedId(null);
  }, [tab]);

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.26em] text-[#c4a574] [direction:ltr] [text-align:right]">
            PRIVATE COLLECTION · 3D
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#e8c78a] sm:text-4xl">
            חדר המדליות
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[#9a8b7e]">
            אוסף מתכת אמיתי. סובבו כל מדליה ביד. נעול = אבן כהה · פתוח = זהב חי.
            מטבעות: {COINS_PER_STAGE}/שיעור · +{COINS_MEDAL_BONUS} על מדליה.
          </p>
        </div>

        <div className="min-w-[160px] rounded-[22px] border border-[#c4a574]/40 bg-[linear-gradient(160deg,rgba(240,193,75,0.16)_0%,rgba(18,14,10,0.95)_42%,#0a0908_100%)] px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,224,168,0.2),0_16px_40px_rgba(0,0,0,0.45)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c4a574]/85">
            מטבעות בקורס
          </p>
          <div className="mt-2 flex items-center justify-center gap-2.5 [direction:ltr]">
            <GoldCoin size={36} />
            <span className="font-mono text-3xl font-bold tracking-tight text-[#ffe0a8]">
              {coins}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-[#9a8b7e]">
            {unlocked}/{active.medals.length} מדליות פתוחות
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {courses.map((c) => (
          <button
            key={c.courseId}
            type="button"
            onClick={() => setTab(c.courseId)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
              tab === c.courseId
                ? "bg-gradient-to-r from-[#c45a28] to-[#e8a05a] text-[#1a0e08] shadow-[0_8px_24px_rgba(196,90,40,0.28)]"
                : "border border-[#c4a574]/30 text-[#9a8b7e] hover:border-[#c4a574]/55"
            }`}
          >
            {c.courseId === "sites" ? "SITES" : "AGENTS"}
          </button>
        ))}
        <Link
          href={courseHref(active.courseId)}
          className="rounded-full border border-[#c4a574]/30 px-4 py-2 text-[13px] font-bold text-[#9a8b7e] hover:border-[#c4a574]/55"
        >
          מפת הקורס ←
        </Link>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <MedalsRoom
          medals={roomMedals}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEnter={(id) =>
            router.push(`/academy/medals/${active.courseId}/${id}`)
          }
        />

        <aside className="rounded-[28px] border border-[#c4a574]/35 bg-[linear-gradient(180deg,rgba(196,160,116,0.1)_0%,#0a0908_38%)] p-5 shadow-[inset_0_1px_0_rgba(255,224,168,0.12),0_18px_48px_rgba(0,0,0,0.4)]">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#c4a574]/70 [direction:ltr]">
                    SELECTED
                  </p>
                  <h2
                    className={`mt-2 text-xl font-extrabold ${
                      selected.open ? "text-[#ffe0a8]" : "text-[#6f6259]"
                    }`}
                  >
                    {selected.name}
                  </h2>
                </div>
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-[inset_0_1px_0_rgba(255,224,168,0.25)] ${
                    selected.open
                      ? "bg-[conic-gradient(from_210deg,#ffe0a8,#8a5a28,#f0c14b,#5a3810,#ffe0a8)] text-[#1a1008]"
                      : "bg-[#16120f] text-[#5a524a] ring-1 ring-[#2a2520]"
                  }`}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[#120e0a] text-[#f0c14b]">
                    T{selected.tier}
                  </span>
                </span>
              </div>
              <p className="mt-3 text-[13px] text-[#9a8b7e]">
                {selected.moduleTitle}
              </p>
              <p className="mt-3 font-mono text-[12px] text-[#c4a574]/85">
                {selected.open
                  ? "פתוח · סובבו עם העכבר"
                  : `נעול · נפתח ב${selected.earnedAt}`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/academy/medals/${active.courseId}/${selected.id}`}
                  className="rounded-full bg-gradient-to-l from-[#c45a28] to-[#e8a05a] px-4 py-2 text-[12px] font-bold text-[#1a0e08] shadow-[0_8px_22px_rgba(196,90,40,0.3)]"
                >
                  היכנסו למדליה ←
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-full border border-[#c4a574]/30 px-4 py-2 text-[12px] font-bold text-[#9a8b7e]"
                >
                  חזרה לסיבוב החדר
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-extrabold text-[#e8c78a]">בחרו מדליה</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#9a8b7e]">
                לחצו על מדליה במרכז. אפשר לסובב אותה כמו חפץ אמיתי. גררו ברקע
                כדי להסתובב בחדר.
              </p>
              <ul className="mt-4 max-h-[46vh] space-y-2 overflow-auto pe-1">
                {roomMedals.map((m) => (
                  <li key={m.id}>
                    <div
                      className={`flex w-full items-center gap-2 rounded-2xl border px-2 py-1.5 text-[13px] transition ${
                        m.open
                          ? "border-[#c4a574]/40 bg-[linear-gradient(120deg,rgba(240,193,75,0.1),transparent_60%)] text-[#ffe0a8] shadow-[inset_0_1px_0_rgba(255,224,168,0.1)]"
                          : "border-[#1f1a16] bg-[#0c0a09] text-[#6f6259]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(m.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 py-1.5 text-start transition hover:opacity-90"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                            m.open
                              ? "bg-[conic-gradient(from_210deg,#ffe0a8,#8a5a28,#f0c14b,#5a3810,#ffe0a8)] text-[#1a1008] shadow-[0_4px_12px_rgba(196,160,116,0.25)]"
                              : "bg-[#16120f] text-[#4a433c] ring-1 ring-[#2a2520]"
                          }`}
                        >
                          <span
                            className={`grid size-7 place-items-center rounded-full ${
                              m.open ? "bg-[#120e0a] text-[#f0c14b]" : ""
                            }`}
                          >
                            {m.open ? "★" : "◌"}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1 truncate font-semibold">
                          {m.name}
                        </span>
                      </button>
                      <Link
                        href={`/academy/medals/${active.courseId}/${m.id}`}
                        className="shrink-0 rounded-full bg-[#c4a574]/12 px-2.5 py-1.5 text-[11px] font-bold text-[#e8c78a] hover:bg-[#c4a574]/22"
                      >
                        כניסה
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
