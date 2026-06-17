import { NextResponse } from "next/server";
import {
  getActiveCourse,
  saveCourse,
  getActiveConceptGraph,
  getStudents,
  getMastery,
  saveMastery,
  getActivity,
  saveActivity,
} from "@/lib/data/repo";
import { genId } from "@/lib/llm/client";
import type { ConceptMastery, PublishCourseResponse } from "@/lib/domain/types";

export const dynamic = "force-dynamic";

/** Determine initial mastery status for a concept given its prerequisites. */
function initialStatus(
  conceptId: string,
  prerequisites: string[],
  existingMastery: ConceptMastery[],
): ConceptMastery["status"] {
  if (prerequisites.length === 0) return "not-started";
  const masteryById = Object.fromEntries(
    existingMastery.map((m) => [m.conceptId, m]),
  );
  const allPrereqsMet = prerequisites.every((prereqId) => {
    const m = masteryById[prereqId];
    return m && m.status === "mastered";
  });
  return allPrereqsMet ? "not-started" : "locked";
}

export async function POST() {
  // Load the active course
  const course = await getActiveCourse();
  if (!course) {
    return NextResponse.json({ error: "No active course found" }, { status: 404 });
  }
  if (course.status === "draft" || course.status === "enriching") {
    return NextResponse.json(
      { error: "Course must be enriched before publishing" },
      { status: 400 },
    );
  }

  // Mark published
  const published = {
    ...course,
    status: "published" as const,
    publishedAt: Date.now(),
  };
  await saveCourse(published);

  // Load the concept graph
  const graph = await getActiveConceptGraph();

  // Seed mastery rows for every student over the new concepts
  const students = await getStudents();

  for (const student of students) {
    const existing = await getMastery(student.id);
    const existingById = Object.fromEntries(existing.map((m) => [m.conceptId, m]));

    // We process concepts in graph order so prerequisites come first
    const updatedMastery = [...existing];
    const updatedById: Record<string, ConceptMastery> = { ...existingById };

    for (const concept of graph.concepts) {
      if (updatedById[concept.id]) continue; // already has mastery row — preserve it

      const status = initialStatus(
        concept.id,
        concept.prerequisites,
        updatedMastery,
      );
      const row: ConceptMastery = {
        conceptId: concept.id,
        mastery: 0,
        status,
        attempts: 0,
      };
      updatedMastery.push(row);
      updatedById[concept.id] = row;
    }

    await saveMastery(student.id, updatedMastery);
  }

  // Append an activity item
  const activity = await getActivity();
  const newItem = {
    id: genId("act"),
    time: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    text: `Course published — **${graph.concepts.length} concepts** unlocked for ${students.length} students`,
  };
  await saveActivity([newItem, ...activity]);

  const response: PublishCourseResponse = { course: published };
  return NextResponse.json(response);
}
