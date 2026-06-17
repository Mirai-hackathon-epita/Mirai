"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { renderBold } from "@/lib/ui/format";
import type { ActivityItem } from "@/lib/domain/types";

/** "Mira's activity" timeline — the autonomous loop, observable. */
export function ActivityTimeline({ activity }: { activity: ActivityItem[] }) {
  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 20,
        order: 2,
      }}
    >
      <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>
        Mira&apos;s activity
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {activity.map((a) => (
          <div key={a.id} style={{ display: "flex", gap: 11 }}>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: C.mono,
                width: 42,
                flex: "none",
                paddingTop: 1,
              }}
            >
              {a.time}
            </span>
            <span
              style={{
                fontSize: 13,
                color: C.ink2,
                lineHeight: 1.45,
              }}
            >
              {renderBold(a.text)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
