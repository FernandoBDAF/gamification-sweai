export type TopicStatus = "locked" | "available" | "completed";

export interface ProgressState {
  completed: Record<string, boolean>; // topicId -> completed
  reviewed?: Record<string, boolean>; // topicId -> reviewed
  notes?: Record<string, string>; // topicId -> personal note
  xp: number;
  level: number;
  lastActiveISO?: string; // for streaks
  streakDays?: number;
}

export const STORAGE_KEY = "ai-learning-graph-progress-v3";

export const initialProgress: ProgressState = {
  completed: {},
  reviewed: {},
  notes: {},
  xp: 0,
  level: 1,
  lastActiveISO: undefined,
  streakDays: 0,
};

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialProgress;
  } catch {
    return initialProgress;
  }
}

export function saveProgress(s: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function computeStatus(
  id: string,
  deps: string[],
  completed: Record<string, boolean>
): TopicStatus {
  if (completed[id]) return "completed";
  if (!deps || deps.length === 0) return "available";
  const allDepsMet = deps.every((d) => completed[d]);
  return allDepsMet ? "available" : "locked";
}

export function levelForXP(xp: number): number {
  return 1 + Math.floor(xp / 100); // 100 XP per level
}

export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 2.0; // Double XP for 30+ day streak
  if (streakDays >= 14) return 1.5; // 50% bonus for 2+ week streak
  if (streakDays >= 7) return 1.25; // 25% bonus for 1+ week streak
  if (streakDays >= 3) return 1.1; // 10% bonus for 3+ day streak
  return 1.0; // No bonus
}

export function awardXP(current: ProgressState, amount: number): ProgressState {
  const streakMultiplier = getStreakBonus(current.streakDays || 0);
  const bonusXP = Math.floor(amount * streakMultiplier);
  const newXP = Math.max(0, current.xp + bonusXP);
  const newLevel = levelForXP(newXP);
  return { ...current, xp: newXP, level: newLevel };
}

export function updateDailyStreak(
  state: ProgressState,
  now = new Date()
): ProgressState {
  const today = new Date(now.toDateString());
  const last = state.lastActiveISO ? new Date(state.lastActiveISO) : null;
  if (!last) {
    return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 };
  }
  const lastDay = new Date(last.toDateString());
  const diffDays = Math.round(
    (today.getTime() - lastDay.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return state; // already counted today
  if (diffDays === 1) {
    return {
      ...state,
      lastActiveISO: today.toISOString(),
      streakDays: (state.streakDays || 0) + 1,
    };
  }
  return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 }; // reset streak
}

export function clusterCompletion(
  completed: Record<string, boolean>,
  byCluster: Record<string, string[]>
): Record<string, { total: number; done: number; pct: number }> {
  const out: Record<string, { total: number; done: number; pct: number }> = {};
  for (const [cluster, topicIds] of Object.entries(byCluster)) {
    const total = topicIds.length;
    const done = topicIds.filter((id) => completed[id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    out[cluster] = { total, done, pct };
  }
  return out;
}

export function getStreakBonusText(streakDays: number): string {
  const bonus = getStreakBonus(streakDays);
  if (bonus === 1.0) return "";
  return `${Math.round((bonus - 1) * 100)}% streak bonus!`;
}
