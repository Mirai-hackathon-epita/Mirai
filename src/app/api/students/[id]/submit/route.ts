export const dynamic = "force-dynamic";

// ─── Agentic submit loop ─────────────────────────────────────────────
// This IS the centrepiece of the demo.
// plan → grade → update mastery → diagnose misconception → escalate → pre-generate next
// Every step emits a FeedEvent so the teacher can observe the reasoning trace.

import { NextRequest, NextResponse } from "next/server";
import {
  getStudent,
  saveStudent,
  getMastery,
  saveMastery,
  getExerciseById,
  getMisconceptions,
  saveMisconceptions,
  pushFeed,
  pushSubmission,
  getSubmissions,
} from "@/lib/data/repo";
import {
  chatJSON,
  LLM_ENABLED,
  LLMUnavailableError,
  genId,
} from "@/lib/llm/client";
import { updateMastery, masteryStatus, pct } from "@/lib/domain/mastery";
import { makeEvent } from "@/lib/agent/events";
import { getNextExercise } from "@/lib/agent/exercise";
import { EXERCISES, MISCONCEPTIONS } from "@/lib/seed/data";
import type {
  GradeResult,
  Diagnosis,
  ConceptMastery,
  SubmitResponse,
} from "@/lib/domain/types";

interface SubmitBody {
  exerciseId: string;
  answer: string;
  viaOcr?: boolean;
}

interface LLMGradeResult {
  correct: boolean;
  readBack: string;
  steps: Array<{ step: string; ok: boolean; note?: string }>;
  failingStepIndex: number | null;
  tutorMessage: string;
  nextDifficulty: number;
  masteryDelta: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = (await req.json()) as SubmitBody;
    const { exerciseId, answer, viaOcr = false } = body;

    if (!exerciseId || !answer) {
      return NextResponse.json(
        { error: "exerciseId and answer required" },
        { status: 400 },
      );
    }

    const [student, masteryList] = await Promise.all([
      getStudent(id),
      getMastery(id),
    ]);

