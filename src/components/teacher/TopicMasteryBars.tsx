"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { pct } from "@/lib/domain/mastery";
import type { TopicMastery } from "@/lib/domain/types";

/** Bars read terracotta while a topic is below ~60% (the class is struggling),
 * green once the class is broadly on top of it — matching the design. */
function topicColor(mastery: number): string {
  return mastery < 0.6 ? C.terracotta : C.green;
}

/** "Class mastery by topic" bar list. */
export function TopicMasteryBars({ topics }: { topics: TopicMastery[] }) {
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
      <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>
        Class mastery by topic
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {topics.map((t) => (
          <div key={t.topic}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              <span>{t.topic}</span>
              <span style={{ fontFamily: FONT.mono, color: C.mono }}>
                {pct(t.mastery)}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: C.neutral,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${pct(t.mastery)}%`,
                  background: topicColor(t.mastery),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
