export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStudent, getMastery, pushCallRequest } from "@/lib/data/repo";
import { genId } from "@/lib/llm/client";
import type { CallRequest } from "@/lib/domain/types";

export async function POST(
  req: NextRequest,
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

    // Build a detail string from flag or mastery context.
    let detail: string;
    if (student.flag?.detail) {
      detail = student.flag.detail;
    } else {
      const cm = masteryList.find(
        (m) => m.conceptId === student.currentConceptId,
      );
      if (cm) {
        const pct = Math.round(cm.mastery * 100);
        detail = `${pct}% mastery on ${student.currentConceptId}`;
      } else {
        detail = `Working on ${student.currentTopicLabel}`;
      }
    }

    const callRequest: CallRequest = {
      id: genId("call"),
      studentId: id,
      conceptId: student.currentConceptId,
      studentName: student.name,
      currentTopicLabel: student.currentTopicLabel,
      detail,
      lastDiagnosis: detail,
      ts: Date.now(),
      status: "open",
    };

    await pushCallRequest(callRequest);

    return NextResponse.json({ callRequest });
  } catch (err) {
    console.error("[students/call]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
