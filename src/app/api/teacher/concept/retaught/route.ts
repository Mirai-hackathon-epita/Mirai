export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getStudents,
  getMastery,
  saveMastery,
  pushFeed,
  pushReprobe,
  addExercise,
  getActivity,
  saveActivity,
  getTopicMastery,
  getConceptGraph,
} from "@/lib/data/repo";
import { makeEvent } from "@/lib/agent/events";
import { genId, chatJSON, LLM_ENABLED, LLMUnavailableError } from "@/lib/llm/client";
import { EXERCISES } from "@/lib/seed/data";
import type {
  ActivityItem,
  ConceptMastery,
  Exercise,
  TopicMastery,
} from "@/lib/domain/types";

// ─── Deterministic probe exercise fallback ──────────────────────────
// When LLM is unavailable, generate a plausible probe from the seed pool
// (filtered to the concept) or from the first seed exercise.

async function buildProbeExercise(conceptId: string): Promise<Exercise> {
  // 1. Try LLM generation
  if (LLM_ENABLED) {
    try {
      const generated = await chatJSON<Exercise>(
        [
          {
            role: "system",
            content:
              "You are Mira, an AI math tutor. Generate a grade-7 fractions probe exercise. " +
              'Return JSON: { "id": string, "conceptId": string, "kind": "probe", ' +
              '"prompt": string, "expression": string, "difficulty": number, ' +
              '"answer": string, "steps": string[] }',
          },
          {
            role: "user",
            content:
              `Generate a difficulty-3 probe exercise for concept: ${conceptId}. ` +
              'id must start with "ex-probe-". difficulty 1-10. kind must be "probe".',
          },
        ],
        { temperature: 0.7, maxTokens: 500 },
      );
      const ex: Exercise = {
        ...generated,
        id: genId("ex-probe"),
        kind: "probe",
        conceptId,
      };
      await addExercise(ex);
      return ex;
    } catch (e) {
      if (!(e instanceof LLMUnavailableError)) throw e;
      // fall through to deterministic fallback
    }
  }

  // 2. Deterministic fallback: pick the first seed exercise for this concept,
  //    stamp a fresh id and kind="probe" so it surfaces as a new probe attempt.
  const seed =
    EXERCISES.find((ex) => ex.conceptId === conceptId) ?? EXERCISES[0];
  const probe: Exercise = {
    ...seed,
    id: genId("ex-probe"),
    kind: "probe",
    conceptId,
  };
  await addExercise(probe);
  return probe;
}

// ─── Re-taught mutation ──────────────────────────────────────────────

export interface RetaughtBody {
  conceptId: string;
}

export interface RetaughtResponse {
  topicMastery: TopicMastery[];
  activityItem: ActivityItem;
  studentsAffected: number;
}

/**
 * POST /api/teacher/concept/retaught
 *
 * Body: { conceptId: string }
 *
 * For every student:
 *  - Drop the concept mastery to "developing" (or "needs-work" if already
 *    needs-work) and lower the numeric mastery modestly.
 *  - Set weakLink=true on that concept entry.
 *  - Enqueue a fresh probe exercise for the concept.
 *  - Push a per-student FeedEvent (kind: "replan").
 *
 * Pushes one class ActivityItem describing the re-teach action.
 * Returns: updated topicMastery + the new activity item.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<RetaughtBody>;
    const conceptId = body?.conceptId?.trim();
    if (!conceptId) {
      return NextResponse.json(
        { error: "conceptId is required" },
        { status: 400 },
      );
    }

    // Validate concept exists in graph
    const graph = getConceptGraph();
    const concept = graph.concepts.find((c) => c.id === conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: `concept "${conceptId}" not found in active graph` },
        { status: 404 },
      );
    }
    const conceptLabel = concept.label;

    const students = await getStudents();
    if (students.length === 0) {
      return NextResponse.json(
        { error: "no students found" },
        { status: 404 },
      );
    }

    // Build one probe exercise to share across all students (same conceptId),
    // then stamp individual ids per student inside the loop.
    // Actually, we build one probe and reuse its content, giving each student
    // a copy with a unique id so their exercise queues are independent.
    const sharedProbe = await buildProbeExercise(conceptId);

    const now = Date.now();

    await Promise.all(
      students.map(async (student) => {
        // 1. Update mastery for this concept
        const mastery: ConceptMastery[] = await getMastery(student.id);
        const updated = mastery.map((cm): ConceptMastery => {
          if (cm.conceptId !== conceptId) return cm;
          // Drop numeric mastery by 20 points (floor at 0.05 so it isn't "not started")
          const newMastery = Math.max(0.05, cm.mastery - 0.2);
          // If already needs-work, keep it; otherwise drop to developing
          const newStatus =
            cm.status === "needs-work" ? "needs-work" : "developing";
          return {
            ...cm,
            mastery: parseFloat(newMastery.toFixed(3)),
            status: newStatus,
            weakLink: true,
          };
        });
        await saveMastery(student.id, updated);

        // 2. Enqueue the shared probe exercise for this student. We reuse the
        // single persisted `sharedProbe` (rather than creating a per-student
        // copy via addExercise inside this Promise.all) because addExercise is
        // a non-atomic read-modify-write on the shared exercises list — running
        // it concurrently here races and loses entries. The re-probe queue is
        // already per-student, so sharing one probe id is correct and safe.
        await pushReprobe(student.id, sharedProbe.id);

        // 3. Push a per-student feed event
        const event = makeEvent(
          student.id,
          "replan",
          `Concept re-taught by teacher → Mira is re-probing "${conceptLabel}" for you.`,
        );
        await pushFeed(event);
      }),
    );

    // 4. Push one class-level activity item
    const timeLabel = new Date(now).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const activityItem: ActivityItem = {
      id: genId("act"),
      time: timeLabel,
      text: `**Mira** re-probing **${students.length}** students on **${conceptLabel}** after re-teach.`,
    };
    const existingActivity = await getActivity();
    await saveActivity([activityItem, ...existingActivity]);

    // 5. Return current topic mastery + the new activity item
    const topicMastery = await getTopicMastery();

    const resp: RetaughtResponse = {
      topicMastery,
      activityItem,
      studentsAffected: students.length,
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[concept/retaught]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
