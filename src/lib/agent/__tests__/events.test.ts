import { makeEvent } from "../events";

describe("makeEvent", () => {
  it("returns event with correct studentId", () => {
    const ev = makeEvent("alice", "plan", "Planning exercise");
    expect(ev.studentId).toBe("alice");
  });

  it("returns event with correct kind", () => {
    const ev = makeEvent("bob", "grade", "Graded answer");
    expect(ev.kind).toBe("grade");
  });

  it("returns event with provided text", () => {
    const ev = makeEvent("carol", "reflect", "Reflecting on gaps");
    expect(ev.text).toBe("Reflecting on gaps");
  });

  it("id starts with ev-", () => {
    expect(makeEvent("x", "act", "text").id).toMatch(/^ev-/);
  });

  it("timestamp is a recent epoch ms value", () => {
    const before = Date.now();
    const ev = makeEvent("x", "reflect", "text");
    expect(ev.ts).toBeGreaterThanOrEqual(before);
    expect(ev.ts).toBeLessThanOrEqual(Date.now() + 100);
  });

  it("generates unique ids across calls", () => {
    const ids = Array.from({ length: 20 }, (_, i) =>
      makeEvent("s", "plan", `t${i}`).id,
    );
    expect(new Set(ids).size).toBe(20);
  });

  it("accepts all FeedKind values without throwing", () => {
    const kinds = [
      "plan", "generate", "act", "grade",
      "reflect", "diagnose", "escalate", "replan",
    ] as const;
    for (const kind of kinds) {
      expect(() => makeEvent("s", kind, "text")).not.toThrow();
    }
  });
});
