"use client";

import { useEffect, useMemo, useState } from "react";
import type { StageQuizQuestion } from "../../lib/courses/stage-quiz";
import {
  isQuizPassing,
  quizPercent,
  STAGE_QUIZ_PASS_PERCENT,
} from "../../lib/courses/progress";

const SKINS = [
  {
    // Q1 — chips + coral
    wrap: "rounded-2xl border border-[#ff7a45]/25 bg-gradient-to-l from-[#1a100c] to-[#0c0a09] p-4",
    badge: "bg-[#ff7a45] text-[#1a0e08]",
    label: "text-[#ffb08a]",
    pick: "border-[#ff7a45] bg-[#ff7a45]/18 text-[#ffe0a8] shadow-[inset_3px_0_0_#ff7a45]",
    idle: "border-[#2a211b] bg-[#0c0a09]/80 text-[#f5ede6] hover:border-[#ff7a45]/45",
    layout: "stack" as const,
  },
  {
    // Q2 — wide tiles + amber
    wrap: "rounded-xl border border-dashed border-[#ffb35c]/35 bg-[#16120f] p-4",
    badge: "bg-[#ffb35c] text-[#1a0e08]",
    label: "text-[#ffe0a8]",
    pick: "border-[#ffb35c] bg-[#ffb35c]/14 text-[#fff6e8] ring-1 ring-[#ffb35c]/30",
    idle: "border-[#3a2f26] bg-[#120e0b] text-[#f5ede6] hover:border-[#ffb35c]/40",
    layout: "tiles" as const,
  },
  {
    // Q3 — radio row + teal
    wrap: "rounded-[1.25rem] border border-emerald-500/20 bg-[#0d1412] p-4",
    badge: "bg-emerald-400 text-[#062016]",
    label: "text-emerald-200/90",
    pick: "border-emerald-400/70 bg-emerald-500/15 text-emerald-50",
    idle: "border-[#1e2a26] bg-[#0a100e] text-[#f5ede6] hover:border-emerald-500/35",
    layout: "radio" as const,
  },
] as const;

export function StageQuiz({
  questions,
  answers,
  alreadyPassed = false,
  onPass,
}: {
  questions: StageQuizQuestion[];
  answers: number[];
  alreadyPassed?: boolean;
  onPass?: (percent: number) => void;
}) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    if (!checked) return null;
    let correct = 0;
    questions.forEach((q, i) => {
      if (picked[q.id] === answers[i]) correct += 1;
    });
    const total = questions.length;
    const percent = quizPercent(correct, total);
    return {
      correct,
      total,
      percent,
      passed: isQuizPassing(correct, total),
    };
  }, [checked, picked, questions, answers]);

  useEffect(() => {
    if (score?.passed) onPass?.(score.percent);
  }, [score, onPass]);

  if (!questions.length) return null;

  return (
    <section className="mt-8 space-y-4" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#2a211b] pb-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#f5ede6]">◎ חידון השלב</h3>
          <p className="mt-1 text-[13px] text-[#b9a89b]">
            כל שאלה בסגנון אחר · צריך {STAGE_QUIZ_PASS_PERCENT}% לפתיחת השלב הבא
            {alreadyPassed ? " · כבר עברת ✓" : ""}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffb35c]/75 [direction:ltr]">
          {questions.length} Q · PASS {STAGE_QUIZ_PASS_PERCENT}%
        </p>
      </header>

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const skin = SKINS[qi % SKINS.length]!;
          const selected = picked[q.id];
          const correctIdx = answers[qi];

          return (
            <div key={q.id} className={skin.wrap}>
              <div className="mb-3 flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-black ${skin.badge}`}
                >
                  {qi + 1}
                </span>
                <p className={`text-[15px] font-bold leading-snug ${skin.label}`}>
                  {q.prompt}
                </p>
              </div>

              <div
                className={
                  skin.layout === "tiles"
                    ? "grid gap-2 sm:grid-cols-1"
                    : skin.layout === "radio"
                      ? "space-y-2"
                      : "space-y-1.5"
                }
              >
                {q.choices.map((c, ci) => {
                  const isSel = selected === ci;
                  let state =
                    "w-full text-start text-[14px] transition disabled:cursor-default ";

                  if (skin.layout === "radio") {
                    state +=
                      "flex items-center gap-3 rounded-full border px-3 py-2.5 ";
                  } else if (skin.layout === "tiles") {
                    state +=
                      "rounded-lg border px-3 py-3 font-medium ";
                  } else {
                    state += "rounded-xl border px-3 py-2.5 ";
                  }

                  if (!checked) {
                    state += isSel ? skin.pick : skin.idle;
                  } else if (ci === correctIdx) {
                    state +=
                      "border-emerald-400/60 bg-emerald-500/20 text-emerald-50";
                  } else if (isSel) {
                    state +=
                      "border-[#ff7a45]/55 bg-[#ff7a45]/12 text-[#ffb08a] line-through decoration-[#ff7a45]/50";
                  } else {
                    state += "border-transparent text-[#5c524a] opacity-55";
                  }

                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={checked}
                      onClick={() =>
                        setPicked((p) => ({ ...p, [q.id]: ci }))
                      }
                      className={state}
                    >
                      {skin.layout === "radio" ? (
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                            isSel || (checked && ci === correctIdx)
                              ? "border-current bg-current/20"
                              : "border-[#3a4540]"
                          }`}
                          aria-hidden
                        >
                          {(isSel || (checked && ci === correctIdx)) && "●"}
                        </span>
                      ) : (
                        <span
                          className={`me-2 inline-flex min-w-[1.5rem] font-black ${
                            skin.layout === "tiles" ? "text-[#ffb35c]" : ""
                          }`}
                        >
                          {c.letter}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        {skin.layout === "radio" ? (
                          <>
                            <span className="me-1.5 font-bold opacity-70">
                              {c.letter}.
                            </span>
                            {c.text}
                          </>
                        ) : (
                          c.text
                        )}
                      </span>
                      {checked && ci === correctIdx && (
                        <span className="ms-2 shrink-0 text-[12px] font-bold text-emerald-300">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {!checked ? (
          <button
            type="button"
            disabled={Object.keys(picked).length < questions.length}
            onClick={() => setChecked(true)}
            className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] disabled:opacity-40"
          >
            בדוק תשובות
          </button>
        ) : (
          <>
            <p
              className={`rounded-full px-4 py-2 text-[14px] font-bold ${
                score!.passed
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-[#ff7a45]/15 text-[#ffb08a]"
              }`}
            >
              {score!.correct}/{score!.total} · {score!.percent}%
              {score!.passed
                ? " · עברת, השלב הבא נפתח"
                : ` · מתחת ל־${STAGE_QUIZ_PASS_PERCENT}%`}
            </p>
            <button
              type="button"
              onClick={() => {
                setPicked({});
                setChecked(false);
              }}
              className={`rounded-full border px-4 py-2 text-[12px] font-bold ${
                score!.passed
                  ? "border-[#2a211b] text-[#b9a89b]"
                  : "border-[#ffb35c]/40 text-[#ffe0a8]"
              }`}
            >
              {score!.passed ? "תרגול נוסף" : "נסה שוב"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
