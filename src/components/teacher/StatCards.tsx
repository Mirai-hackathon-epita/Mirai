"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { pct } from "@/lib/domain/mastery";
import type { ClassStats } from "@/lib/domain/types";

/** "Avg mastery" + "Needs attention" header stat cards. */
export function StatCards({ stats }: { stats: ClassStats }) {
  const delta = stats.avgMasteryDelta;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,280px))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          background: C.paper2,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: C.mono,
            marginBottom: 10,
          }}
        >
          Avg mastery
        </div>
        <div
          style={{ fontFamily: FONT.mono, fontSize: 30, fontWeight: 500 }}
        >
          {pct(stats.avgMastery)}%
          {delta !== 0 && (
            <span
              style={{
                fontSize: 13,
                color: delta > 0 ? C.green : C.terracotta,
                marginLeft: 7,
              }}
            >
              {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          background: C.terracottaBg,
          border: "1px solid rgba(194,83,58,0.25)",
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: C.terracotta,
            marginBottom: 10,
          }}
        >
          Needs attention
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 30,
            fontWeight: 500,
            color: C.terracotta,
          }}
        >
          {stats.needsAttention}
        </div>
      </div>
    </div>
  );
}
