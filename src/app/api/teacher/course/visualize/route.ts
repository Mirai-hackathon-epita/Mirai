import { NextRequest, NextResponse } from "next/server";
import { chatJSON, LLM_ENABLED } from "@/lib/llm/client";
import type { VisualizationSpec } from "@/lib/domain/types";

export const dynamic = "force-dynamic";

const SEED_NUMBER_LINE: VisualizationSpec = {
  kind: "number-line",
  title: "¾ + ⅙ on the number line",
  markers: [
    { value: 0.75, label: "¾", color: "#C2533A" },
    { value: 0.167, label: "⅙", color: "#2C4ADF" },
    { value: 0.917, label: "11/12", color: "#5C8A6E" },
  ],
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    conceptId?: string;
    currentKind?: string;
    expression?: string;
    answer?: string;
  };
  const conceptId = body.conceptId ?? "adding-unlike-fractions";
  const currentKind = body.currentKind;
  const expression = body.expression ?? "";
  const answer = body.answer ?? "";

  if (!LLM_ENABLED) {
    // Seed fallback: always return a number-line (unless that's already shown)
    const fallback: VisualizationSpec =
      currentKind === "number-line"
        ? {
            kind: "area-model",
            title: "¾ + ⅙ as an area model",
            parts: [
              { label: "¾", color: "#C2533A", size: 75 },
              { label: "⅙", color: "#2C4ADF", size: 17 },
              { label: "remaining", color: "#E7E5E1", size: 8 },
            ],
          }
        : SEED_NUMBER_LINE;
    return NextResponse.json({ visualization: fallback });
  }

  try {
    const viz = await chatJSON<VisualizationSpec>(
      [
        {
          role: "system",
          content:
            "You are Mira, an adaptive math tutor. Generate an interactive visualization spec to help a grade-7 student understand a specific fractions problem. Use the exact numbers from the exercise. Return JSON only.",
        },
        {
          role: "user",
          content:
            `Exercise: "${expression || conceptId}"` +
            (answer ? ` — answer: ${answer}` : "") +
            `\n\n` +
            (currentKind
              ? `The student already has a ${currentKind} visualization — generate a DIFFERENT type. `
              : "") +
            `Return ONE of these exact JSON shapes, using the actual numbers from the exercise:\n` +
            `- {"kind":"number-line","title":"...","markers":[{"value":0.75,"label":"3/4","color":"#C2533A"},{"value":0.167,"label":"1/6","color":"#2C4ADF"},{"value":0.917,"label":"11/12","color":"#5C8A6E"}]}\n` +
            `- {"kind":"area-model","title":"...","parts":[{"label":"3/4","color":"#C2533A","size":75},{"label":"1/4 remaining","color":"#E7E5E1","size":25}]}\n` +
            `marker "value" fields must be decimals between 0 and 1. "size" fields must sum to 100.`,
        },
      ],
      { temperature: 0.6, maxTokens: 400 },
    );

    // Validate the returned kind is one we know
    if (viz.kind !== "number-line" && viz.kind !== "area-model") {
      return NextResponse.json({ visualization: SEED_NUMBER_LINE });
    }

    return NextResponse.json({ visualization: viz });
  } catch {
    // On any LLM failure fall back to the seed
    return NextResponse.json({ visualization: SEED_NUMBER_LINE });
  }
}
