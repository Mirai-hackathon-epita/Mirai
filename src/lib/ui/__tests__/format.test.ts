import React from "react";
import { renderBold, formatServerTime, clock } from "../format";

describe("renderBold", () => {
  it("passes plain text through unchanged", () => {
    expect(renderBold("hello world")).toEqual(["hello world"]);
  });

  it("returns single-element array for empty string", () => {
    expect(renderBold("")).toEqual([""]);
  });

  it("splits plain text from a single bold segment", () => {
    const nodes = renderBold("Hello **World** there");
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toBe("Hello ");
    expect(nodes[2]).toBe(" there");
  });

  it("wraps bold segment in a b element", () => {
    const nodes = renderBold("**bold**");
    expect(nodes).toHaveLength(3);
    const el = nodes[1] as React.ReactElement;
    expect(el.type).toBe("b");
    expect(el.props.children).toBe("bold");
    expect(el.props.style.fontWeight).toBe(600);
  });

  it("handles multiple bold segments", () => {
    const nodes = renderBold("**a** and **b**");
    expect(nodes).toHaveLength(5);
    const el1 = nodes[1] as React.ReactElement;
    const el3 = nodes[3] as React.ReactElement;
    expect(el1.type).toBe("b");
    expect(el1.props.children).toBe("a");
    expect(el3.type).toBe("b");
    expect(el3.props.children).toBe("b");
  });

  it("assigns numeric key to each node", () => {
    const nodes = renderBold("**x**");
    const el = nodes[1] as React.ReactElement;
    expect(typeof el.key).toBe("string");
  });
});

describe("clock", () => {
  it("returns a non-empty string", () => {
    expect(typeof clock(Date.now())).toBe("string");
    expect(clock(Date.now()).length).toBeGreaterThan(0);
  });

  it("output contains a colon separator", () => {
    expect(clock(new Date("2024-03-18T09:30:00Z").getTime())).toMatch(/:/);
  });

  it("works for epoch zero", () => {
    expect(typeof clock(0)).toBe("string");
  });
});

describe("formatServerTime", () => {
  it("returns a non-empty string", () => {
    expect(typeof formatServerTime(new Date())).toBe("string");
    expect(formatServerTime(new Date()).length).toBeGreaterThan(0);
  });

  it("contains the middle-dot separator", () => {
    expect(formatServerTime(new Date())).toContain(" · ");
  });

  it("uses current time when called without argument", () => {
    const result = formatServerTime();
    expect(result).toContain(" · ");
  });

  it("date and time parts are non-empty on both sides of separator", () => {
    const result = formatServerTime(new Date("2024-06-15T14:00:00Z"));
    const [datePart, timePart] = result.split(" · ");
    expect(datePart.length).toBeGreaterThan(0);
    expect(timePart.length).toBeGreaterThan(0);
  });
});
