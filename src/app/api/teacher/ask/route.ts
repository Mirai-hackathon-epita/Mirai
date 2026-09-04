export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  describeClass,
  getClassSnapshot,
} from "@/lib/agent/classSnapshot";
import { chat, LLM_ENABLED, LLMUnavailableError } from "@/lib/llm/client";
import type { AskResponse } from "@/lib/domain/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question?: string };
    const question = body.question?.trim() ?? "";

    if (!question) {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }

    // Same snapshot the dashboard renders, so the assistant and the cards
    // never disagree about the class.
    const snapshot = await getClassSnapshot();
    let answer = snapshot.computedInsight;

    if (LLM_ENABLED) {
      try {
        answer = await chat(
          [
            {
              role: "system",
              content:
                "You are Mirai, the autonomous AI tutor assistant. Answer the teacher's question using only the class data provided. Be concise and actionable. If the data does not cover the question, say so.",
            },
            {
              role: "user",
              content: `Class state:\n${describeClass(snapshot)}\n\nTeacher's question: ${question}`,
            },
          ],
          { temperature: 0.4, maxTokens: 400 },
        );
      } catch (e) {
        if (!(e instanceof LLMUnavailableError)) throw e;
        // keep the deterministic reading
      }
    }

    const resp: AskResponse = { answer };
    return NextResponse.json(resp);
  } catch (err) {
    console.error("[teacher/ask]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
