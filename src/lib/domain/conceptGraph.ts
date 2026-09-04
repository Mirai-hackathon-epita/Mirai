import type { Concept, ConceptGraph } from "./types";

// ─── Fractions concept prerequisite graph (DAG) ─────────────────────
// Hardcoded for the demo topic, mirroring the skill-graph screen exactly.
// Layout columns/rows match the four-column design (left → right = deeper).
//
//   col0 (foundations)       col1            col2 (focus)        col3 (locked)
//   whole-number-ops ┐
//   equivalent-frac  ┼──► common-denominators ─► adding-unlike ─► subtracting
//   multiples-factors┘     adding-like ────────►              └─► mixed-numbers
//                          └──────────────────► comparing ─────►

export const FRACTIONS_GRAPH: ConceptGraph = {
  topic: "Fractions",
  concepts: [
    {
      id: "whole-number-operations",
      label: "Whole-number operations",
      prerequisites: [],
      blurb: "Add, subtract, multiply and divide whole numbers fluently.",
      layout: { col: 0, row: 0 },
    },
    {
      id: "equivalent-fractions",
      label: "Equivalent fractions",
      prerequisites: ["whole-number-operations"],
      blurb: "Recognise and build fractions of equal value.",
      layout: { col: 0, row: 1 },
    },
    {
      id: "multiples-factors",
      label: "Multiples & factors",
      prerequisites: ["whole-number-operations"],
      blurb: "Find multiples, factors and the least common multiple.",
      layout: { col: 0, row: 2 },
    },
    {
      id: "common-denominators",
      label: "Common denominators",
      prerequisites: [
        "equivalent-fractions",
        "multiples-factors",
        "whole-number-operations",
      ],
      blurb:
        "Rewrite fractions over a shared denominator before combining them.",
      layout: { col: 1, row: 0 },
    },
    {
      id: "adding-like-fractions",
      label: "Adding like fractions",
      prerequisites: ["equivalent-fractions"],
      blurb: "Add fractions that already share a denominator.",
      layout: { col: 1, row: 1 },
    },
    {
      id: "adding-unlike-fractions",
      label: "Adding unlike fractions",
      prerequisites: ["common-denominators", "adding-like-fractions"],
      blurb:
        "Combine fractions with different denominators, then simplify.",
      layout: { col: 2, row: 0 },
    },
    {
      id: "comparing-fractions",
      label: "Comparing fractions",
      prerequisites: ["common-denominators"],
      blurb: "Order and compare fractions using a common denominator.",
      layout: { col: 2, row: 1 },
    },
    {
      id: "subtracting-fractions",
      label: "Subtracting fractions",
      prerequisites: ["adding-unlike-fractions"],
      blurb: "Subtract fractions with unlike denominators.",
      layout: { col: 3, row: 0 },
    },
    {
      id: "mixed-numbers",
      label: "Mixed numbers",
      prerequisites: ["adding-unlike-fractions", "comparing-fractions"],
      blurb: "Convert between improper fractions and mixed numbers.",
      layout: { col: 3, row: 1 },
    },
  ],
};

/** Index a graph's concepts by id. */
export function conceptsById(graph: ConceptGraph): Record<string, Concept> {
  return Object.fromEntries(graph.concepts.map((c) => [c.id, c]));
}

/** Index of the built-in fractions graph (the seeded default course). */
export const CONCEPTS_BY_ID = conceptsById(FRACTIONS_GRAPH);

// The helpers below take the graph they should read. It defaults to the
// built-in fractions graph, but any code serving a *published* course must
// pass the active graph (see repo.getActiveConceptGraph) — otherwise an
// uploaded course never reaches the student.

export function conceptLabel(
  id: string,
  graph: ConceptGraph = FRACTIONS_GRAPH,
): string {
  return conceptsById(graph)[id]?.label ?? id;
}

/** All prerequisite concept ids of a concept (direct edges only). */
export function prerequisitesOf(
  conceptId: string,
  graph: ConceptGraph = FRACTIONS_GRAPH,
): string[] {
  return conceptsById(graph)[conceptId]?.prerequisites ?? [];
}
