"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CourseId } from "../../lib/courses/types";
import {
  markExamPassed,
  loadCourseProgress,
} from "../../lib/courses/progress";
import { certificateHref, courseHref } from "../../lib/courses/adapter";

type Q = { id: string; q: string; options: { id: string; text: string }[] };

export function ExamClient({
  courseId,
  courseTitle,
}: {
  courseId: CourseId;
  courseTitle: string;
}) {
  const [name, setName] = useState("");
  const [named, setNamed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    percent: number;
    correct: number;
    total: number;
    wrongStages: string[];
  } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const p = loadCourseProgress(courseId);
    if (p.studentName) setName(p.studentName);
    if (p.examPassed) {
      setResult({
        passed: true,
        percent: p.examPercent ?? 100,
        correct: p.examScore ?? 20,
        total: 20,
        wrongStages: [],
      });
      setNamed(true);
    }
  }, [courseId]);

  const start = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 40) {
      setErr("שם מלא: 2–40 תווים");
      return;
    }
    if (!/^[\u0590-\u05FFa-zA-Z\s'\-]+$/.test(trimmed)) {
      setErr("רק עברית/אנגלית, רווח, מקף וגרש");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/exam/${courseId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("load_failed");
      setToken(data.attemptToken);
      setQuestions(data.questions);
      setAnswers({});
      setIdx(0);
      setReview(false);
      setResult(null);
      setNamed(true);
    } catch {
      setErr("לא הצלחנו לטעון את המבחן");
    } finally {
      setLoading(false);
    }
  }, [courseId, name]);

  async function submit() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/exam/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptToken: token,
          answers,
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fail");
      setResult(data);
      if (data.passed) {
        markExamPassed(courseId, data.correct, data.percent, name.trim());
        if (data.certId && data.certToken) {
          try {
            localStorage.setItem(
              `siteforge-cert-${courseId}`,
              JSON.stringify({
                certId: data.certId,
                certToken: data.certToken,
                name: name.trim(),
                percent: data.percent,
                correct: data.correct,
                total: data.total,
              }),
            );
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      setErr("שגיאה בשליחה — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg text-center" dir="rtl">
        <p className="text-5xl">{result.passed ? "🏅" : "📝"}</p>
        <h1 className="mt-4 text-3xl font-extrabold text-[#f5ede6]">
          {result.passed ? "עברתם!" : "כמעט…"}
        </h1>
        <p className="mt-3 text-[17px] text-[#b9a89b]">
          ציון: {result.percent}% · {result.correct}/{result.total}
        </p>
        {!result.passed && result.wrongStages.length > 0 && (
          <p className="mt-4 rounded-xl border border-[#ff7a45]/30 bg-[#241a0e] px-4 py-3 text-[13px] text-[#ffb08a]">
            כדאי לחזור על: {result.wrongStages.slice(0, 8).join(", ")}
            {result.wrongStages.length > 8 ? "…" : ""}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {result.passed ? (
            <Link
              href={certificateHref(courseId)}
              className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-6 py-3 text-[14px] font-bold text-[#1a0e08]"
            >
              קבל תעודה
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setNamed(false);
              }}
              className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-6 py-3 text-[14px] font-bold text-[#1a0e08]"
            >
              נסה שוב
            </button>
          )}
          <Link
            href={courseHref(courseId)}
            className="rounded-full border border-[#2a211b] px-6 py-3 text-[14px] font-bold text-[#b9a89b]"
          >
            חזרה למפה
          </Link>
        </div>
      </div>
    );
  }

  if (!named) {
    return (
      <div className="mx-auto max-w-md" dir="rtl">
        <h1 className="text-2xl font-extrabold text-[#f5ede6]">מבחן סיום</h1>
        <p className="mt-2 text-[14px] text-[#b9a89b]">{courseTitle}</p>
        <p className="mt-4 text-[14px] text-[#b9a89b]">
          20 שאלות · ציון עובר 80% (16 נכונות) · אפשר לנסות שוב בלי הגבלה
        </p>
        <label className="mt-6 block text-[13px] font-bold text-[#ffe0a8]">
          השם המלא שלך לתעודה
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#2a211b] bg-[#16120f] px-4 py-3 text-[15px] text-[#f5ede6] outline-none focus:border-[#ffb35c]/50"
            placeholder="ישראל ישראלי"
            maxLength={40}
          />
        </label>
        {err && <p className="mt-2 text-[13px] text-[#ff7a45]">{err}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={start}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] py-3 text-[14px] font-bold text-[#1a0e08] disabled:opacity-50"
        >
          {loading ? "טוען…" : "התחל מבחן"}
        </button>
        <Link
          href={courseHref(courseId)}
          className="mt-4 block text-center text-[13px] text-[#6f6259]"
        >
          ← חזרה
        </Link>
      </div>
    );
  }

  if (review) {
    return (
      <div className="mx-auto max-w-lg" dir="rtl">
        <h2 className="text-xl font-extrabold text-[#f5ede6]">סיכום לפני שליחה</h2>
        <p className="mt-2 text-[14px] text-[#b9a89b]">
          נענו {Object.keys(answers).length}/{questions.length} שאלות
        </p>
        <ul className="mt-4 space-y-2">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className={`rounded-xl border px-3 py-2 text-[13px] ${
                answers[q.id]
                  ? "border-[#2a211b] text-[#f5ede6]"
                  : "border-[#ff7a45]/40 text-[#ffb08a]"
              }`}
            >
              {i + 1}. {answers[q.id] ? "✓ נענתה" : "חסרה תשובה"}
              <button
                type="button"
                className="ms-2 text-[#ffb35c] underline"
                onClick={() => {
                  setIdx(i);
                  setReview(false);
                }}
              >
                עבור
              </button>
            </li>
          ))}
        </ul>
        {err && <p className="mt-3 text-[13px] text-[#ff7a45]">{err}</p>}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setReview(false)}
            className="rounded-full border border-[#2a211b] px-5 py-2.5 text-[13px] font-bold text-[#b9a89b]"
          >
            חזרה
          </button>
          <button
            type="button"
            disabled={loading || Object.keys(answers).length < questions.length}
            onClick={submit}
            className="flex-1 rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] py-2.5 text-[13px] font-bold text-[#1a0e08] disabled:opacity-40"
          >
            {loading ? "בודק…" : "שלח מבחן"}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) {
    return (
      <div className="py-16 text-center text-[#b9a89b]" dir="rtl">
        טוען שאלות…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl" dir="rtl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-[12px] text-[#ffb35c]">
          שאלה {idx + 1} מתוך {questions.length}
        </p>
        <Link href={courseHref(courseId)} className="text-[12px] text-[#6f6259]">
          יציאה
        </Link>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#16120f]">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#ff7a45] to-[#ffb35c] transition-all"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>
      <h2 className="text-xl font-extrabold leading-snug text-[#f5ede6]">{q.q}</h2>
      <div className="mt-6 space-y-2">
        {q.options.map((o) => {
          const selected = answers[q.id] === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
              className={`w-full rounded-2xl border px-4 py-3.5 text-start text-[15px] transition ${
                selected
                  ? "border-[#ffb35c] bg-[#ffb35c]/15 text-[#ffe0a8]"
                  : "border-[#2a211b] bg-[#16120f] text-[#f5ede6] hover:border-[#ff7a45]/40"
              }`}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => setIdx((i) => i - 1)}
          className="rounded-full border border-[#2a211b] px-5 py-2.5 text-[13px] font-bold text-[#b9a89b] disabled:opacity-30"
        >
          → הקודם
        </button>
        {idx < questions.length - 1 ? (
          <button
            type="button"
            disabled={!answers[q.id]}
            onClick={() => setIdx((i) => i + 1)}
            className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] disabled:opacity-40"
          >
            הבא ←
          </button>
        ) : (
          <button
            type="button"
            disabled={!answers[q.id]}
            onClick={() => setReview(true)}
            className="rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] px-5 py-2.5 text-[13px] font-bold text-[#1a0e08] disabled:opacity-40"
          >
            לסיכום
          </button>
        )}
      </div>
    </div>
  );
}
