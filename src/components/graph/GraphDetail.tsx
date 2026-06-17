"use client";

import * as React from "react";
import Link from "next/link";
import { C, FONT, statusColor } from "@/lib/ui/theme";
import { MiraMark, Icon } from "@/components/ui";
import { pct } from "@/lib/domain/mastery";
import { CONCEPTS_BY_ID } from "@/lib/domain/conceptGraph";
import type { ConceptMastery } from "@/lib/domain/types";

interface Props {
  conceptId: string;
  mastery: ConceptMastery[];
}

/** Right-hand detail panel for the skill graph. */
export function GraphDetail({ conceptId, mastery }: Props) {
  const concept = CONCEPTS_BY_ID[conceptId];
  const masteryMap = Object.fromEntries(mastery.map((m) => [m.conceptId, m]));
  const cm = masteryMap[conceptId];

  if (!concept || !cm) {
    return (
      <div
        style={{
          width: 340,
          flex: "none",
          borderLeft: `1px solid ${C.line}`,
          background: C.paper2,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.mono,
          fontSize: 13,
        }}
      >
        Select a node
      </div>
    );
  }

  const statusPct = pct(cm.mastery);
  const color = statusColor(cm.status);

  // Prerequisite concepts with mastery
  const prereqs = concept.prerequisites.map((pid) => ({
    concept: CONCEPTS_BY_ID[pid],
    cm: masteryMap[pid],
  })).filter((p) => p.concept && p.cm);

  // Determine the weak-link prereq
  const weakLink = prereqs.find((p) => p.cm?.weakLink);

  // Mira note text (static for demo, matches design spec for adding-unlike-fractions)
  const miraNoteForFocus =
    conceptId === "adding-unlike-fractions"
      ? "Let's lock in **common denominators** first — that one move unblocks adding, subtracting, and comparing. I've lined up 8 practice problems for you."
      : `You're at ${statusPct}% on ${concept.label}. Keep working through the exercises to build fluency.`;

  function renderNote(text: string): React.ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <b key={i} style={{ fontWeight: 600 }}>
            {part.slice(2, -2)}
          </b>
        );
      }
      return part;
    });
  }

  const statusLabel =
    cm.status === "needs-work"
      ? "Needs work"
      : cm.status === "developing"
      ? "Developing"
      : cm.status === "mastered"
      ? "Mastered"
      : cm.status === "not-started"
      ? "Not started"
      : "Locked";

  return (
    <div
      style={{
        width: 340,
        flex: "none",
        borderLeft: `1px solid ${C.line}`,
        background: C.paper2,
        padding: 24,
        overflowY: "auto",
      }}
    >
      {/* Status eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 3,
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color,
          }}
        >
          {statusLabel} · {statusPct}%
        </span>
      </div>

      {/* Concept title */}
      <h3
        style={{
          fontFamily: FONT.serif,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "-0.01em",
          margin: "0 0 12px",
          color: C.ink,
        }}
      >
        {concept.label}
      </h3>

      {/* Blurb */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: C.muted,
          margin: "0 0 20px",
        }}
      >
        {conceptId === "adding-unlike-fractions"
          ? "You can add fractions once the denominators match, but you stall at the step right before — finding a common denominator. Your gap is one level down, not here."
          : concept.blurb}
      </p>

      {/* Prerequisites */}
      {prereqs.length > 0 && (
        <>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: C.mono,
              marginBottom: 12,
            }}
          >
            Prerequisites
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 22,
            }}
          >
            {prereqs.map(({ concept: pc, cm: pcm }) => {
              const isWeak = pcm?.weakLink;
              const pcColor = statusColor(pcm?.status ?? "not-started");
              const pcPct = pct(pcm?.mastery ?? 0);
              if (isWeak) {
                return (
                  <div
                    key={pc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: C.amberBg2,
                      border: "1px solid rgba(194,138,44,0.4)",
                      borderRadius: 10,
                      padding: "9px 11px",
                      margin: "-2px -4px",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: C.amber,
                        flex: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      !
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>
                      {pc.label}{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          color: C.mono,
                          fontSize: 11,
                          fontFamily: FONT.mono,
                        }}
                      >
                        weak link
                      </span>
                    </span>
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 12,
                        color: C.amber,
                      }}
                    >
                      {pcPct}%
                    </span>
                  </div>
                );
              }
              const isOk =
                pcm?.status === "mastered" || (pcm?.mastery ?? 0) >= 0.75;
              return (
                <div
                  key={pc.id}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: isOk ? C.green : pcColor,
                      flex: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isOk ? (
                      <Icon name="check" size={12} stroke="#fff" strokeWidth={2.6} />
                    ) : (
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        !
                      </span>
                    )}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5 }}>{pc.label}</span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      color: isOk ? C.green : pcColor,
                    }}
                  >
                    {pcPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mira note */}
      <div
        style={{
          background: C.paper,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <MiraMark size={24} />
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: C.ink2,
              margin: 0,
            }}
          >
            {renderNote(miraNoteForFocus)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <Link
          href="/student"
          style={{
            background: C.terracotta,
            color: C.cream,
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          Start the 8 practice problems
        </Link>
        <Link
          href="/student"
          style={{
            background: C.paper2,
            border: `1px solid ${C.line2}`,
            color: C.muted,
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          Open my workspace
        </Link>
      </div>
    </div>
  );
}
