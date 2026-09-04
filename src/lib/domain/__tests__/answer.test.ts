import { answersMatch, normalizeAnswer, toNumber } from "../answer";

describe("normalizeAnswer", () => {
  it("expands unicode fractions", () => {
    expect(normalizeAnswer("¾")).toBe("3/4");
    expect(normalizeAnswer("⅙")).toBe("1/6");
  });

  it("keeps only the last step of a worked chain", () => {
    expect(normalizeAnswer("3/4 + 1/6 = 9/12 + 2/12 = 11/12")).toBe("11/12");
  });

  it("drops a leading equals sign", () => {
    expect(normalizeAnswer("= 11/12")).toBe("11/12");
  });

  it("collapses whitespace and trailing punctuation", () => {
    expect(normalizeAnswer("  11 / 12 .  ")).toBe("11 / 12");
  });

  it("preserves the space in a mixed number", () => {
    expect(normalizeAnswer("1 1/2")).toBe("1 1/2");
  });

  it("handles empty input", () => {
    expect(normalizeAnswer("")).toBe("");
  });
});

describe("toNumber", () => {
  it("parses simple fractions", () => {
    expect(toNumber("11/12")).toBeCloseTo(11 / 12);
    expect(toNumber("-1/2")).toBeCloseTo(-0.5);
  });

  it("parses mixed numbers", () => {
    expect(toNumber("1 1/2")).toBeCloseTo(1.5);
    expect(toNumber("-1 1/2")).toBeCloseTo(-1.5);
  });

  it("parses decimals and integers", () => {
    expect(toNumber("0.75")).toBeCloseTo(0.75);
    expect(toNumber("7")).toBe(7);
  });

  it("rejects a zero denominator", () => {
    expect(toNumber("1/0")).toBeNull();
    expect(toNumber("1 1/0")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(toNumber("eleven twelfths")).toBeNull();
    expect(toNumber("3/4 + 1/6")).toBeNull();
  });
});

describe("answersMatch", () => {
  it("matches an exact answer", () => {
    expect(answersMatch("11/12", "11/12")).toBe(true);
  });

  it("matches the final step of a worked chain (the OCR path)", () => {
    expect(
      answersMatch("3/4 + 1/6 = 9/12 + 2/12 = 11/12", "11/12"),
    ).toBe(true);
  });

  it("ignores spacing", () => {
    expect(answersMatch(" 11 / 12 ", "11/12")).toBe(true);
  });

  it("accepts an equivalent fraction", () => {
    expect(answersMatch("22/24", "11/12")).toBe(true);
  });

  it("accepts a unicode fraction", () => {
    expect(answersMatch("¾", "3/4")).toBe(true);
  });

  it("rejects the add-across misconception", () => {
    expect(answersMatch("4/10", "11/12")).toBe(false);
    expect(answersMatch("2/5", "11/12")).toBe(false);
  });

  it("does not mark a different exercise correct just because 11/12 appears", () => {
    // The regression this module exists for: the old fallback hardcoded
    // "11/12", so any answer containing it graded correct on every exercise.
    expect(answersMatch("11/12", "5/6")).toBe(false);
  });

  it("rejects empty answers", () => {
    expect(answersMatch("", "11/12")).toBe(false);
    expect(answersMatch("11/12", "")).toBe(false);
  });
});
