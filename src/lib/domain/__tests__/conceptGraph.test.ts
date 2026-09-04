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

// ── Graph-aware helpers ──────────────────────────────────────────────
// These guard the "uploaded course never reaches the student" bug: helpers
// used to be bound to the built-in fractions graph, so a published course's
// concepts resolved to nothing.

import { conceptsById } from "../conceptGraph";
import type { ConceptGraph } from "../types";

const PUBLISHED: ConceptGraph = {
  topic: "Photosynthesis",
  concepts: [
    {
      id: "light-energy",
      label: "Light energy",
      prerequisites: [],
      blurb: "Where the energy comes from.",
      layout: { col: 0, row: 0 },
    },
    {
      id: "chlorophyll",
      label: "Chlorophyll",
      prerequisites: ["light-energy"],
      blurb: "The pigment that captures light.",
      layout: { col: 1, row: 0 },
    },
  ],
};

describe("conceptsById", () => {
  it("indexes whichever graph it is given", () => {
    const byId = conceptsById(PUBLISHED);
    expect(Object.keys(byId)).toEqual(["light-energy", "chlorophyll"]);
    expect(byId["chlorophyll"].label).toBe("Chlorophyll");
  });
});

describe("conceptLabel / prerequisitesOf with a published graph", () => {
  it("resolves concepts from the published graph", () => {
    expect(conceptLabel("chlorophyll", PUBLISHED)).toBe("Chlorophyll");
    expect(prerequisitesOf("chlorophyll", PUBLISHED)).toEqual(["light-energy"]);
  });

  it("does not leak fractions concepts into another course", () => {
    expect(conceptLabel("mixed-numbers", PUBLISHED)).toBe("mixed-numbers");
    expect(prerequisitesOf("adding-unlike-fractions", PUBLISHED)).toEqual([]);
  });

  it("still defaults to the built-in fractions graph", () => {
    expect(conceptLabel("mixed-numbers")).toBe("Mixed numbers");
    expect(prerequisitesOf("comparing-fractions")).toEqual([
      "common-denominators",
    ]);
  });
});
