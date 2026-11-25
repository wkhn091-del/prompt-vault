export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

/** Parse American-style quiz from a stage "## מבחן שער" section body. */
export function parseQuiz(sectionBody: string): QuizQuestion[] {
  if (!sectionBody.trim()) return [];
  const chunks = sectionBody.split(/###\s*שאלה\s*\d+/).slice(1);
  const questions: QuizQuestion[] = [];

  chunks.forEach((chunk, i) => {
    const answerMatch =
      chunk.match(/\*\*תשובה נכונה:\*\*\s*([אבגדה1-8]|א|ב|ג|ד)/) ||
      chunk.match(/תשובה נכונה:\s*\*?\*?([אבגדה1-8])/);
    const explMatch = chunk.match(/\*\*הסבר:\*\*\s*([^\n]+)/);

    let answerIndex = 0;
    if (answerMatch) {
      const a = answerMatch[1];
      const hebrew: Record<string, number> = { א: 0, ב: 1, ג: 2, ד: 3, ה: 4 };
      if (a in hebrew) answerIndex = hebrew[a];
      else answerIndex = Math.max(0, Number(a) - 1);
    }

    const beforeAnswer = chunk.split(/\*\*תשובה נכונה:\*\*|תשובה נכונה:/)[0] ?? chunk;
    const lines = beforeAnswer
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const choices: string[] = [];
    const promptLines: string[] = [];
    for (const line of lines) {
      const num = line.match(/^(?:[-*]\s*)?(?:\*\*)?([1-8]|[אבגד])(?:\*\*)?[.)]\s*(.+)$/);
      const bullet = line.match(/^[-*]\s+(?:א\)|ב\)|ג\)|ד\)|\*\*[אבגד]\*\*)\s*(.+)$/);
      if (num) {
        choices.push(num[2].trim());
      } else if (bullet) {
        choices.push(bullet[1].trim());
      } else if (/^(?:א|ב|ג|ד)[).]/.test(line) || /^[1-8][.)]/.test(line)) {
        choices.push(line.replace(/^[אבגד1-8][.)]\s*/, "").trim());
      } else if (!line.startsWith("ציון") && !line.startsWith("מבחן")) {
        promptLines.push(line.replace(/\*\*/g, ""));
      }
    }

    if (choices.length >= 2) {
      questions.push({
        id: `q${i + 1}`,
        prompt: promptLines.join(" ").trim() || `שאלה ${i + 1}`,
        choices,
        answerIndex: Math.min(answerIndex, choices.length - 1),
        explanation: explMatch?.[1]?.trim(),
      });
    }
  });

  return questions;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number>,
): { correct: number; total: number; percent: number } {
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.answerIndex) correct += 1;
  }
  const total = questions.length || 1;
  return { correct, total, percent: Math.round((correct / total) * 100) };
}
