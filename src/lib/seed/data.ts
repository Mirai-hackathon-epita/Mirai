import type {
  ActivityItem,
  ClassStats,
  ConceptMastery,
  Exercise,
  FeedEvent,
  Misconception,
  Student,
  Teacher,
  TopicMastery,
} from "@/lib/domain/types";
import { masteryStatus } from "@/lib/domain/mastery";

// ─── Seed data ──────────────────────────────────────────────────────
// Mirrors the design exactly. Loaded into the store on boot. Maya Chen is
// the demo centerpiece (fractions, visual learner, misconception loop).

export const TEACHER: Teacher = {
  id: "teacher-rivera",
  name: "Ms. Rivera",
  initials: "DR",
  subject: "Grade 7 · Math",
};

export const STUDENTS: Student[] = [
  {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    grade: "Grade 7",
    profile: "visual",
    currentConceptId: "adding-unlike-fractions",
    currentTopicLabel: "Fractions",
    overallMastery: 0.64,
    status: "stuck",
    accent: "neutral",
    flag: {
      reason: "3 failed attempts",
      detail:
        "Stuck on adding fractions with unlike denominators. Mira suggests reteaching common denominators.",
      severity: "high",
    },
  },
  {
    id: "liam",
    name: "Liam Patel",
    initials: "LP",
    grade: "Grade 7",
    profile: "auditory",
    currentConceptId: "comparing-fractions",
    currentTopicLabel: "Two-step equations",
    overallMastery: 0.52,
    status: "review",
    accent: "neutral",
    flag: {
      reason: "low confidence",
      detail:
        "Guessing on two-step equations — correct answers, slow and uncertain.",
      severity: "medium",
    },
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    initials: "SR",
    grade: "Grade 7",
    profile: "written",
    currentConceptId: "common-denominators",
    currentTopicLabel: "Integers",
    overallMastery: 0.61,
    status: "on-track",
    accent: "neutral",
    flag: {
      reason: "recurring slip",
      detail: "Sign errors when subtracting negative integers.",
      severity: "medium",
    },
  },
  {
    id: "emma",
    name: "Emma Davis",
    initials: "ED",
    grade: "Grade 7",
    profile: "mixed",
    currentConceptId: "comparing-fractions",
    currentTopicLabel: "Two-step equations",
    overallMastery: 0.74,
    status: "on-track",
    accent: "neutral",
    flag: null,
  },
  {
    id: "noah",
    name: "Noah Kim",
    initials: "NK",
    grade: "Grade 7",
    profile: "visual",
    currentConceptId: "mixed-numbers",
    currentTopicLabel: "Ratios & proportions",
    overallMastery: 0.88,
    status: "ahead",
    accent: "neutral",
    flag: null,
  },
];

// Per-student mastery over the fractions concept graph. Values for Maya match
// the skill-graph screen exactly (the weak link is common-denominators).
function m(
  conceptId: string,
  mastery: number,
  attempts: number,
  weakLink = false,
): ConceptMastery {
  return {
    conceptId,
    mastery,
    attempts,
    status: attempts === 0 ? "not-started" : masteryStatus(mastery, attempts),
    weakLink,
  };
}

