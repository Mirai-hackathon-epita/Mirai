// ─── Answer normalisation & comparison ──────────────────────────────
// Used by the offline grading fallback (and any deterministic check) so a
// submission is compared against *its own* exercise rather than a hardcoded
// value. Students — and the OCR path — routinely submit a whole worked chain
// ("3/4 + 1/6 = 9/12 + 2/12 = 11/12"), so the final step is what we grade.

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅐": "1/7",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
  "⅑": "1/9",
  "⅒": "1/10",
};

/**
 * Normalise a written answer: expand unicode fractions, lower-case, collapse
 * whitespace, drop trailing punctuation, and keep only the last step of a
 * worked chain. Single spaces are preserved so mixed numbers ("1 1/2") stay
 * parseable.
 */
export function normalizeAnswer(raw: string): string {
  let s = raw ?? "";
  for (const [glyph, plain] of Object.entries(UNICODE_FRACTIONS)) {
    s = s.split(glyph).join(plain);
  }
  s = s.toLowerCase().replace(/\s+/g, " ").trim();

  // "a = b = c" → "c": grade the result the student landed on.
  const steps = s
    .split("=")
    .map((p) => p.trim())
    .filter(Boolean);
  if (steps.length > 0) s = steps[steps.length - 1];

  return s.replace(/[.,;!?]+$/, "").trim();
}

/**
 * Parse "a/b", "c a/b" (mixed) or a plain decimal into a number.
 * Returns null when the text is not a single numeric value.
 */
export function toNumber(text: string): number | null {
  const t = text.trim();

  const mixed = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const den = Number(mixed[3]);
    if (den === 0) return null;
    const frac = Number(mixed[2]) / den;
    return whole < 0 ? whole - frac : whole + frac;
  }

  const fraction = t.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) {
    const den = Number(fraction[2]);
    return den === 0 ? null : Number(fraction[1]) / den;
  }

  const decimal = t.match(/^-?\d+(\.\d+)?$/);
  return decimal ? Number(t) : null;
}

/**
 * True when a student's answer matches the exercise's canonical answer —
 * literally, ignoring spacing, or by numeric value (so 22/24 matches 11/12).
 */
export function answersMatch(given: string, expected: string): boolean {
  const a = normalizeAnswer(given);
  const b = normalizeAnswer(expected);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.replace(/\s/g, "") === b.replace(/\s/g, "")) return true;

  const av = toNumber(a);
  const bv = toNumber(b);
  if (av === null || bv === null) return false;
  return Math.abs(av - bv) < 1e-9;
}
