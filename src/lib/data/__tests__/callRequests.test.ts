// Unit tests for call-request push/resolve repo helpers.
// Uses an in-memory KV store (no Redis required).

import type { CallRequest } from "../../domain/types";

// Reset the KV singleton before each test to get a fresh in-memory store.
const globalAny = globalThis as Record<string, unknown>;

function resetKv() {
  delete globalAny.__miraKv;
}

// Re-require the repo after each reset so the KV singleton is fresh.
async function freshRepo() {
  jest.resetModules();
  resetKv();
  const repo = await import("../repo");
  return repo;
}

const base: Omit<CallRequest, "id" | "ts"> = {
  studentId: "maya",
  conceptId: "adding-unlike-fractions",
  status: "open",
  lastDiagnosis: "Stuck on denominator alignment",
};

describe("getCallRequests / pushCallRequest / resolveCallRequest", () => {
  it("returns an empty array initially", async () => {
    const { getCallRequests } = await freshRepo();
    const list = await getCallRequests();
    expect(list).toEqual([]);
  });

  it("pushes a call request and retrieves it", async () => {
    const { getCallRequests, pushCallRequest } = await freshRepo();

    await pushCallRequest({ ...base, id: "call-test-1", ts: 1700000000000 });
    const list = await getCallRequests();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("call-test-1");
    expect(list[0].status).toBe("open");
  });

  it("pushes multiple requests and keeps newest-first order", async () => {
    const { getCallRequests, pushCallRequest } = await freshRepo();

    await pushCallRequest({ ...base, id: "call-a", ts: 1000 });
    await pushCallRequest({ ...base, id: "call-b", ts: 2000 });

    const list = await getCallRequests();
    expect(list[0].id).toBe("call-b"); // newest first (unshift)
    expect(list[1].id).toBe("call-a");
  });

  it("resolves a request by id, leaving others intact", async () => {
    const { getCallRequests, pushCallRequest, resolveCallRequest } =
      await freshRepo();

    await pushCallRequest({ ...base, id: "call-1", ts: 1000 });
    await pushCallRequest({ ...base, id: "call-2", ts: 2000 });

    await resolveCallRequest("call-1");

    const list = await getCallRequests();
    const r1 = list.find((r) => r.id === "call-1")!;
    const r2 = list.find((r) => r.id === "call-2")!;

    expect(r1.status).toBe("resolved");
    expect(r2.status).toBe("open");
  });

  it("resolving an unknown id is a no-op", async () => {
    const { getCallRequests, pushCallRequest, resolveCallRequest } =
      await freshRepo();

    await pushCallRequest({ ...base, id: "call-x", ts: 1000 });
    await resolveCallRequest("does-not-exist");

    const list = await getCallRequests();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe("open");
  });
});
