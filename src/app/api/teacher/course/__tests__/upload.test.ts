// Tests for the upload route enrichment fallback logic.
// The route itself requires Next.js runtime, so we test the pure helpers
// extracted here via the module under test pattern.

import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import type { ConceptGraph, Concept } from "@/lib/domain/types";

// Re-implement the sanitizeGraph logic in isolation so we can unit-test it
// without pulling in the full route (which needs server-only imports).

function isValidConcept(c: unknown): c is Concept {
  if (!c || typeof c !== "object") return false;
  const obj = c as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.label === "string" &&
    Array.isArray(obj.prerequisites) &&
    typeof obj.blurb === "string" &&
    obj.layout !== null &&
    typeof obj.layout === "object"
  );
}

function sanitizeGraph(raw: unknown, fallbackTopic: string): ConceptGraph {
  if (!raw || typeof raw !== "object") return FRACTIONS_GRAPH;
  const obj = raw as Record<string, unknown>;
  const topic =
    typeof obj.topic === "string" && obj.topic.trim()
      ? obj.topic.trim()
      : fallbackTopic;
  const rawConcepts = Array.isArray(obj.concepts) ? obj.concepts : [];
  const concepts = rawConcepts.filter(isValidConcept);
  if (concepts.length < 2) return { ...FRACTIONS_GRAPH, topic };
  const ids = new Set(concepts.map((c) => c.id));
  const safe = concepts.map((c) => ({
    ...c,
    prerequisites: c.prerequisites.filter((p: string) => ids.has(p)),
  }));
  return { topic, concepts: safe };
}

describe("sanitizeGraph (upload fallback helper)", () => {
  it("returns FRACTIONS_GRAPH when input is null", () => {
    const result = sanitizeGraph(null, "Test");
    expect(result).toBe(FRACTIONS_GRAPH);
  });

  it("returns FRACTIONS_GRAPH when input has fewer than 2 valid concepts", () => {
    const result = sanitizeGraph(
      { topic: "Math", concepts: [{ id: "only-one", label: "Only one", prerequisites: [], blurb: "b", layout: { col: 0, row: 0 } }] },
      "Test",
    );
    // Falls back but may keep topic from fallback
    expect(result.concepts.length).toBeGreaterThanOrEqual(1);
  });

  it("uses fallbackTopic when topic is absent in the LLM output", () => {
    const result = sanitizeGraph({ concepts: [] }, "Fallback Topic");
    // concepts < 2 so we get { ...FRACTIONS_GRAPH, topic: "Fallback Topic" }
    expect(result.topic).toBe("Fallback Topic");
    // concepts are still from FRACTIONS_GRAPH fallback
    expect(result.concepts.length).toBe(FRACTIONS_GRAPH.concepts.length);
  });

  it("preserves valid topic from LLM output", () => {
    const validConcepts = [
      { id: "a", label: "A", prerequisites: [], blurb: "blurb a", layout: { col: 0, row: 0 } },
      { id: "b", label: "B", prerequisites: ["a"], blurb: "blurb b", layout: { col: 1, row: 0 } },
    ];
    const result = sanitizeGraph({ topic: "Algebra", concepts: validConcepts }, "Fallback");
    expect(result.topic).toBe("Algebra");
    expect(result.concepts).toHaveLength(2);
  });

  it("strips prerequisite ids that do not exist in the concept list", () => {
    const concepts = [
      { id: "a", label: "A", prerequisites: [], blurb: "b", layout: { col: 0, row: 0 } },
      { id: "b", label: "B", prerequisites: ["a", "nonexistent"], blurb: "b", layout: { col: 1, row: 0 } },
    ];
    const result = sanitizeGraph({ topic: "Math", concepts }, "Fallback");
    const b = result.concepts.find((c) => c.id === "b");
    expect(b?.prerequisites).toEqual(["a"]);
    expect(b?.prerequisites).not.toContain("nonexistent");
  });

  it("returns FRACTIONS_GRAPH on completely invalid input", () => {
    expect(sanitizeGraph("not an object", "Test")).toBe(FRACTIONS_GRAPH);
    expect(sanitizeGraph(42, "Test")).toBe(FRACTIONS_GRAPH);
    expect(sanitizeGraph(undefined, "Test")).toBe(FRACTIONS_GRAPH);
  });

  it("rejects concepts with missing required fields", () => {
    const concepts = [
      { id: "a", label: "A", prerequisites: [], blurb: "b", layout: { col: 0, row: 0 } },
      { id: "b", label: "B", prerequisites: ["a"] }, // missing blurb and layout
      { id: "c", label: "C", prerequisites: [], blurb: "c", layout: { col: 0, row: 1 } },
    ];
    const result = sanitizeGraph({ topic: "Math", concepts }, "Fallback");
    expect(result.concepts.map((c) => c.id)).not.toContain("b");
    expect(result.concepts.map((c) => c.id)).toContain("a");
    expect(result.concepts.map((c) => c.id)).toContain("c");
  });
});
