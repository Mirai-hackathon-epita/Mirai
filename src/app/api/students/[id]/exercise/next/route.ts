export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStudent, peekReprobe, popReprobe, getExerciseById } from "@/lib/data/repo";
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

    // ── Re-probe pickup ──────────────────────────────────────────────
    // If the teacher marked a concept as re-taught, surface the queued probe
    // exercise first — before the normal adaptive planning loop.
    const pendingExId = await peekReprobe(id);
    if (pendingExId) {
      const reprobe = await getExerciseById(pendingExId);
      if (reprobe) {
        // Consume this entry from the queue so the next call advances normally.
        await popReprobe(id);
        const resp: NextExerciseResponse = {
          exercise: reprobe,
          progress: { index: 3, total: 8 },
        };
        return NextResponse.json(resp);
      }
      // Exercise id dangling (race / data loss) — pop and fall through.
      await popReprobe(id);
    }

    // ── Normal adaptive planning ─────────────────────────────────────
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

