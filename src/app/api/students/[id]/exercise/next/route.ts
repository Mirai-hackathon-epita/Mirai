export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStudent } from "@/lib/data/repo";
import { getNextExercise } from "@/lib/agent/exercise";
import type { NextExerciseResponse } from "@/lib/domain/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const student = await getStudent(id);
    if (!student) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
    }

    const exercise = await getNextExercise(student.currentConceptId);

    const resp: NextExerciseResponse = {
      exercise,
      progress: { index: 3, total: 8 },
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error("[exercise/next]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

