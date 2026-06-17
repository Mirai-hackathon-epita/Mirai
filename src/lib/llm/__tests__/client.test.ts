import { parseJSON, genId, LLMUnavailableError } from "../client";

describe("parseJSON", () => {
  it("parses plain JSON object", () => {
    const result = parseJSON<{ a: number }>('{"a": 1}');
    expect(result).toEqual({ a: 1 });
  });

  it("parses JSON array", () => {
    const result = parseJSON<number[]>("[1, 2, 3]");
    expect(result).toEqual([1, 2, 3]);
  });

  it("strips markdown code fences", () => {
    const result = parseJSON<{ x: string }>('```json\n{"x": "hello"}\n```');
    expect(result).toEqual({ x: "hello" });
  });

  it("strips code fences without language tag", () => {
    const result = parseJSON<{ y: number }>('```\n{"y": 42}\n```');
    expect(result).toEqual({ y: 42 });
  });

  it("extracts first JSON block from mixed text", () => {
    const result = parseJSON<{ z: boolean }>(
      'Some text before {"z": true} and after',
    );
    expect(result).toEqual({ z: true });
  });

  it("throws LLMUnavailableError on unparseable input", () => {
    expect(() => parseJSON("not json at all")).toThrow(LLMUnavailableError);
  });
});

describe("genId", () => {
  it("returns a string", () => {
    expect(typeof genId()).toBe("string");
  });

  it("uses provided prefix", () => {
    expect(genId("ex").startsWith("ex-")).toBe(true);
  });

  it("defaults to id prefix", () => {
    expect(genId().startsWith("id-")).toBe(true);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => genId()));
    expect(ids.size).toBe(100);
  });
});

describe("LLMUnavailableError", () => {
  it("is an Error instance", () => {
    const err = new LLMUnavailableError("test");
    expect(err).toBeInstanceOf(Error);
  });

  it("has correct name", () => {
    const err = new LLMUnavailableError("test");
    expect(err.name).toBe("LLMUnavailableError");
  });

  it("carries message", () => {
    const err = new LLMUnavailableError("oops");
    expect(err.message).toBe("oops");
  });
});
