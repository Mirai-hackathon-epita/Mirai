import {
  getStudents,
  getStudent,
  saveStudent,
  getMastery,
  saveMastery,
  getConceptGraph,
  getFeed,
  pushFeed,
  getExercises,
  getExerciseById,
  addExercise,
  getMisconceptions,
  getTeacher,
  getActivity,
  getClassStats,
  getTopicMastery,
  getInsight,
  pushSubmission,
  getSubmissions,
} from "../repo";
import type { FeedEvent, Submission } from "@/lib/domain/types";

const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
afterAll(() => logSpy.mockRestore());

beforeAll(async () => {
  (globalThis as any).__miraKv = undefined;
  await getStudents();
});

describe("getStudents", () => {
  it("returns a non-empty array of students", async () => {
    const students = await getStudents();
    expect(students.length).toBeGreaterThan(0);
  });

  it("every student has an id and name", async () => {
    const students = await getStudents();
    for (const s of students) {
      expect(typeof s.id).toBe("string");
      expect(typeof s.name).toBe("string");
    }
  });
});

describe("getStudent", () => {
  it("returns a student by id", async () => {
    const s = await getStudent("maya");
    expect(s).not.toBeNull();
    expect(s!.name).toBe("Maya Chen");
  });

  it("returns null for unknown id", async () => {
    expect(await getStudent("nobody")).toBeNull();
  });
});

describe("saveStudent", () => {
  it("persists changes to student fields", async () => {
    const original = await getStudent("maya");
    await saveStudent({ ...original!, overallMastery: 0.99 });
    const updated = await getStudent("maya");
    expect(updated!.overallMastery).toBe(0.99);
    await saveStudent(original!);
  });
});

describe("getMastery / saveMastery", () => {
  it("returns mastery array for a student", async () => {
    const mastery = await getMastery("maya");
    expect(Array.isArray(mastery)).toBe(true);
    expect(mastery.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown student", async () => {
    const mastery = await getMastery("nobody");
    expect(mastery).toEqual([]);
  });

  it("saveMastery persists and getMastery retrieves it", async () => {
    const entry = [{ conceptId: "test-c", mastery: 0.75, status: "developing" as const, attempts: 3 }];
    await saveMastery("test-student", entry);
    const result = await getMastery("test-student");
    expect(result).toEqual(entry);
  });
});

describe("getConceptGraph", () => {
  it("returns a graph with topic and concepts", () => {
    const graph = getConceptGraph();
    expect(typeof graph.topic).toBe("string");
    expect(Array.isArray(graph.concepts)).toBe(true);
    expect(graph.concepts.length).toBeGreaterThan(0);
  });

  it("each concept has id, label, prerequisites", () => {
    const { concepts } = getConceptGraph();
    for (const c of concepts) {
      expect(typeof c.id).toBe("string");
      expect(typeof c.label).toBe("string");
      expect(Array.isArray(c.prerequisites)).toBe(true);
    }
  });
});

describe("getFeed / pushFeed", () => {
  it("returns seeded feed for a student", async () => {
    const feed = await getFeed("maya");
    expect(Array.isArray(feed)).toBe(true);
  });

  it("returns empty array for unknown student", async () => {
    const feed = await getFeed("nobody");
    expect(feed).toEqual([]);
  });

  it("pushFeed prepends an event to the feed", async () => {
    const ev: FeedEvent = {
      id: "ev-test-1",
      studentId: "liam",
      ts: Date.now(),
      kind: "plan",
      text: "Test event",
    };
    await pushFeed(ev);
    const feed = await getFeed("liam");
    expect(feed[0]).toMatchObject({ id: "ev-test-1", text: "Test event" });
  });
});

describe("getExercises / getExerciseById / addExercise", () => {
  it("returns all exercises when no conceptId filter", async () => {
    const all = await getExercises();
    expect(all.length).toBeGreaterThan(0);
  });

  it("filters exercises by conceptId", async () => {
    const filtered = await getExercises("adding-unlike-fractions");
    expect(filtered.length).toBeGreaterThan(0);
    for (const ex of filtered) {
      expect(ex.conceptId).toBe("adding-unlike-fractions");
    }
  });

  it("returns empty array for unknown conceptId", async () => {
    const result = await getExercises("non-existent-concept");
    expect(result).toEqual([]);
  });

  it("getExerciseById returns the exercise", async () => {
    const all = await getExercises();
    const first = all[0];
    const found = await getExerciseById(first.id);
    expect(found).toEqual(first);
  });

  it("getExerciseById returns null for unknown id", async () => {
    expect(await getExerciseById("ex-nope")).toBeNull();
  });

  it("addExercise makes it retrievable", async () => {
    const ex = {
      id: "ex-test-new",
      conceptId: "test-concept",
      kind: "practice" as const,
      prompt: "Test prompt",
      expression: "1+1=?",
      difficulty: 2,
      answer: "2",
      steps: ["add"],
    };
    await addExercise(ex);
    const found = await getExerciseById("ex-test-new");
    expect(found).toEqual(ex);
  });
});

describe("getMisconceptions", () => {
  it("returns an array", async () => {
    const list = await getMisconceptions();
    expect(Array.isArray(list)).toBe(true);
  });
});

describe("getTeacher", () => {
  it("returns teacher with required fields", async () => {
    const t = await getTeacher();
    expect(typeof t.id).toBe("string");
    expect(typeof t.name).toBe("string");
    expect(typeof t.initials).toBe("string");
  });
});

describe("getActivity", () => {
  it("returns a non-empty activity array", async () => {
    const activity = await getActivity();
    expect(Array.isArray(activity)).toBe(true);
    expect(activity.length).toBeGreaterThan(0);
  });
});

describe("getClassStats", () => {
  it("returns stats with avgMastery in 0–1", async () => {
    const stats = await getClassStats();
    expect(stats.avgMastery).toBeGreaterThanOrEqual(0);
    expect(stats.avgMastery).toBeLessThanOrEqual(1);
  });
});

describe("getTopicMastery", () => {
  it("returns an array of topic mastery entries", async () => {
    const list = await getTopicMastery();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    for (const t of list) {
      expect(typeof t.topic).toBe("string");
      expect(t.mastery).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("getInsight", () => {
  it("returns a non-empty string", async () => {
    const insight = await getInsight();
    expect(typeof insight).toBe("string");
    expect(insight.length).toBeGreaterThan(0);
  });
});

describe("pushSubmission / getSubmissions", () => {
  it("pushSubmission stores a submission retrievable by getSubmissions", async () => {
    const sub: Submission = {
      id: "sub-test-1",
      studentId: "sofia",
      exerciseId: "ex-auf-1",
      conceptId: "adding-unlike-fractions",
      answer: "11/12",
      correct: true,
      ts: Date.now(),
    };
    await pushSubmission(sub);
    const subs = await getSubmissions("sofia");
    expect(subs[0]).toMatchObject({ id: "sub-test-1", correct: true });
  });

  it("getSubmissions returns empty for student with no submissions", async () => {
    const subs = await getSubmissions("nobody");
    expect(subs).toEqual([]);
  });
});