export const MASTERY: Record<string, ConceptMastery[]> = {
  maya: [
    m("whole-number-operations", 0.96, 14),
    m("equivalent-fractions", 0.9, 11),
    m("multiples-factors", 0.84, 9),
    m("common-denominators", 0.54, 7, true),
    m("adding-like-fractions", 0.88, 8),
    m("adding-unlike-fractions", 0.38, 6),
    m("comparing-fractions", 0.62, 5),
    m("subtracting-fractions", 0, 0),
    m("mixed-numbers", 0, 0),
  ],
  liam: [
    m("whole-number-operations", 0.92, 12),
    m("equivalent-fractions", 0.8, 9),
    m("multiples-factors", 0.74, 7),
    m("common-denominators", 0.6, 6),
    m("adding-like-fractions", 0.7, 6),
    m("adding-unlike-fractions", 0.5, 4),
    m("comparing-fractions", 0.52, 4),
    m("subtracting-fractions", 0, 0),
    m("mixed-numbers", 0, 0),
  ],
  sofia: [
    m("whole-number-operations", 0.94, 13),
    m("equivalent-fractions", 0.82, 9),
    m("multiples-factors", 0.78, 8),
    m("common-denominators", 0.61, 6),
    m("adding-like-fractions", 0.66, 5),
    m("adding-unlike-fractions", 0.48, 3),
    m("comparing-fractions", 0.55, 3),
    m("subtracting-fractions", 0, 0),
    m("mixed-numbers", 0, 0),
  ],
  emma: [
    m("whole-number-operations", 0.97, 15),
    m("equivalent-fractions", 0.92, 12),
    m("multiples-factors", 0.86, 10),
    m("common-denominators", 0.78, 9),
    m("adding-like-fractions", 0.84, 8),
    m("adding-unlike-fractions", 0.74, 7),
    m("comparing-fractions", 0.7, 6),
    m("subtracting-fractions", 0.4, 2),
    m("mixed-numbers", 0, 0),
  ],
  noah: [
    m("whole-number-operations", 0.99, 16),
    m("equivalent-fractions", 0.95, 13),
    m("multiples-factors", 0.92, 11),
    m("common-denominators", 0.9, 10),
    m("adding-like-fractions", 0.93, 10),
    m("adding-unlike-fractions", 0.88, 9),
    m("comparing-fractions", 0.85, 8),
    m("subtracting-fractions", 0.82, 6),
    m("mixed-numbers", 0.6, 4),
  ],
};

// Seeded exercise pool keyed by concept. The agent generates more live, but
// these guarantee a rehearsed, crash-proof demo path for Maya.
const BAR_RED = "#C2533A";
const BAR_BLUE = "#2C4ADF";
const BAR_EMPTY = "#EFE7D8";
const BAR_GREEN = "#5C8A6E";

export const EXERCISES: Exercise[] = [
  {
    id: "ex-auf-1",
    conceptId: "adding-unlike-fractions",
    kind: "practice",
    prompt:
      "Add these two fractions. Show each step, then write your answer in lowest terms.",
    expression: "¾ + ⅙ = ?",
    difficulty: 4,
    answer: "11/12",
    steps: [
      "Find a common denominator: 12",
      "Rewrite: 9/12 + 2/12",
      "Add the numerators: 11/12",
    ],
    visualization: {
      kind: "fraction-bars",
      title: "Made for you — fraction bars",
      denominator: 12,
      rows: [
        { label: "¾ = 9⁄12", caption: "three quarters", filled: 9, color: BAR_RED },
        { label: "⅙ = 2⁄12", caption: "one sixth", filled: 2, color: BAR_BLUE },
        {
          label: "together = 11⁄12",
          caption: "same twelfths",
          filled: 11,
          color: BAR_GREEN,
        },
      ],
    },
  },
  {
    id: "ex-auf-2",
    conceptId: "adding-unlike-fractions",
    kind: "practice",
    prompt:
      "Add these two fractions. Show your steps, then simplify if you can.",
    expression: "⅖ + ¼ = ?",
    difficulty: 5,
    answer: "13/20",
    steps: [
      "Find a common denominator: 20",
      "Rewrite: 8/20 + 5/20",
      "Add the numerators: 13/20",
    ],
    visualization: {
      kind: "fraction-bars",
      title: "Made for you — fraction bars",
      denominator: 20,
      rows: [
        { label: "⅖ = 8⁄20", caption: "two fifths", filled: 8, color: BAR_RED },
        { label: "¼ = 5⁄20", caption: "one quarter", filled: 5, color: BAR_BLUE },
        {
          label: "together = 13⁄20",
          caption: "same twentieths",
          filled: 13,
          color: BAR_GREEN,
        },
      ],
    },
  },
  {
    id: "ex-cd-1",
    conceptId: "common-denominators",
    kind: "scaffold",
    prompt:
      "Rewrite both fractions over the same denominator. You do not need to add them yet.",
    expression: "⅓ and ¼ → /12 and /12",
    difficulty: 3,
    answer: "4/12 and 3/12",
    steps: [
      "Least common multiple of 3 and 4 is 12",
      "⅓ = 4/12",
      "¼ = 3/12",
    ],
    visualization: {
      kind: "fraction-bars",
      title: "Common denominator — line them up",
      denominator: 12,
      rows: [
        { label: "⅓ = 4⁄12", caption: "one third", filled: 4, color: BAR_RED },
        { label: "¼ = 3⁄12", caption: "one quarter", filled: 3, color: BAR_BLUE },
      ],
    },
  },
];

