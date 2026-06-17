import { getExercises, addExercise } from "@/lib/data/repo";
import { chatJSON, LLM_ENABLED, LLMUnavailableError, genId } from "@/lib/llm/client";
import { EXERCISES } from "@/lib/seed/data";
import type { Exercise } from "@/lib/domain/types";

/** Resolve or generate the next exercise for a concept. */
export async function getNextExercise(conceptId: string): Promise<Exercise> {
  const seeded = await getExercises(conceptId);
  if (seeded.length > 0) return seeded[0];

  if (LLM_ENABLED) {
    try {
      const generated = await chatJSON<Exercise>(
        [
          {
            role: "system",
            content:
              'You are Mira, an AI math tutor. Generate a grade-7 fractions exercise. Return JSON: { "id": string, "conceptId": string, "kind": "practice", "prompt": string, "expression": string, "difficulty": number, "answer": string, "steps": string[] }',
          },
          {
            role: "user",
            content: `Generate a difficulty-4 exercise for concept: ${conceptId}. id starts with "ex-gen-". difficulty 1-10.`,
          },
        ],
        { temperature: 0.7, maxTokens: 500 },
      );
      const ex: Exercise = { ...generated, id: genId("ex-gen") };
      await addExercise(ex);
      return ex;
    } catch (e) {
      if (!(e instanceof LLMUnavailableError)) throw e;
    }
  }

  return EXERCISES[0];
}
