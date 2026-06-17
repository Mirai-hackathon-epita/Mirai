"use client";

import * as React from "react";
import { C, FONT, statusColor } from "@/lib/ui/theme";
import { Icon } from "@/components/ui";
import { pct } from "@/lib/domain/mastery";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import type { ConceptMastery } from "@/lib/domain/types";

// Fixed column/row pixel offsets matching the design spec exactly.
// Col 0 has 3 rows; other cols use 2 rows.
const COL_X = [24, 250, 476, 702];
const ROW_Y_COL0 = [70, 210, 350]; // col 0: 3 rows
const ROW_Y = [120, 300]; // cols 1..3: 2 rows

function nodeTop(col: number, row: number): number {
  if (col === 0) return ROW_Y_COL0[row] ?? ROW_Y_COL0[0];
  return ROW_Y[row] ?? ROW_Y[0];
}

function nodeLeft(col: number): number {
  return COL_X[col] ?? COL_X[0];
}

interface NodeCardProps {
  conceptId: string;
  col: number;
  row: number;
  cm: ConceptMastery;
  isFocus: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function NodeCard({ conceptId, col, row, cm, isFocus, isSelected, onClick }: NodeCardProps) {
  const concept = FRACTIONS_GRAPH.concepts.find((c) => c.id === conceptId);
  if (!concept) return null;

  const left = nodeLeft(col);
  const top = nodeTop(col, row);
  const isLocked = cm.status === "not-started" || cm.status === "locked";
  const isDeveloping = cm.status === "developing";
  const color = statusColor(cm.status);
  const masteryPct = pct(cm.mastery);

  let bg: string = C.paper2;
  let border: string = `1px solid ${C.line2}`;
  let shadow: string = "0 1px 2px rgba(22,26,34,0.04)";
  let textColor: string = C.ink;

  if (isFocus) {
    bg = C.terracottaBg2;
    border = `2px solid ${C.terracotta}`;
    shadow = "0 6px 18px rgba(194,83,58,0.22)";
    textColor = C.terracottaDark;
  } else if (isDeveloping) {
    border = `1.5px solid ${C.amber}`;
  } else if (isLocked) {
    bg = C.paper3;
    border = `1px dashed rgba(22,26,34,0.22)`;
    textColor = "#9A8F7C";
  }

  // Selected highlight overlay
  if (isSelected && !isFocus) {
    border = `2px solid ${C.blue}`;
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left,
        top,
        width: 168,
        minHeight: 52,
        background: bg,
        border,
        borderRadius: 12,
        padding: isFocus ? "0 13px" : "9px 13px",
        boxShadow: shadow,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
        transition: "box-shadow 0.15s",
      }}
    >
      {isLocked ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: textColor,
            }}
          >
            <Icon name="lock" size={12} />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              {concept.label}
            </span>
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              color: "#A89D89",
            }}
          >
            {concept.id === "subtracting-fractions"
              ? "Locked · needs the gap closed"
              : "Locked · next unit"}
          </div>
        </>
      ) : isFocus ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: 1.1,
                color: textColor,
              }}
            >
              {concept.label}
            </div>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "#fff",
                background: C.terracotta,
                borderRadius: 4,
                padding: "2px 5px",
                flexShrink: 0,
              }}
            >
              NOW
            </span>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 7 }}
          >
            <span
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: "#EBD6CF",
                overflow: "hidden",
                display: "block",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${masteryPct}%`,
                  background: C.terracotta,
                }}
              />
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: C.terracotta,
              }}
            >
              {masteryPct}%
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              lineHeight: 1.15,
              marginBottom: 6,
              color: textColor,
            }}
          >
            {concept.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: C.neutral,
                overflow: "hidden",
                display: "block",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${masteryPct}%`,
                  background: color,
                }}
              />
            </span>
            <span
              style={{ fontFamily: FONT.mono, fontSize: 10, color }}
            >
              {masteryPct}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  mastery: ConceptMastery[];
  focusConceptId: string;
  selectedConceptId: string;
  onSelect: (id: string) => void;
}

/** SVG edge paths copied exactly from the design (Mira.dc.html lines 381–388). */
function Edges() {
  return (
    <svg
      width="870"
      height="430"
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
    >
      {/* col0 → common-denominators: 3 normal edges */}
      <path
        d="M192,96 C222,96 220,146 250,146"
        fill="none"
        stroke="rgba(22,26,34,0.18)"
        strokeWidth={1.5}
      />
      <path
        d="M192,236 C222,236 220,160 250,150"
        fill="none"
        stroke="rgba(22,26,34,0.18)"
        strokeWidth={1.5}
      />
      <path
        d="M192,376 C222,376 220,160 250,156"
        fill="none"
        stroke="rgba(22,26,34,0.18)"
        strokeWidth={1.5}
      />
      {/* common-denominators → adding-unlike: dashed terracotta (weak link) */}
      <path
        d="M418,146 C448,146 446,146 476,146"
        fill="none"
        stroke={C.terracotta}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {/* adding-like → adding-unlike: dashed terracotta (weak-link path) */}
      <path
        d="M418,326 C448,326 446,170 476,156"
        fill="none"
        stroke={C.terracotta}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {/* common-denominators → comparing: normal */}
      <path
        d="M418,146 C448,146 446,300 476,316"
        fill="none"
        stroke="rgba(22,26,34,0.18)"
        strokeWidth={1.5}
      />
      {/* adding-unlike → subtracting: faint (locked) */}
      <path
        d="M644,146 C674,146 672,146 702,146"
        fill="none"
        stroke="rgba(22,26,34,0.14)"
        strokeWidth={1.5}
      />
      {/* comparing → mixed-numbers: faint (locked) */}
      <path
        d="M644,156 C674,170 672,310 702,326"
        fill="none"
        stroke="rgba(22,26,34,0.14)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/** Interactive skill graph canvas. */
export function SkillGraph({ mastery, focusConceptId, selectedConceptId, onSelect }: Props) {
  const masteryMap = Object.fromEntries(mastery.map((m) => [m.conceptId, m]));

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        background: C.paper,
        backgroundImage:
          "radial-gradient(rgba(22,26,34,0.05) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 870,
          height: 430,
        }}
      >
        <Edges />
        {FRACTIONS_GRAPH.concepts.map((c) => {
          const cm = masteryMap[c.id];
          if (!cm) return null;
          return (
            <NodeCard
              key={c.id}
              conceptId={c.id}
              col={c.layout.col}
              row={c.layout.row}
              cm={cm}
              isFocus={c.id === focusConceptId}
              isSelected={c.id === selectedConceptId}
              onClick={() => onSelect(c.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
