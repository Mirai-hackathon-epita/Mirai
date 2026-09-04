import "server-only";
import {
  getStudents,
  getMastery,
  getActiveConceptGraph,
  getOrSetClassBaseline,
} from "@/lib/data/repo";
import {
  computeClassStats,
  computeInsight,
  computeTopicMastery,
  weakestConcept,
  type MasteryByStudent,
} from "@/lib/domain/classStats";
import { pct } from "@/lib/domain/mastery";
import { chat, LLM_ENABLED, LLMUnavailableError } from "@/lib/llm/client";
import type {
  ClassStats,
  ConceptGraph,
  Student,
  TopicMastery,
} from "@/lib/domain/types";

// ─── Class snapshot ─────────────────────────────────────────────────
// One derivation of the class's real state, shared by the dashboard and the
// "ask Mirai" route so both answer from the same numbers. The dashboard used
// to serve seeded constants, which never moved when a student worked.

export interface ClassSnapshot {
  students: Student[];
  masteryByStudent: MasteryByStudent;
  graph: ConceptGraph;
  classStats: ClassStats;
  topicMastery: TopicMastery[];
  /** Deterministic, always available — the grounding for the LLM insight. */
  computedInsight: string;
}

export async function getClassSnapshot(): Promise<ClassSnapshot> {
  const [students, graph] = await Promise.all([
    getStudents(),
    getActiveConceptGraph(),
  ]);

  const lists = await Promise.all(students.map((s) => getMastery(s.id)));
  const masteryByStudent: MasteryByStudent = Object.fromEntries(
    students.map((s, i) => [s.id, lists[i]]),
  );

  const avg =
    students.length > 0
      ? students.reduce((sum, s) => sum + s.overallMastery, 0) / students.length
      : 0;
  const baseline = await getOrSetClassBaseline(avg);

  return {
    students,
    masteryByStudent,
    graph,
    classStats: computeClassStats(students, baseline),
    topicMastery: computeTopicMastery(graph, masteryByStudent),
    computedInsight: computeInsight(graph, students, masteryByStudent),
  };
}

/** A compact, factual summary of the class — grounding for any LLM call. */
export function describeClass(snapshot: ClassSnapshot): string {
  const { students, classStats, topicMastery, graph, masteryByStudent } =
    snapshot;

  const flagged = students
    .filter((s) => s.flag != null)
    .map(
      (s) =>
        `- ${s.name} (${pct(s.overallMastery)}% overall, working on ${s.currentConceptId}): ${s.flag!.detail}`,
    );

  const worst = weakestConcept(graph, masteryByStudent);

  return [
    `Course: ${graph.topic} (${graph.concepts.length} concepts).`,
    `Class: ${students.length} students, average mastery ${pct(classStats.avgMastery)}% (${classStats.avgMasteryDelta >= 0 ? "+" : ""}${classStats.avgMasteryDelta} pts since the start), ${classStats.needsAttention} needing attention.`,
    topicMastery.length > 0
      ? `Weakest concepts: ${topicMastery.map((t) => `${t.topic} ${pct(t.mastery)}%`).join(", ")}.`
      : "No concept has been attempted yet.",
    worst
      ? `Blocking the most students: ${worst.label} (${worst.blocked} of ${students.length} below the threshold).`
      : "",
    flagged.length > 0 ? `Flagged:\n${flagged.join("\n")}` : "No students flagged.",
  ]
    .filter(Boolean)
    .join("\n");
}

// The dashboard polls, so the LLM insight is cached: one call per window
// rather than one per poll.
const INSIGHT_TTL_MS = 60_000;
let insightCache: { text: string; at: number; key: string } | null = null;

/**
 * One-sentence class insight. Falls back to the deterministic computation
 * whenever the LLM is offline or failing, so this never blocks the dashboard.
 */
export async function getClassInsight(
  snapshot: ClassSnapshot,
): Promise<string> {
  // Cache key includes the numbers, so a real change refreshes immediately.
  const key = `${snapshot.students.length}:${snapshot.classStats.needsAttention}:${pct(snapshot.classStats.avgMastery)}:${snapshot.topicMastery.map((t) => `${t.conceptId}${pct(t.mastery)}`).join(",")}`;

  if (
    insightCache &&
    insightCache.key === key &&
    Date.now() - insightCache.at < INSIGHT_TTL_MS
  ) {
    return insightCache.text;
  }

  if (!LLM_ENABLED) return snapshot.computedInsight;

  try {
    const text = await chat(
      [
        {
          role: "system",
          content:
            "You are Mirai, an autonomous AI tutor supervising a class. Given the class state, write ONE sentence a teacher can act on in their next tutorial. Name the blocking concept and the concrete move. No preamble, no bullet points.",
        },
        {
          role: "user",
          content: `${describeClass(snapshot)}\n\nDeterministic reading: ${snapshot.computedInsight}`,
        },
      ],
      { temperature: 0.3, maxTokens: 160 },
    );
    const insight = text.trim() || snapshot.computedInsight;
    insightCache = { text: insight, at: Date.now(), key };
    return insight;
  } catch (e) {
    if (!(e instanceof LLMUnavailableError)) throw e;
    return snapshot.computedInsight;
  }
}

/** Test seam: drop the memoised insight. */
export function resetInsightCache(): void {
  insightCache = null;
}
