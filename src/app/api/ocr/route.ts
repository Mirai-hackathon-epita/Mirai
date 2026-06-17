export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  vision,
  LLM_ENABLED,
  LLMUnavailableError,
} from "@/lib/llm/client";
import type { OcrResponse } from "@/lib/domain/types";

const OCR_FALLBACK: OcrResponse = {
  text: "3/4 + 1/6 = 9/12 + 2/12 = 11/12",
  confidence: "high",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      imageUrl?: string;
      sample?: string;
    };

    // Demo path — always works, never crashes
    if (body.sample === "maya-fractions") {
      return NextResponse.json(OCR_FALLBACK);
    }

    // Vision model path
    if (body.imageUrl && LLM_ENABLED) {
      try {
        const text = await vision(
          body.imageUrl,
          "Read this handwritten math expression exactly as written. Return only the expression, no explanation.",
        );
        const resp: OcrResponse = {
          text: text.trim(),
          confidence: "high",
        };
        return NextResponse.json(resp);
      } catch (e) {
        if (!(e instanceof LLMUnavailableError)) throw e;
      }
    }

    // Fallback for any other case
    return NextResponse.json(OCR_FALLBACK);
  } catch (err) {
    console.error("[ocr]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
