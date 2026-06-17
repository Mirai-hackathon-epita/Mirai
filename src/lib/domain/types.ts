// ─── Mira shared domain types ───────────────────────────────────────
// Single source of truth for the data contract shared across the agentic
// backend and every frontend screen. Keep this stable; it is the contract.

/** Mastery buckets used everywhere for colour + status mapping. */
export type MasteryStatus =
  | "mastered" // green   — at/above the mastery threshold
  | "developing" // amber   — making progress, not yet mastered
  | "needs-work" // terracotta — actively struggling
  | "not-started" // neutral — never attempted
  | "locked"; // dashed — prerequisites not yet met

/** Roster-level status shown on the teacher dashboard. */
export type StudentStatus = "stuck" | "review" | "on-track" | "ahead";

/** Declared or inferred dominant learning channel. */
export type CognitiveProfile = "visual" | "auditory" | "written" | "mixed";

/** A node in the concept prerequisite graph (DAG). */
export interface Concept {
  id: string;
  label: string;
  /** Concept ids that should be mastered before this one. */
  prerequisites: string[];
  /** One-line description used in the skill-graph detail panel. */
  blurb: string;
  /** Layout hint for the skill-graph canvas (column, row), 0-indexed. */
  layout: { col: number; row: number };
}

export interface ConceptGraph {
  topic: string; // e.g. "Fractions"
  concepts: Concept[];
}

/** Per-student mastery over a single concept. */
export interface ConceptMastery {
  conceptId: string;
  mastery: number; // 0..1
  status: MasteryStatus;
  attempts: number;
  /** True when this prerequisite is the diagnosed weak link. */
  weakLink?: boolean;
}

export interface FlagInfo {
  reason: string; // short chip text, e.g. "3 failed attempts"
  detail: string; // sentence shown in the flagged list
  severity: "high" | "medium";
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  grade: string; // "Grade 7"
  profile: CognitiveProfile;
  /** Concept the student's agent is currently driving toward. */
  currentConceptId: string;
  currentTopicLabel: string; // human label shown in roster
  overallMastery: number; // 0..1
  status: StudentStatus;
  flag?: FlagInfo | null;
  /** Avatar background colour token key (see ui/theme). */
  accent?: string;
}

export interface Teacher {
  id: string;
  name: string; // "Ms. Rivera"
  initials: string; // "DR"
  subject: string; // "Grade 7 · Math"
}

/** A generated practice/probe/scaffold exercise. */
export interface Exercise {
  id: string;
  conceptId: string;
  kind: "practice" | "probe" | "scaffold";
  prompt: string; // instruction sentence
  expression: string; // the math, e.g. "¾ + ⅙ = ?"
  difficulty: number; // 1..10
  answer: string; // canonical answer, e.g. "11/12"
  steps: string[]; // expected solution steps
  /** Optional generated visualization spec (e.g. fraction bars). */
  visualization?: VisualizationSpec | null;
}

/** Fraction-bar style visualization rendered in the student workspace. */
export interface VisualizationSpec {
  kind: "fraction-bars";
  title: string;
  denominator: number;
  rows: { label: string; caption: string; filled: number; color: string }[];
}

export interface StepFeedback {
  step: string;
  ok: boolean;
  note?: string;
}

/** Result of the agent grading a submission. */
export interface GradeResult {
  correct: boolean;
  readBack: string; // what the OCR/model read back
  steps: StepFeedback[];
  failingStepIndex: number | null;
  tutorMessage: string; // Mira's spoken feedback
  nextDifficulty: number;
  masteryDelta: number; // change applied to the concept mastery
}

/** Output of the misconception diagnosis loop (the demo centerpiece). */
export interface Diagnosis {
  hypothesis: string; // the suspected misconception
  matchedKnown: boolean; // matched a shared-memory entry (skipped probing)
  probe?: Exercise | null; // probe exercise generated to test it
  confirmed: boolean;
  fix: string; // the targeted intervention
  conceptId: string;
}

/** A misconception entry in the shared diagnostic memory. */
export interface Misconception {
  id: string;
  conceptId: string;
  label: string; // "adds numerators and denominators directly"
  signature: string; // pattern the matcher looks for
  fix: string; // proven targeted fix
  seenCount: number;
}

/** One line in the agent reasoning feed (observability). */
export type FeedKind =
  | "plan"
  | "generate"
  | "act"
  | "grade"
  | "reflect"
  | "diagnose"
  | "escalate"
  | "replan";

export interface FeedEvent {
  id: string;
  studentId: string;
  ts: number; // epoch ms
  kind: FeedKind;
  text: string;
}

/** A submission record (history). */
export interface Submission {
  id: string;
  studentId: string;
  exerciseId: string;
  conceptId: string;
  answer: string;
  correct: boolean;
  ts: number;
}

/** Class-level aggregates for the dashboard header cards. */
export interface ClassStats {
  avgMastery: number; // 0..1
  avgMasteryDelta: number; // points change, e.g. +4
  needsAttention: number;
}

export interface TopicMastery {
  topic: string;
  mastery: number; // 0..1
}

/** An item in Mira's class-level activity log. */
export interface ActivityItem {
  id: string;
  time: string; // "9:24", "Mon"
  text: string; // may contain **bold** markers
  studentId?: string;
}

// ─── API response shapes (the wire contract) ────────────────────────

export interface DashboardResponse {
  teacher: Teacher;
  classStats: ClassStats;
  flagged: Array<Student & { flag: FlagInfo }>;
  roster: Student[];
  activity: ActivityItem[];
  topicMastery: TopicMastery[];
  insight: string; // class-level auto-insight sentence
  serverTime: string; // pre-formatted "Tue, Mar 18 · 9:30 AM"
}

export interface StudentGraphResponse {
  student: Student;
  graph: ConceptGraph;
  mastery: ConceptMastery[];
  overallMastery: number;
  focusConceptId: string; // the "NOW" node
  detail: {
    conceptId: string;
    prerequisites: ConceptMastery[];
    tutorNote: string;
  };
}

export interface NextExerciseResponse {
  exercise: Exercise;
  progress: { index: number; total: number };
}

export interface SubmitResponse {
  grade: GradeResult;
  diagnosis?: Diagnosis | null;
  feed: FeedEvent[]; // new feed events produced by this submission
  mastery: ConceptMastery[]; // updated mastery snapshot
  nextExercise: Exercise | null;
  escalated: boolean;
}

export interface ChatResponse {
  reply: string;
}

export interface OcrResponse {
  text: string;
  confidence: "high" | "low";
}

export interface AskResponse {
  answer: string;
}
