"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Lock,
  ScrollText,
  Target,
} from "lucide-react";
import { StageProse } from "./StageProse";
import { parseQuiz, scoreQuiz } from "../lib/quiz";
import {
  completeStage,
  isCompleted,
  isUnlocked,
  loadProgress,
  saveProgress,
  type ProgressState,
} from "../lib/progress";
import { getScriptMeta } from "../lib/vault-links";

type Section = { heading: string; body: string };

type Props = {
  stageId: string;
  title: string;
  trackTitle: string;
  duration: number | null;
  passScore: number;
  scriptIds: string[];
  sections: Section[];
  prevId: string | null;
  nextId: string | null;
  totalStages: number;
};

type Tab = "learn" | "practice" | "scripts" | "quiz";

export function StageRoom(props: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [tab, setTab] = useState<Tab>("learn");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resultPercent, setResultPercent] = useState<number | null>(null);

  const learn = props.sections.find((s) => s.heading.includes("לימוד"));
  const practice = props.sections.find((s) => s.heading.includes("התנסות"));
  const scriptsSec = props.sections.find((s) => s.heading.includes("סקריפט"));
  const quizSec = props.sections.find((s) => s.heading.includes("מבחן"));

  const questions = useMemo(
    () => parseQuiz(quizSec?.body ?? ""),
    [quizSec?.body],
  );

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#ffb08a]">
        טוען שלב…
      </div>
    );
  }

  const unlocked = isUnlocked(progress, props.stageId);
  const done = isCompleted(progress, props.stageId);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border border-[#ff7a45]/30 bg-[#ff7a45]/10">
          <Lock className="size-9 text-[#ff7a45]" />
        </div>
        <h1 className="text-xl font-extrabold [font-family:var(--font-heebo),sans-serif]">
          השלב נעול
        </h1>
        <p className="mt-2 text-[14px] text-white/50">
          עברו את המבחן בשלב הקודם כדי לפתוח את {props.stageId}.
        </p>
        <Link
          href="/learn"
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 text-[13px] font-bold text-[#1a0e08]"
        >
          חזרה למפה
        </Link>
      </div>
    );
  }

  function submitQuiz() {
    const scored = scoreQuiz(questions, answers);
    setResultPercent(scored.percent);
    setSubmitted(true);
    if (scored.percent >= props.passScore) {
      const next = completeStage(
        progress!,
        props.stageId,
        scored.percent,
        props.totalStages,
      );
      saveProgress(next);
      setProgress(next);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "learn", label: "לימוד", icon: BookOpen },
    { id: "practice", label: "משימה", icon: ClipboardList },
    { id: "scripts", label: "סקריפטים", icon: ScrollText },
    { id: "quiz", label: "מבחן", icon: Target },
  ];

  return (
    <div className="mx-auto max-w-[820px] px-4 pb-24 pt-4 sm:px-6" dir="rtl">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/50 hover:text-[#ffb08a]"
      >
        <ArrowRight className="size-3.5" />
        המפה
      </Link>

      <header className="mt-4 overflow-hidden rounded-2xl border border-[#ff7a45]/30 bg-gradient-to-b from-[#1a1410] to-[#0c0a09]">
        <div className="bg-gradient-to-l from-[#ff7a45]/25 via-transparent to-transparent px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-[#ff7a45]/80 [direction:ltr]">
              {props.stageId}
            </span>
            <span className="rounded-full border border-[#ff7a45]/25 bg-[#ff7a45]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ffb08a]">
              {props.trackTitle}
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                עברת
              </span>
            )}
          </div>
          <h1 className="mt-2 text-[clamp(1.35rem,3.5vw,1.9rem)] font-extrabold leading-tight [font-family:var(--font-heebo),sans-serif]">
            {props.title}
          </h1>
          <p className="mt-1.5 text-[12px] text-white/40">
            {props.duration ? `${props.duration} דק׳ · ` : ""}
            מבחן אמריקאי · ציון עובר {props.passScore}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-white/[0.06] px-2 py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-bold transition ${
                tab === t.id
                  ? "bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[#1a0e08]"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#16120f] to-[#0c0a09] px-4 py-5 sm:px-6 sm:py-6">
        {tab === "learn" && (
          <StageProse text={learn?.body || "אין תוכן לימוד לשלב זה."} />
        )}
        {tab === "practice" && (
          <StageProse text={practice?.body || "אין משימה מוגדרת."} />
        )}
        {tab === "scripts" && (
          <div className="space-y-4">
            {props.scriptIds.length === 0 && !scriptsSec?.body ? (
              <p className="text-[14px] text-white/50">
                בשלב זה אין סקריפט מהמאגר. תרגול בלבד.
              </p>
            ) : (
              <>
                <p className="text-[12px] text-[#ffb08a]">
                  הסקריפטים באתר · מעתיקים מהכרטיס ומשתמשים בשיעור
                </p>

                {props.scriptIds.length > 0 && (
                  <div className="space-y-3">
                    {props.scriptIds.map((id) => {
                      const meta = getScriptMeta(id);
                      return (
                        <div
                          key={id}
                          className="rounded-2xl border border-[#ff7a45]/25 bg-black/35 px-3.5 py-3"
                        >
                          <p className="font-mono text-[12px] font-bold text-[#ffb35c] [direction:ltr] [text-align:left]">
                            {id}
                          </p>
                          <p className="mt-1 text-[13px] text-white/70 [font-family:var(--font-heebo),sans-serif]">
                            {meta?.title ?? "סקריפט באתר"}
                          </p>
                          {meta?.courseTitle && (
                            <p className="mt-0.5 text-[11px] text-white/40">
                              {meta.courseTitle}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {scriptsSec?.body && (
                  <div className="pt-1">
                    <StageProse text={scriptsSec.body} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {tab === "quiz" && (
          <div>
            {questions.length === 0 ? (
              <p className="text-white/50">לא נמצאו שאלות מבחן בקובץ השלב.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((q, qi) => (
                  <fieldset key={q.id} className="space-y-2">
                    <legend className="text-[15px] font-bold text-white [font-family:var(--font-heebo),sans-serif]">
                      {qi + 1}. {q.prompt}
                    </legend>
                    <div className="space-y-2">
                      {q.choices.map((c, ci) => {
                        const selected = answers[q.id] === ci;
                        const reveal = submitted;
                        const isCorrect = ci === q.answerIndex;
                        let cls =
                          "border-white/10 bg-white/[0.03] hover:border-[#ff7a45]/35";
                        if (selected && !reveal)
                          cls =
                            "border-[#ff7a45]/50 bg-[#ff7a45]/15 ring-1 ring-[#ff7a45]/40";
                        if (reveal && isCorrect)
                          cls = "border-emerald-400/50 bg-emerald-400/10";
                        if (reveal && selected && !isCorrect)
                          cls = "border-red-400/50 bg-red-400/10";
                        return (
                          <label
                            key={ci}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-[14px] transition ${cls}`}
                          >
                            <input
                              type="radio"
                              className="mt-1 accent-[#ff7a45]"
                              name={q.id}
                              disabled={submitted && resultPercent !== null && (resultPercent >= props.passScore)}
                              checked={selected}
                              onChange={() =>
                                setAnswers((a) => ({ ...a, [q.id]: ci }))
                              }
                            />
                            <span className="leading-relaxed text-white/85">
                              {c}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {submitted && q.explanation && (
                      <p className="text-[12px] text-white/45">{q.explanation}</p>
                    )}
                  </fieldset>
                ))}

                {!submitted || (resultPercent !== null && resultPercent < props.passScore) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (submitted) {
                        setSubmitted(false);
                        setResultPercent(null);
                        setAnswers({});
                        return;
                      }
                      if (Object.keys(answers).length < questions.length) {
                        alert("ענו על כל השאלות לפני שליחה");
                        return;
                      }
                      submitQuiz();
                    }}
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[14px] font-extrabold text-[#1a0e08] sm:w-auto sm:px-8"
                  >
                    {submitted ? "נסו שוב" : "שלחו מבחן"}
                  </button>
                ) : null}

                {submitted && resultPercent !== null && (
                  <div
                    className={`rounded-2xl border px-4 py-4 ${
                      resultPercent >= props.passScore
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : "border-red-400/40 bg-red-400/10"
                    }`}
                  >
                    <p className="text-[16px] font-extrabold">
                      ציון: {resultPercent}%
                    </p>
                    <p className="mt-1 text-[13px] text-white/70">
                      {resultPercent >= props.passScore
                        ? "עברת! השלב הבא נפתח במפה."
                        : `צריך לפחות ${props.passScore}. נסו שוב.`}
                    </p>
                    {resultPercent >= props.passScore && props.nextId && (
                      <button
                        type="button"
                        onClick={() => router.push(`/learn/${props.nextId}`)}
                        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 text-[13px] font-bold text-[#1a0e08]"
                      >
                        לשלב הבא {props.nextId}
                        <ArrowLeft className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {tab !== "quiz" && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setTab(tab === "learn" ? "practice" : tab === "practice" ? "scripts" : "quiz")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#ff7a45]/35 bg-[#ff7a45]/10 px-5 text-[13px] font-bold text-[#ffb08a]"
          >
            {tab === "scripts" ? "למבחן השער" : "המשך"}
            <ArrowLeft className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
