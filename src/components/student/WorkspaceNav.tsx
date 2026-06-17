"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { Logo, Avatar, Icon } from "@/components/ui";

interface WorkspaceNavProps {
  topic: string;
  progressIndex: number; // 0-based current (active) index
  progressTotal: number;
  studentName: string;
  studentInitials: string;
  onCallTeacher?: () => void;
}

export function WorkspaceNav({
  topic,
  progressIndex,
  progressTotal,
  studentName,
  studentInitials,
  onCallTeacher,
}: WorkspaceNavProps) {
  return (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: C.paper2,
        borderBottom: `1px solid ${C.line}`,
        flex: "none",
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Logo size={20} />

        {/* Topic + progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: C.mono,
            }}
          >
            {topic}
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: progressTotal }, (_, i) => {
              let bg: string;
              if (i < progressIndex) bg = C.green; // completed
              else if (i === progressIndex) bg = C.terracotta; // active
              else bg = C.neutral; // upcoming
              return (
                <span
                  key={i}
                  style={{
                    width: 22,
                    height: 5,
                    borderRadius: 3,
                    background: bg,
                    display: "inline-block",
                    transition: "background 0.3s ease",
                  }}
                />
              );
            })}
          </div>

          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              color: C.mono,
            }}
          >
            {progressIndex + 1} / {progressTotal}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Call teacher button */}
        <button
          onClick={onCallTeacher}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            fontWeight: 500,
            color: C.terracotta,
            background: C.terracottaBg,
            border: `1px solid rgba(194,83,58,0.28)`,
            borderRadius: 10,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: FONT.sans,
          }}
        >
          <Icon name="phone" size={15} />
          Call teacher
        </button>

        {/* Student identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT.sans }}>
            {studentName}
          </span>
          <Avatar initials={studentInitials} size={30} />
        </div>
      </div>
    </div>
  );
}
