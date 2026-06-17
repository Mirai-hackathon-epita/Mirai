import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";
import { HandwritingCard } from "./HandwritingCard";

// Hero: eyebrow, serif headline (with "every" in terracotta italic), subcopy,
// two CTAs, a mono caption — paired with the handwriting demo card.

export function Hero() {
  return (
    <section
      className="mira-hero"
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 52,
        padding: "40px 8px 64px",
        alignItems: "center",
      }}
    >
      <div className="fade-up">
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 13,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: C.terracotta,
            marginBottom: 18,
          }}
        >
          Autonomous AI tutor
        </div>

        <h1
          style={{
            fontFamily: FONT.serif,
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            margin: "0 0 22px",
          }}
        >
          A tutor that pays attention to{" "}
          <em style={{ color: C.terracotta, fontStyle: "italic" }}>every</em>{" "}
          student.
        </h1>

        <p
          style={{
            fontSize: 19,
            lineHeight: 1.55,
            color: C.muted,
            margin: "0 0 30px",
            maxWidth: "46ch",
          }}
        >
          Upload your course. Mira builds personalized practice for each
          learner, grades the math they write by hand, and tells you exactly who
          to pull aside next.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 26,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/teacher"
            style={{
              background: C.terracotta,
              color: C.cream,
              borderRadius: 10,
              padding: "14px 26px",
              fontSize: 16,
              fontWeight: 500,
              fontFamily: FONT.sans,
            }}
          >
            Request a demo
          </Link>
          <Link
            href="/student"
            style={{
              fontSize: 16,
              color: C.ink,
              fontWeight: 500,
              borderBottom: "1.5px solid rgba(22,26,34,0.25)",
              paddingBottom: 2,
            }}
          >
            See how it works →
          </Link>
        </div>

        <div style={{ fontFamily: FONT.mono, fontSize: 13, color: C.mono }}>
          Built for grades 6–8 · Works with the course you already teach
        </div>
      </div>

      <HandwritingCard />
    </section>
  );
}
