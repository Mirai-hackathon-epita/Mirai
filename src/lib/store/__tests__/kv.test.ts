import { kv } from "../kv";

const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
afterAll(() => logSpy.mockRestore());

beforeEach(() => {
  (globalThis as any).__miraKv = undefined;
});

describe("backend selection", () => {
  it("uses memory backend when no REDIS_URL", () => {
    expect(kv().backend).toBe("memory");
  });

  it("returns the same instance on repeated calls (singleton)", () => {
    expect(kv()).toBe(kv());
  });
});

describe("getJSON / setJSON", () => {
  it("returns null for a missing key", async () => {
    expect(await kv().getJSON("nonexistent")).toBeNull();
  });

  it("round-trips a simple value", async () => {
    await kv().setJSON("k1", { x: 42 });
    expect(await kv().getJSON<{ x: number }>("k1")).toEqual({ x: 42 });
  });

  it("overwrites an existing value", async () => {
    await kv().setJSON("k2", 1);
    await kv().setJSON("k2", 99);
    expect(await kv().getJSON("k2")).toBe(99);
  });

  it("stores nested objects faithfully", async () => {
    const obj = { a: { b: [1, 2, 3] }, c: "hello" };
    await kv().setJSON("k3", obj);
    expect(await kv().getJSON("k3")).toEqual(obj);
  });

  it("stores null values", async () => {
    await kv().setJSON("k4", null);
    expect(await kv().getJSON("k4")).toBeNull();
  });
});

describe("del", () => {
  it("removes a stored key so getJSON returns null", async () => {
    await kv().setJSON("dk1", "hello");
    await kv().del("dk1");
    expect(await kv().getJSON("dk1")).toBeNull();
  });

  it("is a no-op for a missing key", async () => {
    await expect(kv().del("never-set")).resolves.toBeUndefined();
  });

  it("removes a list key so listRange returns empty", async () => {
    await kv().listUnshift("dl1", "a");
    await kv().del("dl1");
    expect(await kv().listRange("dl1")).toEqual([]);
  });
});

describe("exists", () => {
  it("returns true for a stored JSON key", async () => {
    await kv().setJSON("ek1", true);
    expect(await kv().exists("ek1")).toBe(true);
  });

  it("returns false for a missing key", async () => {
    expect(await kv().exists("ek-never")).toBe(false);
  });

  it("returns true for a list key", async () => {
    await kv().listUnshift("el1", "item");
    expect(await kv().exists("el1")).toBe(true);
  });

  it("returns false after del removes the key", async () => {
    await kv().setJSON("ek2", 1);
    await kv().del("ek2");
    expect(await kv().exists("ek2")).toBe(false);
  });
});

describe("listUnshift / listRange", () => {
  it("returns empty array for a missing list", async () => {
    expect(await kv().listRange("ll-missing")).toEqual([]);
  });

  it("prepends items so list is newest-first", async () => {
    await kv().listUnshift("ll1", "first");
    await kv().listUnshift("ll1", "second");
    expect(await kv().listRange<string>("ll1")).toEqual(["second", "first"]);
  });

  it("respects start/stop bounds", async () => {
    await kv().listUnshift("ll2", "c");
    await kv().listUnshift("ll2", "b");
    await kv().listUnshift("ll2", "a");
    expect(await kv().listRange("ll2", 0, 1)).toEqual(["a", "b"]);
    expect(await kv().listRange("ll2", 1, 2)).toEqual(["b", "c"]);
  });

  it("returns all items with default stop=-1", async () => {
    await kv().listUnshift("ll3", 1);
    await kv().listUnshift("ll3", 2);
    expect(await kv().listRange("ll3")).toEqual([2, 1]);
  });

  it("round-trips complex objects", async () => {
    const obj = { id: "test", value: 42, nested: { flag: true } };
    await kv().listUnshift("ll4", obj);
    const result = await kv().listRange<typeof obj>("ll4");
    expect(result[0]).toEqual(obj);
  });

  it("handles multiple items and returns them in insertion order (newest first)", async () => {
    const items = ["x", "y", "z"];
    for (const item of items) await kv().listUnshift("ll5", item);
    expect(await kv().listRange<string>("ll5")).toEqual(["z", "y", "x"]);
  });
});
