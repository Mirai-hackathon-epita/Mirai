"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { C, FONT, statusChip } from "@/lib/ui/theme";
import { pct } from "@/lib/domain/mastery";
import type { Student, StudentStatus } from "@/lib/domain/types";

/** Bar colour mirrors the roster design: terracotta for stuck, amber for
 * review, green once on track or ahead. */
function barColor(status: StudentStatus): string {
  switch (status) {
    case "stuck":
      return C.terracottaDark;
    case "review":
      return C.amber;
    default:
      return C.green;
  }
}

const GRID = "1.4fr 1.4fr 0.9fr 0.8fr";

/** "Class roster" table. Rows link to each student's skill graph. */
export function RosterTable({ roster }: { roster: Student[] }) {
  const router = useRouter();
  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 20,
        order: 1,
      }}
    >
      <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>
        Class roster
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: C.mono,
          paddingBottom: 10,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <span>Student</span>
        <span>Current topic</span>
        <span>Mastery</span>
        <span>Status</span>
      </div>
      {roster.map((s, i) => {
        const chip = statusChip(s.status);
        return (
          <div
            key={s.id}
            onClick={() => router.push(`/teacher/student/${s.id}`)}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              padding: "11px 0",
              borderBottom:
                i < roster.length - 1
                  ? "1px solid rgba(22,26,34,0.05)"
                  : "none",
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            <span style={{ fontWeight: 500 }}>{s.name}</span>
            <span style={{ color: C.muted }}>{s.currentTopicLabel}</span>
            <span
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <span
                style={{
                  width: 42,
                  height: 5,
                  borderRadius: 3,
                  background: C.neutral,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${pct(s.overallMastery)}%`,
                    background: barColor(s.status),
                  }}
                />
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: 12 }}>
                {pct(s.overallMastery)}%
              </span>
            </span>
            <span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: chip.fg,
                  background: chip.bg,
                  borderRadius: 6,
                  padding: "3px 8px",
                }}
              >
                {chip.label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
