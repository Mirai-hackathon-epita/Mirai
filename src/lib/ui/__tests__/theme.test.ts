import { statusColor, statusChip, masteryChip, C, FONT, RADIUS } from "../theme";

describe("statusColor", () => {
  it("mastered → green", () => expect(statusColor("mastered")).toBe(C.green));
  it("developing → amber", () => expect(statusColor("developing")).toBe(C.amber));
  it("needs-work → terracotta", () => expect(statusColor("needs-work")).toBe(C.terracotta));
  it("not-started → neutral2", () => expect(statusColor("not-started")).toBe(C.neutral2));
  it("locked → neutral2", () => expect(statusColor("locked")).toBe(C.neutral2));
});

describe("statusChip", () => {
  it("stuck chip fields", () => {
    const c = statusChip("stuck");
    expect(c.label).toBe("Stuck");
    expect(c.fg).toBe("#A8392E");
    expect(c.bg).toBe("#F2D8D4");
  });
  it("review chip fields", () => {
    const c = statusChip("review");
    expect(c.label).toBe("Review");
    expect(c.fg).toBe(C.amber);
    expect(c.bg).toBe(C.amberBg);
  });
  it("on-track chip fields", () => {
    const c = statusChip("on-track");
    expect(c.label).toBe("On track");
    expect(c.fg).toBe(C.muted);
    expect(c.bg).toBe(C.paper3);
  });
  it("ahead chip fields", () => {
    const c = statusChip("ahead");
    expect(c.label).toBe("Ahead");
    expect(c.fg).toBe(C.greenDark);
    expect(c.bg).toBe(C.greenBg);
  });
});

describe("masteryChip", () => {
  it("mastered chip", () => {
    const c = masteryChip("mastered");
    expect(c.label).toBe("Mastered");
    expect(c.fg).toBe(C.greenDark);
    expect(c.bg).toBe(C.greenBg);
  });
  it("developing chip", () => {
    const c = masteryChip("developing");
    expect(c.label).toBe("Developing");
    expect(c.fg).toBe(C.amber);
    expect(c.bg).toBe(C.amberBg);
  });
  it("needs-work chip", () => {
    const c = masteryChip("needs-work");
    expect(c.label).toBe("Needs work");
    expect(c.fg).toBe(C.terracotta);
    expect(c.bg).toBe(C.terracottaBg);
  });
  it("not-started chip", () => {
    const c = masteryChip("not-started");
    expect(c.label).toBe("Not started");
    expect(c.fg).toBe(C.muted);
    expect(c.bg).toBe(C.paper3);
  });
  it("locked chip", () => {
    const c = masteryChip("locked");
    expect(c.label).toBe("Locked");
    expect(c.fg).toBe(C.faint);
    expect(c.bg).toBe(C.paper3);
  });
});

describe("C palette", () => {
  it("contains required colour tokens as hex strings", () => {
    const tokens = [C.bg, C.ink, C.terracotta, C.green, C.amber, C.blue, C.paper, C.muted, C.faint];
    for (const t of tokens) {
      expect(typeof t).toBe("string");
      expect(t.startsWith("#")).toBe(true);
    }
  });
  it("greenDark is darker shade than green", () => {
    expect(C.greenDark).not.toBe(C.green);
  });
  it("terracottaDark is defined", () => {
    expect(typeof C.terracottaDark).toBe("string");
  });
});

describe("FONT", () => {
  it("serif contains Newsreader", () => expect(FONT.serif).toContain("Newsreader"));
  it("sans contains Geist", () => expect(FONT.sans).toContain("Geist"));
  it("mono contains Geist Mono", () => expect(FONT.mono).toContain("Geist Mono"));
  it("hand contains Caveat", () => expect(FONT.hand).toContain("Caveat"));
});

describe("RADIUS", () => {
  it("values increase sm < md < lg < xl", () => {
    expect(RADIUS.sm).toBeLessThan(RADIUS.md);
    expect(RADIUS.md).toBeLessThan(RADIUS.lg);
    expect(RADIUS.lg).toBeLessThan(RADIUS.xl);
  });
  it("all values are positive numbers", () => {
    expect(RADIUS.sm).toBeGreaterThan(0);
    expect(RADIUS.xl).toBeGreaterThan(0);
  });
});
