"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import type { VisualizationSpec } from "@/lib/domain/types";

type FractionBarsSpec = Extract<VisualizationSpec, { kind: "fraction-bars" }>;

interface FractionBarsProps {
  spec: FractionBarsSpec;
}

export function FractionBars({ spec }: FractionBarsProps) {
  const [revealed, setRevealed] = React.useState<boolean[]>(
    () => spec.rows.map(() => false),
  );

  // Animate in row by row on mount
  React.useEffect(() => {
    spec.rows.forEach((_, i) => {
      const timer = setTimeout(
        () =>
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          }),
        400 + i * 350,
      );
      return () => clearTimeout(timer);
    });
  }, [spec.rows]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {spec.rows.map((row, rowIdx) => {
        // Determine if this is the "together" row (mixed colours)
        // For the together row we render segments: first N as terracotta, next M as blue, rest empty
        // We detect this by checking if the row label contains "together"
        const isTogether = row.label.toLowerCase().includes("together");

        // For together row, look at the previous rows to split colors
        // row.filled = total filled, color is just a hint for non-mixed rows
        // We'll use the parent rows' colors for the together visualization
        let segments: { bg: string }[] = [];
        if (isTogether && spec.rows.length >= 2) {
          const row0 = spec.rows[0];
          const row1 = spec.rows[1];
          for (let i = 0; i < spec.denominator; i++) {
            if (i < row0.filled) segments.push({ bg: row0.color });
            else if (i < row0.filled + row1.filled)
              segments.push({ bg: row1.color });
            else segments.push({ bg: "#EFE7D8" });
          }
        } else {
          for (let i = 0; i < spec.denominator; i++) {
            segments.push({ bg: i < row.filled ? row.color : "#EFE7D8" });
          }
        }

        const isRevealed = revealed[rowIdx];

        return (
          <div key={row.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONT.mono,
                fontSize: 11,
                color: isTogether ? C.greenDark : C.mono,
                fontWeight: isTogether ? 600 : 400,
                marginBottom: 5,
              }}
            >
              <span>{row.label}</span>
              <span style={{ color: C.mono, fontWeight: 400 }}>
                {row.caption}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${spec.denominator}, 1fr)`,
                gap: 3,
                height: 34,
              }}
            >
              {segments.map((seg, i) => (
                <span
                  key={i}
                  style={{
                    background: isRevealed ? seg.bg : "#EFE7D8",
                    borderRadius: 3,
                    transition: `background ${0.2 + i * 0.04}s ease`,
                    display: "block",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
