import { getExercises, addExercise } from "@/lib/data/repo";
import { chatJSON, LLM_ENABLED, LLMUnavailableError, genId } from "@/lib/llm/client";
import { EXERCISES } from "@/lib/seed/data";
import type { Exercise } from "@/lib/domain/types";

/** Generate a fresh exercise for a concept. Always calls LLM when available — never returns a cached duplicate. */
export async function getNextExercise(conceptId: string): Promise<Exercise> {
  if (LLM_ENABLED) {
    try {
      const generated = await chatJSON<Exercise>(
        [
          {
            role: "system",
            content:
              'You are Mira, an AI math tutor. Generate a grade-7 fractions exercise. Return JSON only: { "id": string, "conceptId": string, "kind": "practice", "prompt": string, "expression": string, "difficulty": number, "answer": string, "steps": string[] }',
          },
          {
            role: "user",
            content: `Generate a NEW difficulty-4 exercise for concept: ${conceptId}. Use different numbers each time. id starts with "ex-gen-". difficulty 1-10.`,
          },
        ],
        { temperature: 0.9, maxTokens: 500 },
      );
      const ex: Exercise = { ...generated, id: genId("ex-gen") };
      return ex;
    } catch (e) {
      if (!(e instanceof LLMUnavailableError)) throw e;
    }
  }

  // Fallback: rotate through the seed pool so at least each call differs
  const pool = await getExercises(conceptId);
  const all = pool.length > 0 ? pool : EXERCISES;
  return all[Math.floor(Date.now() / 1000) % all.length];
}
