import "server-only";
import { kv } from "@/lib/store/kv";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import type {
  ActivityItem,
  ClassStats,
  ConceptGraph,
  ConceptMastery,
  Exercise,
  FeedEvent,
  Misconception,
  Student,
  Submission,
  Teacher,
  TopicMastery,
} from "@/lib/domain/types";
import {
  ACTIVITY,
  CLASS_INSIGHT,
  CLASS_STATS,
  EXERCISES,
  FEED,
  MASTERY,
  MISCONCEPTIONS,
  SEED_VERSION,
  STUDENTS,
  TEACHER,
  TOPIC_MASTERY,
} from "@/lib/seed/data";

// ─── Repository ─────────────────────────────────────────────────────
// The only module that touches keys. Every other module (agent, API routes)
// goes through these accessors so the key schema stays in one place.

const K = {
  seedVersion: "mira:seed:version",
  studentIndex: "mira:students",
  student: (id: string) => `mira:student:${id}`,
  mastery: (id: string) => `mira:mastery:${id}`,
  feed: (id: string) => `mira:feed:${id}`,
  submissions: (id: string) => `mira:submissions:${id}`,
  exercises: "mira:exercises",
  misconceptions: "mira:misconceptions",
  teacher: "mira:teacher",
  activity: "mira:activity",
  classStats: "mira:classStats",
  topicMastery: "mira:topicMastery",
  insight: "mira:insight",
} as const;

let seeding: Promise<void> | null = null;

/** Idempotently load seed data. Re-seeds when SEED_VERSION changes. */
export async function ensureSeeded(): Promise<void> {
  if (seeding) return seeding;
  seeding = (async () => {
    const store = kv();
    const version = await store.getJSON<number>(K.seedVersion);
    if (version === SEED_VERSION) return;

    await store.setJSON(
      K.studentIndex,
      STUDENTS.map((s) => s.id),
    );
    for (const s of STUDENTS) {
      await store.setJSON(K.student(s.id), s);
      await store.setJSON(K.mastery(s.id), MASTERY[s.id] ?? []);
      // Seed the feed newest-first so listRange returns chronological-desc.
      await store.del(K.feed(s.id));
      const events = FEED[s.id] ?? [];
      for (const ev of events) await store.listUnshift(K.feed(s.id), ev);
    }
    await store.setJSON(K.exercises, EXERCISES);
    await store.setJSON(K.misconceptions, MISCONCEPTIONS);
    await store.setJSON(K.teacher, TEACHER);
    await store.setJSON(K.activity, ACTIVITY);
    await store.setJSON(K.classStats, CLASS_STATS);
    await store.setJSON(K.topicMastery, TOPIC_MASTERY);
    await store.setJSON(K.insight, CLASS_INSIGHT);
    await store.setJSON(K.seedVersion, SEED_VERSION);
    console.log(`[mira] seeded store (v${SEED_VERSION}, ${store.backend})`);
  })();
  return seeding;
}

// ── Students ──
export async function getStudents(): Promise<Student[]> {
  await ensureSeeded();
  const store = kv();
  const ids = (await store.getJSON<string[]>(K.studentIndex)) ?? [];
  const students = await Promise.all(
    ids.map((id) => store.getJSON<Student>(K.student(id))),
  );
  return students.filter((s): s is Student => s !== null);
}

export async function getStudent(id: string): Promise<Student | null> {
  await ensureSeeded();
  return kv().getJSON<Student>(K.student(id));
}

export async function saveStudent(student: Student): Promise<void> {
  await kv().setJSON(K.student(student.id), student);
}

// ── Mastery ──
export async function getMastery(studentId: string): Promise<ConceptMastery[]> {
  await ensureSeeded();
  return (await kv().getJSON<ConceptMastery[]>(K.mastery(studentId))) ?? [];
}

export async function saveMastery(
  studentId: string,
  mastery: ConceptMastery[],
): Promise<void> {
  await kv().setJSON(K.mastery(studentId), mastery);
}

// ── Concept graph (static) ──
export function getConceptGraph(): ConceptGraph {
  return FRACTIONS_GRAPH;
}

// ── Feed ──
export async function getFeed(
  studentId: string,
  limit = 50,
): Promise<FeedEvent[]> {
  await ensureSeeded();
  return kv().listRange<FeedEvent>(K.feed(studentId), 0, limit - 1);
}

export async function pushFeed(event: FeedEvent): Promise<void> {
  await kv().listUnshift(K.feed(event.studentId), event);
}

// ── Exercises ──
export async function getExercises(conceptId?: string): Promise<Exercise[]> {
  await ensureSeeded();
  const all = (await kv().getJSON<Exercise[]>(K.exercises)) ?? [];
  return conceptId ? all.filter((e) => e.conceptId === conceptId) : all;
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const all = await getExercises();
  return all.find((e) => e.id === id) ?? null;
}

export async function addExercise(ex: Exercise): Promise<void> {
  await ensureSeeded();
  const all = (await kv().getJSON<Exercise[]>(K.exercises)) ?? [];
  all.push(ex);
  await kv().setJSON(K.exercises, all);
}

// ── Misconceptions (shared diagnostic memory) ──
export async function getMisconceptions(): Promise<Misconception[]> {
  await ensureSeeded();
  return (await kv().getJSON<Misconception[]>(K.misconceptions)) ?? [];
}

export async function saveMisconceptions(
  list: Misconception[],
): Promise<void> {
  await kv().setJSON(K.misconceptions, list);
}

// ── Submissions ──
export async function pushSubmission(sub: Submission): Promise<void> {
  await kv().listUnshift(K.submissions(sub.studentId), sub);
}

export async function getSubmissions(
  studentId: string,
  limit = 50,
): Promise<Submission[]> {
  await ensureSeeded();
  return kv().listRange<Submission>(K.submissions(studentId), 0, limit - 1);
}

// ── Teacher & class aggregates ──
export async function getTeacher(): Promise<Teacher> {
  await ensureSeeded();
  return (await kv().getJSON<Teacher>(K.teacher)) ?? TEACHER;
}

export async function getActivity(): Promise<ActivityItem[]> {
  await ensureSeeded();
  return (await kv().getJSON<ActivityItem[]>(K.activity)) ?? ACTIVITY;
}

export async function getClassStats(): Promise<ClassStats> {
  await ensureSeeded();
  return (await kv().getJSON<ClassStats>(K.classStats)) ?? CLASS_STATS;
}

export async function getTopicMastery(): Promise<TopicMastery[]> {
  await ensureSeeded();
  return (await kv().getJSON<TopicMastery[]>(K.topicMastery)) ?? TOPIC_MASTERY;
}

export async function getInsight(): Promise<string> {
  await ensureSeeded();
  return (await kv().getJSON<string>(K.insight)) ?? CLASS_INSIGHT;
}
