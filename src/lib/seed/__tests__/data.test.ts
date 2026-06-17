import {
  TEACHER,
  STUDENTS,
  EXERCISES,
  MISCONCEPTIONS,
  MASTERY,
  FEED,
  ACTIVITY,
  CLASS_STATS,
  TOPIC_MASTERY,
  CLASS_INSIGHT,
  SEED_VERSION,
} from "../data";

describe("TEACHER", () => {
  it("has required fields", () => {
    expect(typeof TEACHER.id).toBe("string");
    expect(typeof TEACHER.name).toBe("string");
    expect(typeof TEACHER.initials).toBe("string");
    expect(typeof TEACHER.subject).toBe("string");
  });
});

describe("STUDENTS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(STUDENTS)).toBe(true);
    expect(STUDENTS.length).toBeGreaterThan(0);
  });

  it("each student has required fields", () => {
    for (const s of STUDENTS) {
      expect(typeof s.id).toBe("string");
      expect(typeof s.name).toBe("string");
      expect(typeof s.initials).toBe("string");
      expect(typeof s.overallMastery).toBe("number");
    }
  });

  it("overallMastery is between 0 and 1 for every student", () => {
    for (const s of STUDENTS) {
      expect(s.overallMastery).toBeGreaterThanOrEqual(0);
      expect(s.overallMastery).toBeLessThanOrEqual(1);
    }
  });

  it("each student has a valid status", () => {
    const validStatuses = new Set(["stuck", "review", "on-track", "ahead"]);
    for (const s of STUDENTS) {
      expect(validStatuses.has(s.status)).toBe(true);
    }
  });

  it("each student has a valid cognitive profile", () => {
    const validProfiles = new Set(["visual", "auditory", "written", "mixed"]);
    for (const s of STUDENTS) {
      expect(validProfiles.has(s.profile)).toBe(true);
    }
  });
});

describe("EXERCISES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(EXERCISES)).toBe(true);
    expect(EXERCISES.length).toBeGreaterThan(0);
  });

  it("each exercise has required fields", () => {
    for (const ex of EXERCISES) {
      expect(typeof ex.id).toBe("string");
      expect(typeof ex.conceptId).toBe("string");
      expect(typeof ex.prompt).toBe("string");
      expect(typeof ex.answer).toBe("string");
      expect(Array.isArray(ex.steps)).toBe(true);
    }
  });

  it("difficulty is in range 1–10", () => {
    for (const ex of EXERCISES) {
      expect(ex.difficulty).toBeGreaterThanOrEqual(1);
      expect(ex.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it("exercise ids are unique", () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("MISCONCEPTIONS", () => {
  it("is an array", () => {
    expect(Array.isArray(MISCONCEPTIONS)).toBe(true);
  });

  it("each misconception has id, label, and fix", () => {
    for (const m of MISCONCEPTIONS) {
      expect(typeof m.id).toBe("string");
      expect(typeof m.label).toBe("string");
      expect(typeof m.fix).toBe("string");
    }
  });
});

describe("MASTERY", () => {
  it("is a record with entries for each student", () => {
    for (const s of STUDENTS) {
      expect(s.id in MASTERY).toBe(true);
      expect(Array.isArray(MASTERY[s.id])).toBe(true);
    }
  });

  it("each mastery entry has conceptId and a 0–1 mastery value", () => {
    for (const entries of Object.values(MASTERY)) {
      for (const e of entries) {
        expect(typeof e.conceptId).toBe("string");
        expect(e.mastery).toBeGreaterThanOrEqual(0);
        expect(e.mastery).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("FEED", () => {
  it("is a non-empty record keyed by student id", () => {
    expect(typeof FEED).toBe("object");
    expect(Object.keys(FEED).length).toBeGreaterThan(0);
    for (const key of Object.keys(FEED)) {
      expect(Array.isArray(FEED[key])).toBe(true);
    }
  });

  it("each feed event has id, studentId, ts, kind, text", () => {
    for (const events of Object.values(FEED)) {
      for (const ev of events) {
        expect(typeof ev.id).toBe("string");
        expect(typeof ev.studentId).toBe("string");
        expect(typeof ev.ts).toBe("number");
        expect(typeof ev.kind).toBe("string");
        expect(typeof ev.text).toBe("string");
      }
    }
  });
});

describe("ACTIVITY", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(ACTIVITY)).toBe(true);
    expect(ACTIVITY.length).toBeGreaterThan(0);
  });

  it("each item has id, time, and text", () => {
    for (const item of ACTIVITY) {
      expect(typeof item.id).toBe("string");
      expect(typeof item.time).toBe("string");
      expect(typeof item.text).toBe("string");
    }
  });
});

describe("CLASS_STATS", () => {
  it("has valid avgMastery between 0 and 1", () => {
    expect(CLASS_STATS.avgMastery).toBeGreaterThanOrEqual(0);
    expect(CLASS_STATS.avgMastery).toBeLessThanOrEqual(1);
  });

  it("has non-negative needsAttention count", () => {
    expect(CLASS_STATS.needsAttention).toBeGreaterThanOrEqual(0);
  });

  it("has avgMasteryDelta as a number", () => {
    expect(typeof CLASS_STATS.avgMasteryDelta).toBe("number");
  });
});

describe("TOPIC_MASTERY", () => {
  it("is an array with topic and mastery fields", () => {
    expect(Array.isArray(TOPIC_MASTERY)).toBe(true);
    for (const tm of TOPIC_MASTERY) {
      expect(typeof tm.topic).toBe("string");
      expect(tm.mastery).toBeGreaterThanOrEqual(0);
      expect(tm.mastery).toBeLessThanOrEqual(1);
    }
  });
});

describe("CLASS_INSIGHT", () => {
  it("is a non-empty string", () => {
    expect(typeof CLASS_INSIGHT).toBe("string");
    expect(CLASS_INSIGHT.length).toBeGreaterThan(0);
  });
});

describe("SEED_VERSION", () => {
  it("is a positive integer", () => {
    expect(Number.isInteger(SEED_VERSION)).toBe(true);
    expect(SEED_VERSION).toBeGreaterThan(0);
  });
});
