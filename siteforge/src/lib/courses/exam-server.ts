import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { CourseId, ExamQuestion, RawExam } from "./types";

const SESSION = () => process.env.SESSION_SECRET || "dev-session-secret-change-me";
const CERT = () => process.env.CERT_SECRET || "dev-cert-secret-change-me";

export type ShuffledOption = { id: string; text: string };

export type ClientQuestion = {
  id: string;
  q: string;
  options: ShuffledOption[];
};

type AttemptPayload = {
  course: CourseId;
  exp: number;
  /** questionId → correct option opaque id */
  map: Record<string, string>;
  /** questionId → stage */
  stages: Record<string, string>;
  order: string[];
};

function b64url(buf: Buffer | string) {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: object, secret: string) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

function verify<T>(token: string, secret: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const got = fromB64url(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got))
    return null;
  try {
    return JSON.parse(fromB64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0]! % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function prepareExamAttempt(exam: RawExam): {
  questions: ClientQuestion[];
  attemptToken: string;
  title: string;
  passPercent: number;
  passMin: number;
} {
  let qs = [...exam.questions];
  if (exam.shuffle_questions) qs = shuffle(qs);

  const map: Record<string, string> = {};
  const stages: Record<string, string> = {};
  const order: string[] = [];
  const clientQs: ClientQuestion[] = [];

  for (const q of qs) {
    order.push(q.id);
    stages[q.id] = q.stage ?? "";
    const withIds = q.options.map((text, i) => ({
      id: b64url(randomBytes(8)),
      text,
      correct: i === q.answer,
    }));
    const shuffled = exam.shuffle_options ? shuffle(withIds) : withIds;
    const correct = shuffled.find((o) => o.correct)!;
    map[q.id] = correct.id;
    clientQs.push({
      id: q.id,
      q: q.q,
      options: shuffled.map(({ id, text }) => ({ id, text })),
    });
  }

  const payload: AttemptPayload = {
    course: exam.course,
    exp: Date.now() + 2 * 60 * 60 * 1000,
    map,
    stages,
    order,
  };

  return {
    questions: clientQs,
    attemptToken: sign(payload, SESSION()),
    title: exam.title,
    passPercent: exam.pass_percent,
    passMin: exam.pass_min_correct,
  };
}

export function gradeExam(
  courseId: CourseId,
  attemptToken: string,
  answers: Record<string, string>,
  name: string,
  exam: RawExam,
): {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  percent: number;
  wrongStages: string[];
  certId?: string;
  certToken?: string;
} {
  const payload = verify<AttemptPayload>(attemptToken, SESSION());
  if (!payload || payload.course !== courseId || payload.exp < Date.now()) {
    throw new Error("attempt_expired");
  }

  let correct = 0;
  const wrongStages: string[] = [];
  for (const qid of payload.order) {
    const expected = payload.map[qid];
    const got = answers[qid];
    if (expected && got && expected === got) correct++;
    else if (payload.stages[qid]) wrongStages.push(payload.stages[qid]!);
  }

  const total = payload.order.length || exam.question_count;
  const percent = Math.round((correct / total) * 100);
  const passed = correct >= exam.pass_min_correct;

  const result: ReturnType<typeof gradeExam> = {
    score: correct,
    correct,
    total,
    passed,
    percent,
    wrongStages: [...new Set(wrongStages)],
  };

  if (passed) {
    const safeName = name.trim().slice(0, 40) || "תלמיד SiteForge";
    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());
    const rand = b64url(randomBytes(6)).slice(0, 8).toUpperCase();
    const material = `${courseId}|${safeName}|${date}|${rand}`;
    const digest = createHmac("sha256", CERT()).update(material).digest();
    const certId = `SF-${courseId.toUpperCase()}-${new Date().getFullYear()}-${b64url(digest).slice(0, 8).toUpperCase()}`;
    const certToken = sign(
      {
        id: certId,
        n: safeName,
        c: courseId,
        d: date,
        s: percent,
        correct,
        total,
      },
      CERT(),
    );
    result.certId = certId;
    result.certToken = certToken;
  }

  return result;
}

export function verifyCertToken(token: string) {
  return verify<{
    id: string;
    n: string;
    c: CourseId;
    d: string;
    s: number;
    correct?: number;
    total?: number;
  }>(token, CERT());
}

/** type guard unused questions */
export type _Q = ExamQuestion;
