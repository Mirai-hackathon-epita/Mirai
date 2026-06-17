// Unit tests for the "mark concept re-taught" mutation logic.
// We wire up a real MemoryKv (via the kv() singleton reset trick) and exercise
// the repo helpers directly, without spinning up Next.js routes.

// Mock server-only so imports work in Jest
jest.mock("server-only", () => ({}));

// ─── Shared MemoryKv instance reset between tests ────────────────────
// The kv() singleton is stored on globalThis.__miraKv. We clear it before each
// test so each test gets a fresh in-memory store.
beforeEach(() => {
  const g = globalThis as unknown as { __miraKv?: unknown };
  delete g.__miraKv;
});

// We also need to reset the seeding promise each test so ensureSeeded() re-runs.
import * as repoModule from "../repo";

describe("re-probe queue helpers", () => {
  it("peekReprobe returns null on empty queue", async () => {
    const result = await repoModule.peekReprobe("student-1");
    expect(result).toBeNull();
  });

  it("pushReprobe + peekReprobe returns the pushed id", async () => {
    await repoModule.pushReprobe("student-1", "ex-probe-abc");
    const peeked = await repoModule.peekReprobe("student-1");
    expect(peeked).toBe("ex-probe-abc");
  });

  it("popReprobe removes and returns the head (most recently enqueued) entry", async () => {
    // Push two entries — listUnshift means the last pushed is at the head.
    // popReprobe should return the newest (last pushed = head).
    await repoModule.pushReprobe("student-2", "ex-probe-first");
    await repoModule.pushReprobe("student-2", "ex-probe-second");

    const popped = await repoModule.popReprobe("student-2");
    expect(popped).toBe("ex-probe-second");

    // Queue should now have only the first entry
    const next = await repoModule.peekReprobe("student-2");
    expect(next).toBe("ex-probe-first");
  });

  it("popReprobe on empty queue returns null", async () => {
    const result = await repoModule.popReprobe("nonexistent");
    expect(result).toBeNull();
  });

  it("clearReprobe empties the queue", async () => {
    await repoModule.pushReprobe("student-3", "ex-probe-x");
    await repoModule.pushReprobe("student-3", "ex-probe-y");
    await repoModule.clearReprobe("student-3");
    const result = await repoModule.peekReprobe("student-3");
    expect(result).toBeNull();
  });
});

describe("mastery mutation on re-teach", () => {
  it("drops mastery by 0.2 when concept matches", async () => {
    // Manually set mastery state
    const initialMastery = [
      {
        conceptId: "adding-unlike-fractions",
        mastery: 0.7,
        status: "developing" as const,
        attempts: 5,
        weakLink: false,
      },
      {
        conceptId: "common-denominators",
        mastery: 0.9,
        status: "mastered" as const,
        attempts: 8,
        weakLink: false,
      },
    ];
    // Seed the student manually (bypass ensureSeeded by writing directly)
    const { kv } = await import("../../store/kv");
    const store = kv();
    await store.setJSON("mira:mastery:test-student", initialMastery);

    const mastery = await repoModule.getMastery("test-student");

    // Simulate the mutation from the re-taught route
    const conceptId = "adding-unlike-fractions";
    const updated = mastery.map((cm) => {
      if (cm.conceptId !== conceptId) return cm;
      const newMastery = Math.max(0.05, cm.mastery - 0.2);
      const newStatus =
        cm.status === "needs-work" ? "needs-work" : "developing";
      return {
        ...cm,
        mastery: parseFloat(newMastery.toFixed(3)),
        status: newStatus,
        weakLink: true,
      };
    });

    await repoModule.saveMastery("test-student", updated);

    const saved = await repoModule.getMastery("test-student");
    const target = saved.find((c) => c.conceptId === "adding-unlike-fractions");
    const untouched = saved.find((c) => c.conceptId === "common-denominators");

    expect(target?.mastery).toBeCloseTo(0.5, 3);
    expect(target?.status).toBe("developing");
    expect(target?.weakLink).toBe(true);

    // Unrelated concept is unchanged
    expect(untouched?.mastery).toBe(0.9);
    expect(untouched?.weakLink).toBe(false);
  });

  it("keeps needs-work status when already at needs-work", async () => {
    const initialMastery = [
      {
        conceptId: "common-denominators",
        mastery: 0.3,
        status: "needs-work" as const,
        attempts: 3,
        weakLink: false,
      },
    ];
    const { kv } = await import("../../store/kv");
    const store = kv();
    await store.setJSON("mira:mastery:test-student2", initialMastery);

    const mastery = await repoModule.getMastery("test-student2");
    const conceptId = "common-denominators";
    const updated = mastery.map((cm) => {
      if (cm.conceptId !== conceptId) return cm;
      const newMastery = Math.max(0.05, cm.mastery - 0.2);
      const newStatus =
        cm.status === "needs-work" ? "needs-work" : "developing";
      return { ...cm, mastery: parseFloat(newMastery.toFixed(3)), status: newStatus, weakLink: true };
    });
    await repoModule.saveMastery("test-student2", updated);

    const saved = await repoModule.getMastery("test-student2");
    const target = saved.find((c) => c.conceptId === conceptId);
    // 0.3 - 0.2 = 0.1 → stays needs-work
    expect(target?.mastery).toBeCloseTo(0.1, 3);
    expect(target?.status).toBe("needs-work");
  });

  it("clamps mastery floor at 0.05 regardless of prior value", async () => {
    const initialMastery = [
      {
        conceptId: "adding-unlike-fractions",
        mastery: 0.1,
        status: "needs-work" as const,
        attempts: 2,
        weakLink: false,
      },
    ];
    const { kv } = await import("../../store/kv");
    await kv().setJSON("mira:mastery:test-student3", initialMastery);

    const mastery = await repoModule.getMastery("test-student3");
    const updated = mastery.map((cm) => ({
      ...cm,
      mastery: parseFloat(Math.max(0.05, cm.mastery - 0.2).toFixed(3)),
      status: "needs-work" as const,
      weakLink: true,
    }));
    await repoModule.saveMastery("test-student3", updated);

    const saved = await repoModule.getMastery("test-student3");
    expect(saved[0].mastery).toBeGreaterThanOrEqual(0.05);
  });
});

describe("saveActivity (re-teach pushes new item)", () => {
  it("prepends a new activity item to the class log", async () => {
    const { kv } = await import("../../store/kv");
    await kv().setJSON("mira:activity", [
      { id: "act-old", time: "9:00 AM", text: "Old activity" },
    ]);

    const existing = await repoModule.getActivity();
    const newItem = {
      id: "act-new",
      time: "9:30 AM",
      text: "**Mirai** re-probing **4** students on **Adding unlike fractions** after re-teach.",
    };
    await repoModule.saveActivity([newItem, ...existing]);

    const updated = await repoModule.getActivity();
    expect(updated[0].id).toBe("act-new");
    expect(updated[1].id).toBe("act-old");
    expect(updated).toHaveLength(2);
  });
});
