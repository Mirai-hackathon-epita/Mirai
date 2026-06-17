export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStudent, getMastery } from "@/lib/data/repo";
import {
  chat,
  LLM_ENABLED,
  LLMUnavailableError,
} from "@/lib/llm/client";
import { pct } from "@/lib/domain/mastery";
import type { ChatResponse } from "@/lib/domain/types";

const FALLBACK_REPLY =
  "Try finding what number both denominators divide into evenly — that's the common denominator. Then rewrite each fraction before adding.";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = (await req.json()) as { message?: string };
    const message = body.message?.trim() ?? "";

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const [student, masteryList] = await Promise.all([
      getStudent(id),
      getMastery(id),
    ]);

    if (!student) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
    }

    let reply: string;

    if (LLM_ENABLED) {
      try {
        const conceptMastery = masteryList.find(
          (m) => m.conceptId === student.currentConceptId,
        );
        const masteryPct = conceptMastery ? pct(conceptMastery.mastery) : pct(student.overallMastery);

        reply = await chat(
          [
            {
              role: "system",
              content: `You are Mira, a patient math tutor for grade 7. The student is working on fractions (adding unlike fractions). You know their current concept is ${student.currentConceptId} and their mastery is ${masteryPct}%. Answer helpfully and briefly. Never give away the answer directly.`,
            },
            { role: "user", content: message },
          ],
          { temperature: 0.6, maxTokens: 300 },
        );
      } catch (e) {
        if (!(e instanceof LLMUnavailableError)) throw e;
        reply = FALLBACK_REPLY;
      }
    } else {
      reply = FALLBACK_REPLY;
    }

    const resp: ChatResponse = { reply };
    return NextResponse.json(resp);
  } catch (err) {
    console.error("[students/chat]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
