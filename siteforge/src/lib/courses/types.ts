/** Raw course JSON from content/courses/*.json (ZIP source of truth). */

export type CourseId = "sites" | "agents";

export type ScriptCard = {
  id: string;
  text: string;
  note?: string;
};

export type RawStage = {
  id: string;
  slug: string;
  n: number | string;
  title: string;
  module: string;
  bonus: boolean;
  unlocks_after?: string;
  goal?: string;
  body_md: string;
  scripts: ScriptCard[];
};

export type RawMedal = {
  id: string;
  module: string;
  emoji: string;
  name: string;
  icon: string;
  tier: number;
  earned_at: string;
};

export type RawModule = {
  id: string;
  title: string;
  lead?: string;
  week?: string;
  reward?: string;
  intro_md: string;
  medal: string;
  medal_stage: string;
  stages: string[];
};

export type RawCourse = {
  id: CourseId;
  title: string;
  version: string;
  lang: string;
  dir: string;
  source: Record<string, string | undefined>;
  scripts_gate?: { stage: string; text: string };
  final_gate?: { stage: string; text: string };
  final_exam: {
    id: string;
    file: string;
    after: string;
    questions: number;
    pass_percent: number;
    certificate: boolean;
    title: string;
  };
  modules: RawModule[];
  medals: RawMedal[];
  stages: RawStage[];
};

export type ExamQuestion = {
  id: string;
  stage?: string;
  module?: string;
  q: string;
  options: string[];
  /** 0-based index BEFORE shuffle — never send to client as-is */
  answer: number;
};

export type RawExam = {
  course: CourseId;
  id: string;
  title: string;
  pass_percent: number;
  pass_min_correct: number;
  question_count: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  retries: string;
  questions: ExamQuestion[];
};

export type CourseProgress = {
  courseId: CourseId;
  /** Completed core stage ids */
  completed: string[];
  current: string;
  examPassed?: boolean;
  examScore?: number;
  examPercent?: number;
  certificateId?: string;
  studentName?: string;
};
