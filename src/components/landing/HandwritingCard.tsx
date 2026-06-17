import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { Icon, MiraiMark, Chip } from "@/components/ui";

// Hero side card: a handwritten fraction solution, read & graded by Mirai,
// with a green "Correct" pill and a tutor follow-up message.

export function HandwritingCard() {
  return (
    <div
      className="mira-handcard fade-up"
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        boxShadow: "var(--shadow-raised)",
        padding: 24,
        animationDelay: "0.08s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <span
          style={{ fontFamily: FONT.mono, fontSize: 12, color: C.mono }}
        >
          Handwritten · read &amp; graded by Mirai
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: C.greenBg,
            color: C.greenDark,
            borderRadius: 999,
            padding: "4px 11px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={13} strokeWidth={2.4} />
          Correct
        </span>
      </div>

      <div
        style={{
          fontFamily: FONT.hand,
          fontSize: 34,
          lineHeight: 1.35,
          color: "#232934",
          background:
            "linear-gradient(transparent 30px, rgba(44,74,223,0.08) 31px) 0 0 / 100% 32px",
          padding: "2px 4px 6px",
        }}
      >
        ¾ + ⅙
        <br />= 9⁄12 + 2⁄12
        <br />= 11⁄12
      </div>

      <div style={{ height: 1, background: C.line, margin: "18px 0" }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <MiraiMark size={24} />
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: C.ink2,
            margin: 0,
          }}
        >
          Nice — you found the common denominator on your own. I&apos;ll nudge
          the next one a little harder.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Chip mono>Fractions</Chip>
        <Chip mono>Difficulty 4 / 10</Chip>
      </div>
    </div>
  );
}
