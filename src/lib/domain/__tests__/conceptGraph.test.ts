import {
  FRACTIONS_GRAPH,
  CONCEPTS_BY_ID,
  conceptLabel,
  prerequisitesOf,
} from "../conceptGraph";

describe("FRACTIONS_GRAPH", () => {
  it("has a topic", () => {
    expect(FRACTIONS_GRAPH.topic).toBe("Fractions");
  });

  it("contains 9 concepts", () => {
    expect(FRACTIONS_GRAPH.concepts).toHaveLength(9);
  });

  it("every concept has id, label, prerequisites, and layout", () => {
    for (const c of FRACTIONS_GRAPH.concepts) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(Array.isArray(c.prerequisites)).toBe(true);
      expect(c.layout).toHaveProperty("col");
      expect(c.layout).toHaveProperty("row");
    }
  });

  it("root concepts have no prerequisites", () => {
    const roots = FRACTIONS_GRAPH.concepts.filter(
      (c) => c.prerequisites.length === 0,
    );
    expect(roots.length).toBeGreaterThan(0);
  });

  it("prerequisite ids reference existing concepts", () => {
    const ids = new Set(FRACTIONS_GRAPH.concepts.map((c) => c.id));
    for (const c of FRACTIONS_GRAPH.concepts) {
      for (const prereq of c.prerequisites) {
        expect(ids.has(prereq)).toBe(true);
      }
    }
  });
});

describe("CONCEPTS_BY_ID", () => {
  it("indexes all concepts by id", () => {
    expect(Object.keys(CONCEPTS_BY_ID)).toHaveLength(
      FRACTIONS_GRAPH.concepts.length,
    );
  });

  it("lookup returns the correct concept", () => {
    const c = CONCEPTS_BY_ID["adding-like-fractions"];
    expect(c.label).toBe("Adding like fractions");
  });
});

describe("conceptLabel", () => {
  it("returns label for known id", () => {
    expect(conceptLabel("mixed-numbers")).toBe("Mixed numbers");
  });

  it("falls back to id for unknown concept", () => {
    expect(conceptLabel("unknown-concept")).toBe("unknown-concept");
  });
});

describe("prerequisitesOf", () => {
  it("returns prerequisites for a known concept", () => {
    const prereqs = prerequisitesOf("common-denominators");
    expect(prereqs).toContain("equivalent-fractions");
    expect(prereqs).toContain("multiples-factors");
  });

  it("returns empty array for root concept", () => {
    expect(prerequisitesOf("whole-number-operations")).toEqual([]);
  });

  it("returns empty array for unknown id", () => {
    expect(prerequisitesOf("does-not-exist")).toEqual([]);
  });
});
