// Regression suite for the "generated exercise is graded against the wrong
// problem" bug: the agent returned an LLM-generated exercise without saving
// it, so the submit route could not resolve it by id and silently fell back
// to a seed exercise.

import type { Exercise } from "@/lib/domain/types";

function makeMemStore() {
  const data = new Map<string, unknown>();
  return {
    data,
    backend: "memory" as const,
    async getJSON<T>(key: string): Promise<T | null> {
      return data.has(key) ? (data.get(key) as T) : null;
    },
    async setJSON(key: string, value: unknown): Promise<void> {
      data.set(key, value);
    },
    async del(key: string): Promise<void> {
      data.delete(key);
    },
    async exists(key: string): Promise<boolean> {
      return data.has(key);
    },
    async listUnshift(key: string, value: unknown): Promise<void> {
      const arr = (data.get(key) as unknown[]) ?? [];
      data.set(key, [value, ...arr]);
    },
    async listRange<T>(key: string, start = 0, stop = -1): Promise<T[]> {
      const arr = (data.get(key) as T[]) ?? [];
      const end = stop === -1 ? arr.length : stop + 1;
      return arr.slice(start, end);
    },
  };
}

let mockStore = makeMemStore();

jest.mock("@/lib/store/kv", () => ({
  kv: () => mockStore,
}));

// One seeded repo for the whole file. `ensureSeeded` memoises its promise at
// module scope, so swapping the store per test would leave the module thinking
// it had already seeded the (now empty) replacement.
let repo!: typeof import("../repo");

beforeAll(async () => {
  mockStore = makeMemStore();
  repo = await import("../repo");
  await repo.ensureSeeded();
});

const generated: Exercise = {
  id: "ex-gen-abc123",
  conceptId: "adding-unlike-fractions",
  kind: "practice",
  prompt: "Add the fractions.",
  expression: "2/5 + 1/3 = ?",
  difficulty: 4,
  answer: "11/15",
  steps: ["Common denominator: 15", "6/15 + 5/15", "11/15"],
};

describe("addExercise / getExerciseById", () => {
  it("round-trips a generated exercise", async () => {
    const { addExercise, getExerciseById } = repo;
    await addExercise(generated);
    expect(await getExerciseById(generated.id)).toEqual(generated);
  });

  it("still resolves seeded exercises", async () => {
    const { getExercises, getExerciseById } = repo;
    const seeded = await getExercises();
    expect(seeded.length).toBeGreaterThan(0);
    expect(await getExerciseById(seeded[0].id)).toEqual(seeded[0]);
  });

  it("returns null for an unknown id so the caller can refuse to grade", async () => {
    const { getExerciseById } = repo;
    expect(await getExerciseById("ex-does-not-exist")).toBeNull();
  });

  it("writes each generated exercise under its own key (no shared-list race)", async () => {
    const { addExercise, getExerciseById } = repo;
    const many = Array.from({ length: 20 }, (_, i) => ({
      ...generated,
      id: `ex-gen-${i}`,
    }));
    await Promise.all(many.map(addExercise));
    for (const ex of many) {
      expect(await getExerciseById(ex.id)).toEqual(ex);
    }
  });

  it("keeps generated exercises out of the seeded fallback pool", async () => {
    const { addExercise, getExercises } = repo;
    const before = (await getExercises()).length;
    await addExercise(generated);
    expect((await getExercises()).length).toBe(before);
  });
});
