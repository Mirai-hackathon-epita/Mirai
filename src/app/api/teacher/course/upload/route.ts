import { NextRequest, NextResponse } from "next/server";
import { chatJSON, genId, LLM_ENABLED } from "@/lib/llm/client";
import { saveCourse, saveActiveConceptGraph } from "@/lib/data/repo";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import type {
  Concept,
  ConceptGraph,
  Course,
  UploadCourseResponse,
  VisualizationSpec,
} from "@/lib/domain/types";

export const dynamic = "force-dynamic";

// ─── Fallback data ────────────────────────────────────────────────────

const FALLBACK_VIZ_1: VisualizationSpec = {
  kind: "number-line",
  title: "Fractions on the number line",
  markers: [
    { value: 0.25, label: "¼", color: "#C2533A" },
    { value: 0.5, label: "½", color: "#2C4ADF" },
    { value: 0.75, label: "¾", color: "#5C8A6E" },
  ],
};

const FALLBACK_VIZ_2: VisualizationSpec = {
  kind: "area-model",
  title: "Equivalent fractions as area",
  parts: [
    { label: "½", color: "#C2533A", size: 50 },
    { label: "= 2/4", color: "#2C4ADF", size: 50 },
  ],
};

const FALLBACK_STEPS = [
  "Planned enrichment pipeline",
  "Parsed course text",
  "Extracted 9 concepts (fallback graph — LLM offline)",
  "Built prerequisite edges from domain model",
  "Generated 2 visualizations (seed fallback)",
  "Course ready to review",
];

// ─── Prompt templates ────────────────────────────────────────────────

function buildEnrichmentPrompt(text: string): string {
  return (
    `You are Mira, an autonomous AI tutor agent. Analyze this course text and extract a concept prerequisite graph (DAG) plus visualizations.\n\n` +
    `COURSE TEXT:\n${text.slice(0, 4000)}\n\n` +
    `Return ONLY valid JSON matching this exact schema:\n` +
    `{\n` +
    `  "topic": "string (e.g. Fractions)",\n` +
    `  "concepts": [\n` +
    `    {\n` +
    `      "id": "kebab-case-id",\n` +
    `      "label": "Human readable label",\n` +
    `      "prerequisites": ["array", "of", "other", "concept", "ids"],\n` +
    `      "blurb": "One-line description for students.",\n` +
    `      "layout": { "col": 0, "row": 0 }\n` +
    `    }\n` +
    `  ],\n` +
    `  "visualizations": [\n` +
    `    { "kind": "number-line", "title": "...", "markers": [{ "value": 0.5, "label": "½", "color": "#C2533A" }] },\n` +
    `    { "kind": "area-model", "title": "...", "parts": [{ "label": "½", "color": "#C2533A", "size": 50 }] }\n` +
    `  ]\n` +
    `}\n\n` +
    `Rules:\n` +
    `- Extract 5–12 concepts in a logical prerequisite order (simpler → complex).\n` +
    `- Root concepts (no prerequisites) go in col 0. Each level deeper = higher col.\n` +
    `- Row is the vertical position within a column (0-indexed).\n` +
    `- Generate exactly 2 visualizations for the most important concepts.\n` +
    `- Use only colors: #C2533A, #2C4ADF, #5C8A6E, #E7E5E1, #C28A2C.\n` +
    `- Prerequisites must reference concept ids defined in the same list.`
  );
}

// ─── Validation helpers ──────────────────────────────────────────────

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

function isValidViz(v: unknown): v is VisualizationSpec {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    (obj.kind === "number-line" && Array.isArray(obj.markers)) ||
    (obj.kind === "area-model" && Array.isArray(obj.parts)) ||
    (obj.kind === "fraction-bars" && Array.isArray(obj.rows))
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
  // Ensure prerequisite ids actually exist in the list
  const ids = new Set(concepts.map((c) => c.id));
  const safe = concepts.map((c) => ({
    ...c,
    prerequisites: c.prerequisites.filter((p) => ids.has(p)),
  }));
  return { topic, concepts: safe };
}

