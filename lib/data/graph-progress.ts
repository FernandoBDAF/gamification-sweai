// lib/data/graph-progress.ts
import { TopicStatus } from "@/lib/types";
import type { TopicNode } from "./graph-types";

// --- Utility helpers ---
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!res) return null;
  return {
    r: parseInt(res[1], 16),
    g: parseInt(res[2], 16),
    b: parseInt(res[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColors(
  rgb: { r: number; g: number; b: number },
  whitePct: number
): { r: number; g: number; b: number } {
  const w = clamp(whitePct, 0, 1);
  return {
    r: rgb.r * (1 - w) + 255 * w,
    g: rgb.g * (1 - w) + 255 * w,
    b: rgb.b * (1 - w) + 255 * w,
  };
}

function relativeLuminance({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): number {
  const srgb = [r, g, b].map((v) => v / 255);
  const linear = srgb.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(hex1: string, hex2: string): number {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  if (!a || !b) return 1;
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// --- Progress state & XP/streak ---
export interface ProgressState {
  completed: Record<string, boolean>;
  reviewed?: Record<string, boolean>;
  notes?: Record<string, string>;
  xp: number;
  level: number;
  lastActiveISO?: string;
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

export function levelForXP(xp: number): number {
  return 1 + Math.floor(xp / 100);
}

export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1.0;
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
  if (!last)
    return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 };
  const lastDay = new Date(last.toDateString());
  const diffDays = Math.round(
    (today.getTime() - lastDay.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return state;
  if (diffDays === 1) {
    return {
      ...state,
      lastActiveISO: today.toISOString(),
      streakDays: (state.streakDays || 0) + 1,
    };
  }
  return { ...state, lastActiveISO: today.toISOString(), streakDays: 1 };
}

export function getStreakBonusText(streakDays: number): string {
  const bonus = getStreakBonus(streakDays);
  if (bonus === 1.0) return "";
  return `${Math.round((bonus - 1) * 100)}% streak bonus!`;
}

// --- Color scale ---
/**
 * Returns a color interpolated from a light inactive version of baseHex to the baseHex itself as pct increases.
 * Ensures approximate AA contrast by nudging toward lighter/darker.
 */
export function progressToColor(baseHex: string, pct: number): string {
  const base = hexToRgb(baseHex) || { r: 59, g: 130, b: 246 };
  const t = clamp(pct, 0, 100) / 100;
  const inactiveMixPct = 0.75;
  const activeMixPct = 0.1;
  const mixPct = inactiveMixPct * (1 - t) + activeMixPct * t;
  const mixed = mixColors(base, mixPct);
  let out = rgbToHex(mixed.r, mixed.g, mixed.b);
  const black = "#000000";
  const white = "#FFFFFF";
  const crWhite = contrastRatio(out, white);
  const crBlack = contrastRatio(out, black);
  if (Math.max(crWhite, crBlack) < 4.5) {
    const targetWhite = crWhite > crBlack;
    const rgb = hexToRgb(out)!;
    const factor = targetWhite ? 0.9 : 1.1;
    out = rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
  }
  return out;
}

// --- Status & unlocks ---
export const NODE_UNLOCK_THRESHOLD = 1.0;
export const CLUSTER_UNLOCK_THRESHOLD = 1.0;

/** Backward-compatible signature: (id, deps, completed) */
export function computeStatus(
  id: string,
  deps: string[],
  completed: Record<string, boolean>,
  depsThreshold: number = NODE_UNLOCK_THRESHOLD,
  clusterLocked: boolean = false
): TopicStatus {
  if (completed[id]) return "completed";
  if (clusterLocked) return "locked";
  if (!deps || deps.length === 0) return "available";
  const total = deps.length;
  const met = deps.filter((d) => completed[d]).length;
  const pct = total === 0 ? 1 : met / total;
  return pct >= depsThreshold ? "available" : "locked";
}

export function clusterCompletion(
  completed: Record<string, boolean>,
  byCluster: Record<string, string[]>
): Record<string, { total: number; done: number; pct: number }> {
  const out: Record<string, { total: number; done: number; pct: number }> = {};
  for (const [cluster, ids] of Object.entries(byCluster)) {
    const total = ids.length;
    const done = ids.filter((id) => completed[id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    out[cluster] = { total, done, pct };
  }
  return out;
}

export function isNodeUnlockedByThreshold(
  deps: string[],
  completed: Record<string, boolean>,
  thresholdPct: number
): boolean {
  if (!deps || deps.length === 0) return true;
  const total = deps.length;
  const met = deps.filter((d) => completed[d]).length;
  const pct = total === 0 ? 100 : (met / total) * 100;
  return pct >= thresholdPct;
}

// Convenience overload to accept node-like input
export function isNodeUnlockedByThresholdNode(
  node: { deps: string[] },
  completed: Record<string, boolean>,
  thresholdPct: number
): boolean {
  return isNodeUnlockedByThreshold(node.deps || [], completed, thresholdPct);
}

// Backward-compatible wrapper that accepts a TopicNode as first arg
export function isNodeUnlockedByThresholdForNode(
  node: TopicNode,
  completed: Record<string, boolean>,
  thresholdPct: number
): boolean {
  return isNodeUnlockedByThreshold(node.deps || [], completed, thresholdPct);
}

export function isClusterUnlocked(
  clusterId: string,
  nodes: Array<{ id: string; cluster: string; deps: string[] }>,
  completed: Record<string, boolean>,
  thresholdPct: number = 100
): boolean {
  const prereq = new Set<string>();
  nodes.forEach((n) => {
    if (n.cluster !== clusterId) return;
    (n.deps || []).forEach((depId) => {
      const dep = nodes.find((x) => x.id === depId);
      if (dep && dep.cluster !== clusterId) prereq.add(dep.cluster);
    });
  });
  if (prereq.size === 0) return true;
  const byCluster: Record<string, string[]> = {};
  nodes.forEach(
    (n) => (byCluster[n.cluster] = (byCluster[n.cluster] || []).concat(n.id))
  );
  const pctByCluster: Record<string, number> = {};
  Object.entries(byCluster).forEach(([cid, ids]) => {
    const total = ids.length;
    const done = ids.filter((id) => completed[id]).length;
    pctByCluster[cid] = total ? Math.round((done / total) * 100) : 0;
  });
  return Array.from(prereq).every(
    (cid) => (pctByCluster[cid] || 0) >= thresholdPct
  );
}
