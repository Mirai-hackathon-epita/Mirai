// Tests for teacher-side repo accessors (Phase 0).
// Uses Jest module mocking so the KV store is in-memory and isolated per test.

// The mock factory references `store` via a module-level variable so we can
// replace the underlying store between test groups.

import type { CallRequest, Course, MasteryDeadline } from "../types";

// ── In-memory store implementation ──────────────────────────────────────────

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

// Shared mock store; replaced per suite via jest.isolateModules().
let mockStore = makeMemStore();

jest.mock("@/lib/store/kv", () => ({
  kv: () => mockStore,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a fresh repo import isolated from other tests. Each call creates a
 * new in-memory store so ensureSeeded() starts from scratch.
 */
async function freshRepo() {
  mockStore = makeMemStore();
  let repo!: typeof import("../../data/repo");
  // isolateModules ensures repo.ts module-level state (seeding promise) is fresh.
  await new Promise<void>((resolve, reject) => {
    jest.isolateModules(() => {
      import("../../data/repo")
        .then((m) => {
          repo = m as typeof import("../../data/repo");
          resolve();
        })
        .catch(reject);
    });
  });
  return repo;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("getActiveCourse", () => {
  it("returns a seeded published course backed by FRACTIONS_GRAPH", async () => {
    const { getActiveCourse } = await freshRepo();
    const course = await getActiveCourse();
    expect(course.topic).toBe("Fractions");
    expect(course.status).toBe("published");
    expect(course.id).toBeTruthy();
  });
});

describe("saveCourse / getActiveCourse round-trip", () => {
  it("persists and retrieves a course", async () => {
    const { saveCourse, getActiveCourse } = await freshRepo();
    // Trigger seeding first so it does not overwrite our save.
    await getActiveCourse();

    const course: Course = {
      id: "test-course-1",
      topic: "Algebra",
      sourceName: "Algebra 101",
      status: "draft",
      createdAt: 1000,
    };
    await saveCourse(course);
    const fetched = await getActiveCourse();
    expect(fetched.id).toBe("test-course-1");
    expect(fetched.topic).toBe("Algebra");
    expect(fetched.status).toBe("draft");
  });
});

describe("getActiveConceptGraph", () => {
  it("returns FRACTIONS_GRAPH from seed when no custom graph stored", async () => {
    const { getActiveConceptGraph } = await freshRepo();
    const graph = await getActiveConceptGraph();
    expect(graph.topic).toBe("Fractions");
    expect(graph.concepts.length).toBeGreaterThan(0);
  });
});

describe("saveActiveConceptGraph / getActiveConceptGraph round-trip", () => {
  it("persists and retrieves a custom graph", async () => {
    const { saveActiveConceptGraph, getActiveConceptGraph } = await freshRepo();
    // Trigger seeding first.
    await getActiveConceptGraph();

    const customGraph = {
      topic: "Algebra",
      concepts: [
        {
          id: "variables",
          label: "Variables",
          prerequisites: [],
          blurb: "Intro to variables.",
          layout: { col: 0, row: 0 },
        },
      ],
    };
    await saveActiveConceptGraph(customGraph);
    const fetched = await getActiveConceptGraph();
    expect(fetched.topic).toBe("Algebra");
    expect(fetched.concepts).toHaveLength(1);
    expect(fetched.concepts[0].id).toBe("variables");
  });
});

describe("getDeadline / saveDeadline", () => {
  it("returns null when no deadline is set", async () => {
    const { getDeadline } = await freshRepo();
    const d = await getDeadline();
    expect(d).toBeNull();
  });

  it("round-trips a saved deadline", async () => {
    const { saveDeadline, getDeadline } = await freshRepo();
    // Trigger seeding first.
    await getDeadline();

    const deadline: MasteryDeadline = {
      topic: "Fractions",
      date: "2026-07-01",
      setAt: 9999,
    };
    await saveDeadline(deadline);
    const fetched = await getDeadline();
    expect(fetched).not.toBeNull();
    expect(fetched!.topic).toBe("Fractions");
    expect(fetched!.date).toBe("2026-07-01");
    expect(fetched!.setAt).toBe(9999);
  });
});

describe("getCallRequests / pushCallRequest / resolveCallRequest", () => {
  it("starts with an empty list after seeding", async () => {
    const { getCallRequests } = await freshRepo();
    const reqs = await getCallRequests();
    expect(reqs).toEqual([]);
  });

  it("pushes and retrieves a call request", async () => {
    const { pushCallRequest, getCallRequests } = await freshRepo();
    // Trigger seeding first.
    await getCallRequests();

    const req: CallRequest = {
      id: "req-1",
      studentId: "maya",
      conceptId: "adding-unlike-fractions",
      ts: 12345,
      status: "open",
      lastDiagnosis: "Adds numerators and denominators directly.",
    };
    await pushCallRequest(req);
    const reqs = await getCallRequests();
    expect(reqs).toHaveLength(1);
    expect(reqs[0].id).toBe("req-1");
    expect(reqs[0].status).toBe("open");
  });

  it("resolves a call request by id", async () => {
    const { pushCallRequest, resolveCallRequest, getCallRequests } =
      await freshRepo();
    await getCallRequests(); // seed
    await pushCallRequest({
      id: "req-2",
      studentId: "alex",
      conceptId: "common-denominators",
      ts: 99999,
      status: "open",
    });
    await resolveCallRequest("req-2");
    const reqs = await getCallRequests();
    expect(reqs[0].status).toBe("resolved");
  });

  it("leaves unrelated requests unchanged when resolving", async () => {
    const { pushCallRequest, resolveCallRequest, getCallRequests } =
      await freshRepo();
    await getCallRequests(); // seed
    await pushCallRequest({
      id: "req-a",
      studentId: "maya",
      conceptId: "c1",
      ts: 1,
      status: "open",
    });
    await pushCallRequest({
      id: "req-b",
      studentId: "alex",
      conceptId: "c2",
      ts: 2,
      status: "open",
    });
    await resolveCallRequest("req-a");
    const reqs = await getCallRequests();
    const a = reqs.find((r) => r.id === "req-a")!;
    const b = reqs.find((r) => r.id === "req-b")!;
    expect(a.status).toBe("resolved");
    expect(b.status).toBe("open");
  });
});