// ─── Handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    text?: string;
    sourceName?: string;
  };

  const text = (body.text ?? "").trim();
  const sourceName = (body.sourceName ?? "Uploaded course").trim();
  const courseId = genId("course");

  // Transition: draft → enriching
  const draft: Course = {
    id: courseId,
    sourceName,
    text,
    status: "enriching",
    createdAt: Date.now(),
  };
  await saveCourse(draft);

  // ── Offline / no-LLM fallback ──────────────────────────────────────
  if (!LLM_ENABLED || !text) {
    const course: Course = {
      ...draft,
      status: "enriched",
      enrichedAt: Date.now(),
    };
    await saveCourse(course);
    await saveActiveConceptGraph(FRACTIONS_GRAPH);
    const response: UploadCourseResponse = {
      course,
      graph: FRACTIONS_GRAPH,
      visualizations: [FALLBACK_VIZ_1, FALLBACK_VIZ_2],
      agentSteps: FALLBACK_STEPS,
    };
    return NextResponse.json(response);
  }

  // ── LLM enrichment loop ────────────────────────────────────────────
  const agentSteps: string[] = [];
  try {
    agentSteps.push("Planned enrichment pipeline");
    agentSteps.push(`Parsing course text (${text.length} characters)`);

    const raw = await chatJSON<{
      topic?: string;
      concepts?: unknown[];
      visualizations?: unknown[];
    }>(
      [
        {
          role: "system",
          content:
            "You are Mira, an autonomous AI tutor agent specializing in concept graph extraction. Return only valid JSON.",
        },
        {
          role: "user",
          content: buildEnrichmentPrompt(text),
        },
      ],
      { temperature: 0.3, maxTokens: 2000 },
    );

    const graph = sanitizeGraph(raw, sourceName);
    agentSteps.push(`Extracted ${graph.concepts.length} concepts`);

    // Count prerequisite edges
    const edgeCount = graph.concepts.reduce(
      (acc, c) => acc + c.prerequisites.length,
      0,
    );
    agentSteps.push(`Built ${edgeCount} prerequisite edges`);

    // Extract visualizations from the same LLM response
    const rawVizs = Array.isArray(raw.visualizations) ? raw.visualizations : [];
    const vizs: VisualizationSpec[] = rawVizs
      .filter(isValidViz)
      .slice(0, 2);

    if (vizs.length < 2) {
      // Pad with fallbacks so we always return 2
      const needed = 2 - vizs.length;
      if (needed >= 1) vizs.push(FALLBACK_VIZ_1);
      if (needed >= 2) vizs.push(FALLBACK_VIZ_2);
    }
    agentSteps.push(`Generated ${vizs.length} visualizations`);

    agentSteps.push("Saved concept graph to persistent store");

    const course: Course = {
      ...draft,
      status: "enriched",
      enrichedAt: Date.now(),
    };
    await saveCourse(course);
    await saveActiveConceptGraph(graph);

    agentSteps.push("Course ready — review and publish");

    const response: UploadCourseResponse = {
      course,
      graph,
      visualizations: vizs,
      agentSteps,
    };
    return NextResponse.json(response);
  } catch {
    // Any LLM failure: fall back gracefully
    const course: Course = {
      ...draft,
      status: "enriched",
      enrichedAt: Date.now(),
    };
    await saveCourse(course);
    await saveActiveConceptGraph(FRACTIONS_GRAPH);

    const response: UploadCourseResponse = {
      course,
      graph: FRACTIONS_GRAPH,
      visualizations: [FALLBACK_VIZ_1, FALLBACK_VIZ_2],
      agentSteps: [
        ...agentSteps,
        "LLM enrichment failed — using built-in fractions graph",
        "Course ready to review (fallback)",
      ],
    };
    return NextResponse.json(response);
  }
}
