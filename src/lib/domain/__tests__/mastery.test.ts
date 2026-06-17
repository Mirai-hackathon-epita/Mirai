import {
  masteryStatus,
  studentStatus,
  updateMastery,
  pct,
  MASTERY_THRESHOLD,
  DEVELOPING_THRESHOLD,
} from "../mastery";

describe("masteryStatus", () => {
  it("returns not-started when attempts is 0", () => {
    expect(masteryStatus(0.9, 0)).toBe("not-started");
  });

  it("returns mastered at or above threshold", () => {
    expect(masteryStatus(MASTERY_THRESHOLD)).toBe("mastered");
    expect(masteryStatus(1.0)).toBe("mastered");
  });

  it("returns developing between thresholds", () => {
    expect(masteryStatus(DEVELOPING_THRESHOLD)).toBe("developing");
    expect(masteryStatus(0.7)).toBe("developing");
  });

  it("returns needs-work below developing threshold", () => {
    expect(masteryStatus(0.0)).toBe("needs-work");
    expect(masteryStatus(0.49)).toBe("needs-work");
  });
});

describe("studentStatus", () => {
  it("returns stuck when flagged regardless of mastery", () => {
    expect(studentStatus(1.0, true)).toBe("stuck");
    expect(studentStatus(0.0, true)).toBe("stuck");
  });

  it("returns ahead when mastery >= 0.85 and not flagged", () => {
    expect(studentStatus(0.85, false)).toBe("ahead");
    expect(studentStatus(1.0, false)).toBe("ahead");
  });

  it("returns review when mastery below developing threshold", () => {
    expect(studentStatus(0.4, false)).toBe("review");
  });

  it("returns on-track in the middle range", () => {
    expect(studentStatus(0.6, false)).toBe("on-track");
  });
});

describe("updateMastery", () => {
  it("increases mastery on correct answer", () => {
    const next = updateMastery(0.5, true, 5);
    expect(next).toBeGreaterThan(0.5);
  });

  it("decreases mastery on wrong answer", () => {
    const next = updateMastery(0.5, false, 5);
    expect(next).toBeLessThan(0.5);
  });

  it("clamps result between 0 and 1", () => {
    expect(updateMastery(0.0, false, 10)).toBeGreaterThanOrEqual(0);
    expect(updateMastery(1.0, true, 10)).toBeLessThanOrEqual(1);
  });

  it("applies a difficulty-independent delta", () => {
    const easyCorrect = updateMastery(0.5, true, 1);
    const hardCorrect = updateMastery(0.5, true, 10);
    expect(hardCorrect).toBe(easyCorrect);
  });

  it("returns value rounded to 3 decimals", () => {
    const result = updateMastery(0.5, true, 5);
    expect(result).toBe(parseFloat(result.toFixed(3)));
  });
});

describe("pct", () => {
  it("converts mastery fraction to percentage", () => {
    expect(pct(0.75)).toBe(75);
    expect(pct(1.0)).toBe(100);
    expect(pct(0.0)).toBe(0);
  });

  it("rounds correctly", () => {
    expect(pct(0.555)).toBe(56);
  });
});
