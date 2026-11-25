import { REWARD_CATALOG, canAfford, type RewardItem } from "./rewards";

const KEY = "siteforge-progress-v1";

/**
 * Dev mode: all stages open for building/review.
 * Flip to `false` before shipping gated progression.
 */
export const DEV_UNLOCK_ALL = true;

/** Stage ids that award a medal when completed (every 10). */
export const MEDAL_STAGE_IDS = [
  "S010",
  "S020",
  "S030",
  "S040",
  "S050",
  "S060",
  "S070",
  "S080",
  "S090",
  "S100",
] as const;

export type ProgressState = {
  /** Highest unlocked stage id (inclusive). */
  unlockedThrough: string;
  completed: Record<string, { percent: number; at: string }>;
  streak: number;
  /** In-course currency — unlocks animation packs (not real money). */
  coins: number;
  /** Animation / kit reward ids unlocked with coins + medals. */
  unlockedRewards: string[];
  lastActiveDay?: string;
};

const DEFAULT: ProgressState = {
  unlockedThrough: DEV_UNLOCK_ALL ? "S100" : "S001",
  completed: {},
  streak: 0,
  coins: DEV_UNLOCK_ALL ? 200 : 0,
  unlockedRewards: [],
};

function stageNum(id: string): number {
  return Number(id.replace(/\D/g, "")) || 0;
}

export function stageIdFromNum(n: number): string {
  return `S${String(n).padStart(3, "0")}`;
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const state: ProgressState = {
      ...DEFAULT,
      ...parsed,
      unlockedRewards: Array.isArray(parsed.unlockedRewards)
        ? parsed.unlockedRewards
        : [],
    };
    // Keep everything open while building the curriculum
    if (DEV_UNLOCK_ALL && stageNum(state.unlockedThrough) < 100) {
      state.unlockedThrough = "S100";
    }
    return state;
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isUnlocked(progress: ProgressState, stageId: string): boolean {
  if (DEV_UNLOCK_ALL) return true;
  return stageNum(stageId) <= stageNum(progress.unlockedThrough);
}

export function isCompleted(progress: ProgressState, stageId: string): boolean {
  return Boolean(progress.completed[stageId]);
}

export function isCurrent(progress: ProgressState, stageId: string): boolean {
  if (DEV_UNLOCK_ALL) {
    // Highlight the first incomplete stage while browsing open curriculum
    for (let n = 1; n <= 100; n++) {
      const id = stageIdFromNum(n);
      if (!progress.completed[id]) return stageId === id;
    }
    return stageId === "S100";
  }
  return stageId === progress.unlockedThrough && !progress.completed[stageId];
}

/** How many medal checkpoints the learner has finished. */
export function medalsEarned(progress: ProgressState): number {
  return MEDAL_STAGE_IDS.filter((id) => isCompleted(progress, id)).length;
}

/** Mark quiz passed → unlock next stage, award coins (+ medal bonus). */
export function completeStage(
  progress: ProgressState,
  stageId: string,
  percent: number,
  totalStages = 100,
): ProgressState {
  if (isCompleted(progress, stageId)) return progress;

  const today = new Date().toISOString().slice(0, 10);
  let streak = progress.streak;
  if (progress.lastActiveDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = progress.lastActiveDay === yesterday ? streak + 1 : 1;
  }

  const nextNum = Math.min(totalStages, stageNum(stageId) + 1);
  const nextId = stageIdFromNum(nextNum);
  const unlockedThrough =
    stageNum(nextId) > stageNum(progress.unlockedThrough)
      ? nextId
      : progress.unlockedThrough;

  const isMedal = (MEDAL_STAGE_IDS as readonly string[]).includes(stageId);
  const coinGain = 10 + Math.floor(percent / 10) + (isMedal ? 50 : 0);

  return {
    ...progress,
    unlockedThrough,
    completed: {
      ...progress.completed,
      [stageId]: { percent, at: new Date().toISOString() },
    },
    streak,
    coins: progress.coins + coinGain,
    lastActiveDay: today,
  };
}

/** Spend coins (+ medal gate) to unlock an animation pack. */
export function redeemReward(
  progress: ProgressState,
  item: RewardItem,
): { ok: true; state: ProgressState } | { ok: false; reason: string } {
  const owned = progress.unlockedRewards.includes(item.id);
  const check = canAfford(
    progress.coins,
    medalsEarned(progress),
    item,
    owned,
  );
  if (!check.ok) return { ok: false, reason: check.reason ?? "לא ניתן" };

  return {
    ok: true,
    state: {
      ...progress,
      coins: progress.coins - item.coinCost,
      unlockedRewards: [...progress.unlockedRewards, item.id],
    },
  };
}

export function completedCount(progress: ProgressState): number {
  return Object.keys(progress.completed).length;
}

export function catalogForUi() {
  return REWARD_CATALOG;
}