// Shared diagnostic memory — seeded so the demo can show "recognised a known
// misconception, skipped the probe" (PLAN §5.7).
export const MISCONCEPTIONS: Misconception[] = [
  {
    id: "misc-add-across",
    conceptId: "adding-unlike-fractions",
    label: "adds numerators and denominators straight across",
    signature: "a/b + c/d = (a+c)/(b+d)",
    fix: "Show with fraction bars that the pieces must be the same size first — find a common denominator, then add only the numerators.",
    seenCount: 4,
  },
  {
    id: "misc-no-common-denom",
    conceptId: "common-denominators",
    label: "forgets to convert to a common denominator before adding",
    signature: "adds unlike fractions without rewriting",
    fix: "Drill the one move in isolation: rewrite each fraction over the LCM before any addition.",
    seenCount: 6,
  },
  {
    id: "misc-lcm-slip",
    conceptId: "multiples-factors",
    label: "multiplies the denominators instead of using the LCM",
    signature: "uses b*d instead of lcm(b,d)",
    fix: "Practise finding the least common multiple, then compare to the product to see when they differ.",
    seenCount: 2,
  },
];

// Maya's reasoning feed — a faithful-looking trace of the autonomous loop.
const now = 1_710_000_000_000; // fixed base so seeds are deterministic
export const FEED: Record<string, FeedEvent[]> = {
  maya: [
    {
      id: "f1",
      studentId: "maya",
      ts: now - 1000 * 60 * 18,
      kind: "plan",
      text: "Reviewed Maya's skill graph. Gap traced one level down: common denominators (54%) is blocking adding unlike fractions.",
    },
    {
      id: "f2",
      studentId: "maya",
      ts: now - 1000 * 60 * 15,
      kind: "generate",
      text: "Generated a difficulty-4 exercise on adding unlike fractions, with a fraction-bar visualization (visual learner).",
    },
    {
      id: "f3",
      studentId: "maya",
      ts: now - 1000 * 60 * 9,
      kind: "grade",
      text: "Graded handwritten submission step by step — error appeared at the common-denominator step on two prior attempts.",
    },
    {
      id: "f4",
      studentId: "maya",
      ts: now - 1000 * 60 * 7,
      kind: "diagnose",
      text: "Hypothesis: adds numerators and denominators straight across. Matched a known misconception — skipped the probe.",
    },
    {
      id: "f5",
      studentId: "maya",
      ts: now - 1000 * 60 * 5,
      kind: "escalate",
      text: "Flagged Ms. Rivera: pull Maya aside for a 5-min review of common denominators before today's tutorial.",
    },
  ],
};

export const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    time: "9:24",
    text: "Generated 12 easier fraction exercises for **Maya**.",
    studentId: "maya",
  },
  {
    id: "a2",
    time: "9:02",
    text: "Graded **28 handwritten** submissions from Period 3.",
  },
  {
    id: "a3",
    time: "8:47",
    text: "Flagged **Liam** — confidence dropping on equations.",
    studentId: "liam",
  },
  {
    id: "a4",
    time: "Mon",
    text: 'Added a "balancing equations" animation to the Two-step unit.',
  },
];

export const CLASS_STATS: ClassStats = {
  avgMastery: 0.71,
  avgMasteryDelta: 4,
  needsAttention: 4,
};

export const TOPIC_MASTERY: TopicMastery[] = [
  { topic: "Fractions", mastery: 0.58 },
  { topic: "Integers", mastery: 0.7 },
  { topic: "Two-step equations", mastery: 0.64 },
  { topic: "Ratios & proportions", mastery: 0.81 },
];

export const CLASS_INSIGHT =
  "60% of the class stalls at the same step — finding a common denominator. Re-teach that move first in tutorial and three of the four flags should clear.";

export const SEED_VERSION = 3;
