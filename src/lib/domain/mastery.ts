import type { MasteryStatus, StudentStatus } from "./types";

// ─── Mastery thresholds & status mapping ────────────────────────────
// A concept turns "mastered" only above MASTERY_THRESHOLD — not on a single
// correct answer (see PLAN §5.6). These thresholds are the single source of
// truth used by the agent's belief update and by every UI status colour.

export const MASTERY_THRESHOLD = 0.8; // green at/above this
export const DEVELOPING_THRESHOLD = 0.5; // amber at/above this
export const NEEDS_WORK_FLOOR = 0.0; // terracotta below DEVELOPING

/** Map a 0..1 mastery to a status bucket. `attempts === 0` ⇒ not-started. */
export function masteryStatus(mastery: number, attempts = 1): MasteryStatus {
  if (attempts <= 0) return "not-started";
  if (mastery >= MASTERY_THRESHOLD) return "mastered";
  if (mastery >= DEVELOPING_THRESHOLD) return "developing";
  return "needs-work";
}

/** Roster-level status from overall mastery + whether the agent flagged them. */
export function studentStatus(
  overallMastery: number,
  flagged: boolean,
): StudentStatus {
  if (flagged) return "stuck";
  if (overallMastery >= 0.85) return "ahead";
  if (overallMastery < DEVELOPING_THRESHOLD) return "review";
  return "on-track";
}

/**
 * Belief update: revise a concept mastery from an exercise outcome.
 * A simple, named rule — exponential moving average toward 1 (correct) or 0
 * (wrong), weighted by exercise difficulty so harder evidence moves more.
 */
export function updateMastery(
  prior: number,
  correct: boolean,
  difficulty: number,
): number {
  const lr = Math.min(0.5, 0.05 * difficulty);
  const next = prior + lr * ((correct ? 1 : 0) - prior);
  return Number(next.toFixed(3));
}

export function pct(mastery: number): number {
  return Math.round(mastery * 100);
}
