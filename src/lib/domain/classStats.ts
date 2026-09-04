import { MASTERY_THRESHOLD, DEVELOPING_THRESHOLD, pct } from "./mastery";
import type {
  ClassStats,
  ConceptGraph,
  ConceptMastery,
  Student,
  TopicMastery,
} from "./types";

// ─── Class-level aggregation ────────────────────────────────────────
// Pure functions over the fleet's real state. The dashboard used to serve
// frozen seed numbers, so nothing moved when a student actually worked —
// everything here is derived from live mastery instead.

/** Per-student concept mastery, keyed by student id. */
export type MasteryByStudent = Record<string, ConceptMastery[]>;

export function computeClassStats(
  students: Student[],
  baselineAvgMastery: number,
): ClassStats {
  const avgMastery =
    students.length > 0
      ? students.reduce((sum, s) => sum + s.overallMastery, 0) / students.length
      : 0;

  return {
    avgMastery,
    // Points moved since the baseline snapshot taken when the class started.
    avgMasteryDelta: Math.round((avgMastery - baselineAvgMastery) * 100),
    needsAttention: students.filter((s) => s.flag != null).length,
  };
}

/**
 * Class mastery per concept of the published course, weakest first — that is
 * the order a teacher acts on when planning a tutorial. Concepts nobody has
 * attempted are left out. Each row carries its `conceptId` so "mark re-taught"
 * targets a real concept rather than a slug of the label.
 */
export function computeTopicMastery(
  graph: ConceptGraph,
  masteryByStudent: MasteryByStudent,
  limit = 6,
): TopicMastery[] {
  const rows: TopicMastery[] = [];

  for (const concept of graph.concepts) {
    let total = 0;
    let attemptedBy = 0;
    for (const list of Object.values(masteryByStudent)) {
      const cm = list.find((m) => m.conceptId === concept.id);
      if (cm && cm.attempts > 0) {
        total += cm.mastery;
        attemptedBy += 1;
      }
    }
    if (attemptedBy === 0) continue;
    rows.push({
      topic: concept.label,
      conceptId: concept.id,
      mastery: total / attemptedBy,
    });
  }

  return rows.sort((a, b) => a.mastery - b.mastery).slice(0, limit);
}

/** The concept blocking the most students, if any is blocking at all. */
export function weakestConcept(
  graph: ConceptGraph,
  masteryByStudent: MasteryByStudent,
): { conceptId: string; label: string; blocked: number; mastery: number } | null {
  let worst: {
    conceptId: string;
    label: string;
    blocked: number;
    mastery: number;
  } | null = null;

  for (const concept of graph.concepts) {
    let total = 0;
    let attemptedBy = 0;
    let blocked = 0;
    for (const list of Object.values(masteryByStudent)) {
      const cm = list.find((m) => m.conceptId === concept.id);
      if (!cm || cm.attempts === 0) continue;
      total += cm.mastery;
      attemptedBy += 1;
      if (cm.mastery < MASTERY_THRESHOLD) blocked += 1;
    }
    if (attemptedBy === 0 || blocked === 0) continue;

    const candidate = {
      conceptId: concept.id,
      label: concept.label,
      blocked,
      mastery: total / attemptedBy,
    };
    // Most students blocked wins; ties break on the lower class mastery.
    if (
      !worst ||
      candidate.blocked > worst.blocked ||
      (candidate.blocked === worst.blocked && candidate.mastery < worst.mastery)
    ) {
      worst = candidate;
    }
  }

  return worst;
}

/**
 * Deterministic class insight, computed from the same numbers the dashboard
 * shows. Used as-is when the LLM is offline, and as grounding when it is not.
 */
export function computeInsight(
  graph: ConceptGraph,
  students: Student[],
  masteryByStudent: MasteryByStudent,
): string {
  if (students.length === 0) return "No students enrolled yet.";

  const worst = weakestConcept(graph, masteryByStudent);
  if (!worst) {
    return `The class is on top of ${graph.topic} — every attempted concept is at or above the mastery threshold.`;
  }

  const share = Math.round((worst.blocked / students.length) * 100);
  const flagged = students.filter((s) => s.flag != null).length;
  const flagNote =
    flagged > 0
      ? ` ${flagged} student${flagged === 1 ? " is" : "s are"} flagged for a pull-aside.`
      : "";

  return `${share}% of the class is below the mastery threshold on ${worst.label} (class average ${pct(worst.mastery)}%). Re-teach that step first in tutorial.${flagNote}`;
}

/** Students the teacher should look at first: flagged, then weakest. */
export function studentsNeedingAttention(students: Student[]): Student[] {
  return students
    .filter((s) => s.flag != null || s.overallMastery < DEVELOPING_THRESHOLD)
    .sort((a, b) => a.overallMastery - b.overallMastery);
}
