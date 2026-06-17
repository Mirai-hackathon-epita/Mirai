export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getClassStats,
  getInsight,
  getStudents,
} from "@/lib/data/repo";
import {
  chat,
  LLM_ENABLED,
  LLMUnavailableError,
} from "@/lib/llm/client";
import { CLASS_INSIGHT } from "@/lib/seed/data";
import type { AskResponse } from "@/lib/domain/types";
import { pct } from "@/lib/domain/mastery";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question?: string };
    const question = body.question?.trim() ?? "";

    if (!question) {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }

    let answer: string;

    if (LLM_ENABLED) {
      try {
        const [classStats, insight, students] = await Promise.all([
          getClassStats(),
          getInsight(),
          getStudents(),
        ]);

        const flaggedSummary = students
          .filter((s) => s.flag != null)
          .map(
            (s) =>
              `${s.name} (mastery ${pct(s.overallMastery)}%): ${s.flag!.detail}`,
          )
          .join("\n");

        const context = [
          `Class stats: average mastery ${pct(classStats.avgMastery)}%, ${classStats.needsAttention} students need attention.`,
          `Class insight: ${insight}`,
          flaggedSummary
            ? `Flagged students:\n${flaggedSummary}`
            : "No students flagged.",
        ].join("\n\n");

        answer = await chat(
          [
            {
              role: "system",
              content:
                "You are Mira, the autonomous AI tutor assistant. Answer the teacher's question about class progress using the data provided. Be concise and actionable.",
            },
            {
              role: "user",
              content: `Context:\n${context}\n\nTeacher's question: ${question}`,
            },
          ],
          { temperature: 0.4, maxTokens: 400 },
        );
      } catch (e) {
        if (!(e instanceof LLMUnavailableError)) throw e;
        answer = CLASS_INSIGHT;
      }
    } else {
      answer = CLASS_INSIGHT;
    }

    const resp: AskResponse = { answer };
    return NextResponse.json(resp);
  } catch (err) {
    console.error("[teacher/ask]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
