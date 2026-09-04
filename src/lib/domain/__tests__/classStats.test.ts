import {
  computeClassStats,
  computeInsight,
  computeTopicMastery,
  studentsNeedingAttention,
  weakestConcept,
  type MasteryByStudent,
} from "../classStats";
import type { ConceptGraph, ConceptMastery, Student } from "../types";

const GRAPH: ConceptGraph = {
  topic: "Fractions",
  concepts: [
    {
      id: "equivalent-fractions",
      label: "Equivalent fractions",
      prerequisites: [],
      blurb: "",
      layout: { col: 0, row: 0 },
    },
    {
      id: "common-denominators",
      label: "Common denominators",
      prerequisites: ["equivalent-fractions"],
      blurb: "",
      layout: { col: 1, row: 0 },
    },
    {
      id: "mixed-numbers",
      label: "Mixed numbers",
      prerequisites: ["common-denominators"],
      blurb: "",
      layout: { col: 2, row: 0 },
    },
  ],
};

function student(id: string, overall: number, flagged = false): Student {
  return {
    id,
    name: id,
    initials: id.slice(0, 2).toUpperCase(),
    grade: "Grade 7",
    profile: "visual",
    currentConceptId: "common-denominators",
    currentTopicLabel: "Fractions",
    overallMastery: overall,
    status: flagged ? "stuck" : "on-track",
    flag: flagged
      ? { reason: "3 failed attempts", detail: "Stuck.", severity: "high" }
      : null,
  };
}

function cm(conceptId: string, mastery: number, attempts = 3): ConceptMastery {
  return { conceptId, mastery, attempts, status: "developing" };
}

const STUDENTS = [student("a", 0.9), student("b", 0.5, true), student("c", 0.4, true)];

const MASTERY: MasteryByStudent = {
  a: [cm("equivalent-fractions", 0.9), cm("common-denominators", 0.85)],
  b: [cm("equivalent-fractions", 0.8), cm("common-denominators", 0.4)],
  c: [
    cm("equivalent-fractions", 0.7),
    cm("common-denominators", 0.3),
    cm("mixed-numbers", 0, 0), // never attempted
  ],
};

describe("computeClassStats", () => {
  it("averages real student mastery", () => {
    const s = computeClassStats(STUDENTS, 0.6);
    expect(s.avgMastery).toBeCloseTo((0.9 + 0.5 + 0.4) / 3);
  });

  it("reports movement against the baseline in points", () => {
    expect(computeClassStats(STUDENTS, 0.5).avgMasteryDelta).toBe(10);
    expect(computeClassStats(STUDENTS, 0.7).avgMasteryDelta).toBe(-10);
  });

  it("counts flagged students as needing attention", () => {
    expect(computeClassStats(STUDENTS, 0.6).needsAttention).toBe(2);
  });

  it("handles an empty class", () => {
    const s = computeClassStats([], 0);
    expect(s).toEqual({ avgMastery: 0, avgMasteryDelta: 0, needsAttention: 0 });
  });
});

describe("computeTopicMastery", () => {
  it("averages each concept across the students who attempted it", () => {
    const rows = computeTopicMastery(GRAPH, MASTERY);
    const common = rows.find((r) => r.conceptId === "common-denominators");
    expect(common?.mastery).toBeCloseTo((0.85 + 0.4 + 0.3) / 3);
  });

  it("orders weakest first — what a teacher acts on", () => {
    const rows = computeTopicMastery(GRAPH, MASTERY);
    expect(rows.map((r) => r.conceptId)).toEqual([
      "common-denominators",
      "equivalent-fractions",
    ]);
  });

  it("skips concepts nobody has attempted", () => {
    const rows = computeTopicMastery(GRAPH, MASTERY);
    expect(rows.some((r) => r.conceptId === "mixed-numbers")).toBe(false);
  });

  it("carries the concept id so 'mark re-taught' targets a real concept", () => {
    for (const row of computeTopicMastery(GRAPH, MASTERY)) {
      expect(GRAPH.concepts.some((c) => c.id === row.conceptId)).toBe(true);
    }
  });

  it("respects the row limit", () => {
    expect(computeTopicMastery(GRAPH, MASTERY, 1)).toHaveLength(1);
  });
});

describe("weakestConcept", () => {
  it("picks the concept blocking the most students", () => {
    expect(weakestConcept(GRAPH, MASTERY)?.conceptId).toBe("common-denominators");
    expect(weakestConcept(GRAPH, MASTERY)?.blocked).toBe(2);
  });

  it("returns null when nothing is blocking", () => {
    const mastered: MasteryByStudent = {
      a: [cm("equivalent-fractions", 0.95)],
    };
    expect(weakestConcept(GRAPH, mastered)).toBeNull();
  });
});

describe("computeInsight", () => {
  it("names the blocking concept and the share of the class", () => {
    const insight = computeInsight(GRAPH, STUDENTS, MASTERY);
    expect(insight).toContain("Common denominators");
    expect(insight).toContain("67%");
    expect(insight).toContain("2 students are flagged");
  });

  it("says so when the class is on top of the course", () => {
    const insight = computeInsight(GRAPH, [student("a", 0.95)], {
      a: [cm("equivalent-fractions", 0.95)],
    });
    expect(insight).toContain("on top of Fractions");
  });

  it("handles an empty class", () => {
    expect(computeInsight(GRAPH, [], {})).toBe("No students enrolled yet.");
  });
});

describe("studentsNeedingAttention", () => {
  it("lists flagged and low-mastery students, weakest first", () => {
    expect(studentsNeedingAttention(STUDENTS).map((s) => s.id)).toEqual(["c", "b"]);
  });
});
