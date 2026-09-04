import { answersMatch } from "@/lib/domain/answer";
import type { Exercise, GradeResult } from "@/lib/domain/types";

/**
 * Deterministic grading used when the LLM is offline. It compares against
 * *this* exercise's canonical answer and reports *this* exercise's steps —
 * offline we cannot localise the failing step, so we point at the first one
 * rather than inventing a diagnosis.
 */
export function fallbackGrade(answer: string, exercise: Exercise): GradeResult {
  const correct = answersMatch(answer, exercise.answer);
  const steps =
    exercise.steps.length > 0
      ? exercise.steps
      : ["Work through the problem one step at a time"];

  if (correct) {
    return {
      correct: true,
      readBack: answer,
      steps: steps.map((step) => ({ step, ok: true })),
      failingStepIndex: null,
      tutorMessage: "Great work — that's right. Your steps line up all the way through.",
      nextDifficulty: Math.min(10, exercise.difficulty + 1),
      masteryDelta: 0.15,
    };
  }

  return {
    correct: false,
    readBack: answer,
    steps: [
      {
        step: steps[0],
        ok: false,
        note: "Start here and re-check this step before moving on.",
      },
    ],
    failingStepIndex: 0,
    tutorMessage: `Not quite — go back to "${steps[0]}" and work forward from there.`,
    nextDifficulty: Math.max(1, exercise.difficulty - 1),
    masteryDelta: -0.1,
  };
}
