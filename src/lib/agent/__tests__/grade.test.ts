import { fallbackGrade } from "../grade";
import type { Exercise } from "@/lib/domain/types";

const addUnlike: Exercise = {
  id: "ex-1",
  conceptId: "adding-unlike-fractions",
  kind: "practice",
  prompt: "Add the fractions.",
  expression: "3/4 + 1/6 = ?",
  difficulty: 4,
  answer: "11/12",
  steps: [
    "Find a common denominator: 12",
    "Rewrite: 9/12 + 2/12",
    "Add the numerators: 11/12",
  ],
};

// A *different* exercise whose answer is not 11/12. The bug this suite guards
// against: the offline grader hardcoded "11/12", so it marked every exercise
// correct for that answer and only ever reported the fractions steps.
const addLike: Exercise = {
  id: "ex-2",
  conceptId: "adding-like-fractions",
  kind: "practice",
  prompt: "Add the fractions.",
  expression: "1/6 + 4/6 = ?",
  difficulty: 2,
  answer: "5/6",
  steps: ["Denominators already match", "Add the numerators: 5/6"],
};

describe("fallbackGrade", () => {
  it("marks a correct answer correct", () => {
    const g = fallbackGrade("11/12", addUnlike);
    expect(g.correct).toBe(true);
    expect(g.failingStepIndex).toBeNull();
    expect(g.steps.every((s) => s.ok)).toBe(true);
  });

  it("accepts a worked chain from the OCR path", () => {
    expect(fallbackGrade("3/4 + 1/6 = 9/12 + 2/12 = 11/12", addUnlike).correct).toBe(
      true,
    );
  });

  it("grades against the exercise it was given, not a hardcoded answer", () => {
    expect(fallbackGrade("11/12", addLike).correct).toBe(false);
    expect(fallbackGrade("5/6", addLike).correct).toBe(true);
  });

  it("reports the exercise's own steps", () => {
    const g = fallbackGrade("5/6", addLike);
    expect(g.steps.map((s) => s.step)).toEqual(addLike.steps);
  });

  it("marks the add-across misconception incorrect and points at step 1", () => {
    const g = fallbackGrade("4/10", addUnlike);
    expect(g.correct).toBe(false);
    expect(g.failingStepIndex).toBe(0);
    expect(g.steps[0].step).toBe(addUnlike.steps[0]);
    expect(g.steps[0].note).toBeTruthy();
  });

  it("steps difficulty up when correct and down when wrong", () => {
    expect(fallbackGrade("11/12", addUnlike).nextDifficulty).toBe(5);
    expect(fallbackGrade("4/10", addUnlike).nextDifficulty).toBe(3);
  });

  it("clamps difficulty to the 1..10 range", () => {
    expect(fallbackGrade("x", { ...addUnlike, difficulty: 1 }).nextDifficulty).toBe(1);
    expect(
      fallbackGrade("11/12", { ...addUnlike, difficulty: 10 }).nextDifficulty,
    ).toBe(10);
  });

  it("copes with an exercise that has no steps", () => {
    const g = fallbackGrade("nope", { ...addUnlike, steps: [] });
    expect(g.steps).toHaveLength(1);
    expect(g.steps[0].step).toBeTruthy();
  });

  it("never leaks the expected answer in the tutor message", () => {
    expect(fallbackGrade("4/10", addUnlike).tutorMessage).not.toContain("11/12");
  });
});
