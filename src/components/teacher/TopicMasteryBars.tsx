"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { pct } from "@/lib/domain/mastery";
import type { TopicMastery } from "@/lib/domain/types";
import { api } from "@/lib/ui/api";

/** Bars read terracotta while a topic is below ~60% (the class is struggling),
 * green once the class is broadly on top of it — matching the design. */
function topicColor(mastery: number): string {
  return mastery < 0.6 ? C.terracotta : C.green;
}

// Concept ids are derived from a simple slug of the topic label used in the
// seed data. The TopicMastery type only carries a human label, so we reverse
// it via a lookup map seeded from the known fractions graph.
// When the active graph changes (Phase A / course upload), the teacher can
// re-teach whichever topic they just addressed — the conceptId sent is just
// the slug form of the label they clicked.
function topicToConceptId(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/\s+&\s+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export interface TopicMasteryBarsProps {
  topics: TopicMastery[];
  /** Called after a successful re-teach mutation so the parent can refetch. */
  onRetaught?: () => void;
}

/** "Class mastery by topic" bar list. */
export function TopicMasteryBars({ topics, onRetaught }: TopicMasteryBarsProps) {
  // Track which concept is currently being re-taught (optimistic loading state)
  const [pending, setPending] = React.useState<string | null>(null);

  async function handleRetaught(topic: string) {
    const conceptId = topicToConceptId(topic);
    if (pending) return; // debounce
    setPending(conceptId);
    try {
      await api.markRetaught({ conceptId });
      onRetaught?.();
    } catch (err) {
      console.error("[TopicMasteryBars] markRetaught failed", err);
    } finally {
      setPending(null);
    }
  }

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
        {topics.map((t) => {
          const cid = topicToConceptId(t.topic);
          const isLoading = pending === cid;
          return (
            <div key={t.topic}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span>{t.topic}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: FONT.mono, color: C.mono }}>
                    {pct(t.mastery)}%
                  </span>
                  <button
                    onClick={() => handleRetaught(t.topic)}
                    disabled={isLoading || pending !== null}
                    style={{
                      fontSize: 11,
                      fontFamily: FONT.mono,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 5,
                      border: `1px solid ${C.terracotta}`,
                      background: isLoading ? C.terracottaBg2 : "transparent",
                      color: isLoading ? C.mono : C.terracotta,
                      cursor: pending !== null ? "not-allowed" : "pointer",
                      opacity: pending !== null && !isLoading ? 0.45 : 1,
                      transition: "opacity 0.15s, background 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isLoading ? "re-probing…" : "Mark re-taught"}
                  </button>
                </div>
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
          );
        })}
      </div>
    </div>
  );
}