    if (!student) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
    }

    // Resolve the exercise (fall back to seed if not found)
    const exercise =
      (await getExerciseById(exerciseId)) ?? EXERCISES[0];
    const conceptId = exercise?.conceptId ?? student.currentConceptId;

    // ── PLAN EVENT ───────────────────────────────────────────────────
    const planText = `Received ${viaOcr ? "OCR-scanned" : "text"} submission for exercise ${exerciseId} (concept: ${conceptId}). Running: grade → update mastery → diagnose → escalate → pre-generate next.`;
    const planEvent = makeEvent(id, "plan", planText);
    await pushFeed(planEvent);
    const newEvents = [planEvent];

    // ── STEP 1 — GRADE ───────────────────────────────────────────────
    let grade: GradeResult;

    if (LLM_ENABLED) {
      try {
        const llmGrade = await chatJSON<LLMGradeResult>(
          [
            {
              role: "system",
              content: `You are Mirai, grading a grade-7 student's math answer. Return JSON:
{ "correct": boolean, "readBack": string, "steps": [{"step": string, "ok": boolean, "note": string}], "failingStepIndex": number|null, "tutorMessage": string, "nextDifficulty": number, "masteryDelta": number }
masteryDelta must be between -0.15 and 0.2. nextDifficulty between 1 and 10.`,
            },
            {
              role: "user",
              content: `Exercise: ${exercise.expression}\nExpected answer: ${exercise.answer}\nExpected steps: ${exercise.steps.join(" → ")}\nStudent's answer: "${answer}"`,
            },
          ],
          { temperature: 0.2, maxTokens: 600 },
        );

        grade = {
          correct: llmGrade.correct,
          readBack: llmGrade.readBack ?? answer,
          steps: (llmGrade.steps ?? []).map((s) => ({
            step: s.step,
            ok: s.ok,
            note: s.note,
          })),
          failingStepIndex: llmGrade.failingStepIndex ?? null,
          tutorMessage: llmGrade.tutorMessage ?? "",
          nextDifficulty: llmGrade.nextDifficulty ?? exercise.difficulty,
          masteryDelta: Math.max(
            -0.15,
            Math.min(0.2, llmGrade.masteryDelta ?? 0),
          ),
        };
      } catch (e) {
        if (!(e instanceof LLMUnavailableError)) throw e;
        grade = fallbackGrade(answer, exercise.answer);
      }
    } else {
      grade = fallbackGrade(answer, exercise.answer);
    }

    const gradeEvent = makeEvent(
      id,
      "grade",
      `Graded answer "${answer.slice(0, 40)}" — ${grade.correct ? "correct ✓" : "incorrect ✗"}. Tutor: "${grade.tutorMessage.slice(0, 80)}"`,
    );
    await pushFeed(gradeEvent);
    newEvents.push(gradeEvent);

    // Record submission
    await pushSubmission({
      id: genId("sub"),
      studentId: id,
      exerciseId,
      conceptId,
      answer,
      correct: grade.correct,
      ts: Date.now(),
    });

    // ── STEP 2 — UPDATE MASTERY ──────────────────────────────────────
    const updatedMastery: ConceptMastery[] = masteryList.map((m) => {
      if (m.conceptId !== conceptId) return m;
      const newMastery = updateMastery(m.mastery, grade.correct, exercise.difficulty);
      return {
        ...m,
        mastery: newMastery,
        attempts: m.attempts + 1,
        status: masteryStatus(newMastery, m.attempts + 1),
      };
    });

    // If concept wasn't in the list yet, add it
    if (!updatedMastery.find((m) => m.conceptId === conceptId)) {
      const newMastery = updateMastery(0, grade.correct, exercise.difficulty);
      updatedMastery.push({
        conceptId,
        mastery: newMastery,
        attempts: 1,
        status: masteryStatus(newMastery, 1),
      });
    }

    await saveMastery(id, updatedMastery);

    // Recompute overall mastery as the mean of all attempted concepts
    const attempted = updatedMastery.filter((m) => m.attempts > 0);
    const overallMastery =
      attempted.length > 0
        ? attempted.reduce((sum, m) => sum + m.mastery, 0) / attempted.length
        : student.overallMastery;

    const reflectEvent = makeEvent(
      id,
      "reflect",
      `Updated mastery for ${conceptId}: ${pct(updatedMastery.find((m) => m.conceptId === conceptId)?.mastery ?? 0)}% (delta ${grade.masteryDelta >= 0 ? "+" : ""}${(grade.masteryDelta * 100).toFixed(0)}%). Overall: ${pct(overallMastery)}%.`,
    );
    await pushFeed(reflectEvent);
    newEvents.push(reflectEvent);

    // ── STEP 3 — DIAGNOSE MISCONCEPTION ─────────────────────────────
    let diagnosis: Diagnosis | null = null;

    if (!grade.correct) {
      const misconceptions = await getMisconceptions();
      const answerLower = answer.toLowerCase().replace(/\s/g, "");

      // Pattern match against known misconceptions
      const matched = misconceptions.find((m) => {
        // "adds across" heuristic: numerator sum / denominator sum pattern
        if (m.id === "misc-add-across") {
          // e.g. ¾ + ⅙: wrong answer would be (3+1)/(4+6) = 4/10 or 2/5
          return answerLower.includes("4/10") || answerLower.includes("2/5");
        }
        // Signature keyword match
        return m.signature
          .split(" ")
          .some((word) => word.length > 3 && answerLower.includes(word.toLowerCase()));
      });

      if (matched) {
        // Known misconception — no probe needed
        matched.seenCount += 1;
        await saveMisconceptions(misconceptions);

        diagnosis = {
          hypothesis: matched.label,
          matchedKnown: true,
          probe: null,
          confirmed: true,
          fix: matched.fix,
          conceptId: matched.conceptId,
        };
      } else if (LLM_ENABLED) {
        // Unknown misconception — ask LLM to hypothesise
        try {
          type LLMDiag = { hypothesis: string; fix: string; conceptId: string };
          const llmDiag = await chatJSON<LLMDiag>(
            [
              {
                role: "system",
                content:
                  'You are Mirai, diagnosing a grade-7 math misconception. Return JSON: { "hypothesis": string, "fix": string, "conceptId": string }',
              },
              {
                role: "user",
                content: `Exercise: ${exercise.expression}\nCorrect answer: ${exercise.answer}\nStudent answered: "${answer}"\nWhat misconception does this reveal? Suggest a targeted fix.`,
              },
            ],
            { temperature: 0.4, maxTokens: 300 },
          );
          diagnosis = {
            hypothesis: llmDiag.hypothesis ?? "Unknown misconception",
            matchedKnown: false,
            probe: null,
            confirmed: true,
            fix: llmDiag.fix ?? "Review the concept from the beginning.",
            conceptId: llmDiag.conceptId ?? conceptId,
          };
        } catch (e) {
          if (!(e instanceof LLMUnavailableError)) throw e;
          // Fallback diagnosis
          diagnosis = fallbackDiagnosis(conceptId);
        }
      } else {
        diagnosis = fallbackDiagnosis(conceptId);
      }

      const diagnoseEvent = makeEvent(
        id,
        "diagnose",
        diagnosis.matchedKnown
          ? `Matched known misconception: "${diagnosis.hypothesis}" — skipped probe. Fix: ${diagnosis.fix.slice(0, 80)}`
          : `Hypothesis: ${diagnosis.hypothesis.slice(0, 80)}. Fix: ${diagnosis.fix.slice(0, 80)}`,
      );
      await pushFeed(diagnoseEvent);
      newEvents.push(diagnoseEvent);
    }

    // ── STEP 4 — ESCALATE ───────────────────────────────────────────
    let escalated = false;
    const conceptMasteryNow =
      updatedMastery.find((m) => m.conceptId === conceptId)?.mastery ?? 0;

    // Count recent failures in submission history
    const recentSubs = await getSubmissions(id, 10);
    const recentConceptSubs = recentSubs.filter(
      (s) => s.conceptId === conceptId,
    );
    // Count consecutive failures from the most recent
    let consecutiveFails = 0;
    for (const sub of recentConceptSubs) {
      if (!sub.correct) consecutiveFails++;
      else break;
    }

    if (consecutiveFails >= 3 || conceptMasteryNow < 0.4) {
      escalated = true;

      // Update student flag
      const updatedStudent = {
        ...student,
        overallMastery,
        status: "stuck" as const,
        flag: {
          reason: `${consecutiveFails >= 3 ? consecutiveFails + " failed attempts" : "mastery below 40%"}`,
          detail: `Stuck on ${conceptId.replace(/-/g, " ")}. Mirai suggests reteaching the prerequisite steps.`,
          severity: "high" as const,
        },
      };
      await saveStudent(updatedStudent);

      const escalateEvent = makeEvent(
        id,
        "escalate",
        `Escalated to teacher: ${consecutiveFails >= 3 ? consecutiveFails + " consecutive failures" : "mastery dropped below 40%"} on ${conceptId}. Recommended: pull aside for targeted review.`,
      );
      await pushFeed(escalateEvent);
      newEvents.push(escalateEvent);
    } else {
      // Still update overall mastery on student record without changing flag
      const updatedStudent = { ...student, overallMastery };
      await saveStudent(updatedStudent);
    }

    // ── STEP 5 — PRE-GENERATE NEXT EXERCISE ─────────────────────────
    let nextExercise = null;
    try {
      nextExercise = await getNextExercise(student.currentConceptId);

      const generateEvent = makeEvent(
        id,
        "generate",
        `Pre-generated next exercise for ${student.currentConceptId} (difficulty ${nextExercise.difficulty}).`,
      );
      await pushFeed(generateEvent);
      newEvents.push(generateEvent);
    } catch (err) {
      console.error("[submit] next exercise generation failed:", err);
      nextExercise = EXERCISES[0];
    }

    // ── RETURN ──────────────────────────────────────────────────────
    const resp: SubmitResponse = {
      grade,
      diagnosis,
      feed: newEvents,
      mastery: updatedMastery,
      nextExercise,
      escalated,
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[students/submit]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function fallbackGrade(answer: string, correctAnswer: string): GradeResult {
  const normalised = answer.replace(/\s/g, "").toLowerCase();
  const correct = normalised.includes("11/12") || normalised === correctAnswer.toLowerCase().replace(/\s/g, "");

  if (correct) {
    return {
      correct: true,
      readBack: answer,
      steps: [
        { step: "Find a common denominator: 12", ok: true },
        { step: "Rewrite: 9/12 + 2/12", ok: true },
        { step: "Add the numerators: 11/12", ok: true },
      ],
      failingStepIndex: null,
      tutorMessage: "Great work! You found the common denominator and added correctly.",
      nextDifficulty: 5,
      masteryDelta: 0.15,
    };
  }

  return {
    correct: false,
    readBack: answer,
    steps: [
      { step: "Find a common denominator", ok: false, note: "Check your common denominator first." },
    ],
    failingStepIndex: 0,
    tutorMessage: "Not quite — remember to find a common denominator before adding the numerators.",
    nextDifficulty: 3,
    masteryDelta: -0.1,
  };
}

function fallbackDiagnosis(conceptId: string): Diagnosis {
  const misc = MISCONCEPTIONS.find((m) => m.conceptId === conceptId)
    ?? MISCONCEPTIONS[0];
  return {
    hypothesis: misc.label,
    matchedKnown: false,
    probe: null,
    confirmed: true,
    fix: misc.fix,
    conceptId: misc.conceptId,
  };
}
