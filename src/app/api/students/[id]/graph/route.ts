export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStudent, getMastery, getConceptGraph } from "@/lib/data/repo";
import { prerequisitesOf } from "@/lib/domain/conceptGraph";
import { MISCONCEPTIONS } from "@/lib/seed/data";
import type { StudentGraphResponse } from "@/lib/domain/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const [student, masteryList] = await Promise.all([
      getStudent(id),
      getMastery(id),
    ]);

    if (!student) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
    }

    const graph = getConceptGraph();
    const focusConceptId = student.currentConceptId;

    // Build mastery map for fast lookup
    const masteryById = Object.fromEntries(
      masteryList.map((m) => [m.conceptId, m]),
    );

    // Prerequisites of the focus concept with their mastery
    const prereqIds = prerequisitesOf(focusConceptId);
    const prerequisites = prereqIds.map((cid) => {
      const entry = masteryById[cid];
      if (entry) return entry;
      return {
        conceptId: cid,
        mastery: 0,
        status: "not-started" as const,
        attempts: 0,
      };
    });

    // Tutor note — use misconception fix if available for the concept or a prereq
    const relevantMisc =
      MISCONCEPTIONS.find((m) => m.conceptId === focusConceptId) ??
      MISCONCEPTIONS.find((m) => prereqIds.includes(m.conceptId));

    const tutorNote = relevantMisc
      ? relevantMisc.fix
      : "Keep practising — work through each prerequisite step before attempting harder exercises.";

    const overallMastery = student.overallMastery;

    const resp: StudentGraphResponse = {
      student,
      graph,
      mastery: masteryList,
      overallMastery,
      focusConceptId,
      detail: {
        conceptId: focusConceptId,
        prerequisites,
        tutorNote,
      },
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[students/graph]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
