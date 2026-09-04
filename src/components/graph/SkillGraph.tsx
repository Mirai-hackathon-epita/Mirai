"use client";

import * as React from "react";
import { C, FONT, statusColor } from "@/lib/ui/theme";
import { Icon } from "@/components/ui";
import { pct } from "@/lib/domain/mastery";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import type { Concept, ConceptGraph, ConceptMastery } from "@/lib/domain/types";

// Layout derived from each concept's {col,row}. The constants reproduce the
// design spec exactly for the built-in fractions graph (col 0 has 3 rows at
// 70/210/350, other columns 2 rows at 120/300, columns at 24/250/476/702) and
// keep working for any published course graph, whatever its shape.
const NODE_W = 168;
const NODE_HALF_H = 26;
const COL_STEP = 226;
const COL_X0 = 24;
const DENSE_Y0 = 70; // columns with 3+ rows
const DENSE_STEP = 140;
const SPARSE_Y0 = 120; // columns with 1–2 rows
const SPARSE_STEP = 180;

interface NodePos {
  left: number;
  top: number;
}

function nodeLeft(col: number): number {
  return COL_X0 + Math.max(0, col) * COL_STEP;
}

/** Pixel position of every concept, keyed by id. */
function layoutGraph(graph: ConceptGraph): Record<string, NodePos> {
  const rowsPerCol = new Map<number, number>();
  for (const c of graph.concepts) {
    const col = c.layout?.col ?? 0;
    rowsPerCol.set(col, Math.max(rowsPerCol.get(col) ?? 0, (c.layout?.row ?? 0) + 1));
  }

  const positions: Record<string, NodePos> = {};
  for (const c of graph.concepts) {
    const col = c.layout?.col ?? 0;
    const row = c.layout?.row ?? 0;
    const dense = (rowsPerCol.get(col) ?? 1) >= 3;
    positions[c.id] = {
      left: nodeLeft(col),
      top: dense ? DENSE_Y0 + row * DENSE_STEP : SPARSE_Y0 + row * SPARSE_STEP,
    };
  }
  return positions;
}

interface NodeCardProps {
  concept: Concept;
  pos: NodePos;
  cm: ConceptMastery;
  isFocus: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function NodeCard({ concept, pos, cm, isFocus, isSelected, onClick }: NodeCardProps) {
  const { left, top } = pos;
  const isLocked = cm.status === "not-started" || cm.status === "locked";
  const isDeveloping = cm.status === "developing";
  const color = statusColor(cm.status);
  const masteryPct = pct(cm.mastery);

  let bg: string = C.paper2;
  let border: string = `1px solid ${C.line2}`;
  let shadow: string = "0 1px 2px rgba(22,26,34,0.04)";
  let textColor: string = C.ink;

  if (isFocus) {
    if (cm.status === "mastered") {
      bg = C.greenBg;
      border = `2px solid ${C.green}`;
      shadow = "0 6px 18px rgba(92,138,110,0.22)";
      textColor = C.greenDark;
    } else if (cm.status === "developing") {
      bg = C.amberBg2;
      border = `2px solid ${C.amber}`;
      shadow = "0 6px 18px rgba(194,138,44,0.22)";
      textColor = C.amber;
    } else {
      bg = C.terracottaBg2;
      border = `2px solid ${C.terracotta}`;
      shadow = "0 6px 18px rgba(194,83,58,0.22)";
      textColor = C.terracottaDark;
    }
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
        width: NODE_W,
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
                background: cm.status === "mastered" ? "#C8DDD0" : cm.status === "developing" ? "#EDD9A8" : "#EBD6CF",
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
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color,
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
  /** The published course graph. Defaults to the built-in fractions graph. */
  graph?: ConceptGraph;
}

/**
 * Prerequisite edges, derived from the graph rather than hardcoded, so a
 * published course renders its own structure. Stroke styling reproduces the
 * design: dashed terracotta into the focus node when it is the blocker, faint
 * into a locked node, hairline otherwise.
 */
function Edges({
  graph,
  positions,
  masteryMap,
  focusConceptId,
  width,
  height,
}: {
  graph: ConceptGraph;
  positions: Record<string, NodePos>;
  masteryMap: Record<string, ConceptMastery>;
  focusConceptId: string;
  width: number;
  height: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
    >
      {graph.concepts.flatMap((target) => {
        const to = positions[target.id];
        if (!to) return [];
        const status = masteryMap[target.id]?.status;
        const isBlockedFocus =
          target.id === focusConceptId &&
          (status === "needs-work" || status === "developing");
        const isLocked = status === "not-started" || status === "locked";

        return target.prerequisites.flatMap((prereqId) => {
          const from = positions[prereqId];
          if (!from) return [];
          const x1 = from.left + NODE_W;
          const y1 = from.top + NODE_HALF_H;
          const x2 = to.left;
          const y2 = to.top + NODE_HALF_H;
          return [
            <path
              key={`${prereqId}->${target.id}`}
              d={`M${x1},${y1} C${x1 + 30},${y1} ${x2 - 30},${y2} ${x2},${y2}`}
              fill="none"
              stroke={
                isBlockedFocus
                  ? C.terracotta
                  : isLocked
                    ? "rgba(22,26,34,0.14)"
                    : "rgba(22,26,34,0.18)"
              }
              strokeWidth={isBlockedFocus ? 2 : 1.5}
              strokeDasharray={isBlockedFocus ? "5 4" : undefined}
            />,
          ];
        });
      })}
    </svg>
  );
}

/** Interactive skill graph canvas. */
export function SkillGraph({
  mastery,
  focusConceptId,
  selectedConceptId,
  onSelect,
  graph = FRACTIONS_GRAPH,
}: Props) {
  const masteryMap: Record<string, ConceptMastery> = Object.fromEntries(
    mastery.map((m) => [m.conceptId, m]),
  );
  const positions = React.useMemo(() => layoutGraph(graph), [graph]);
  const all = Object.values(positions);
  // Keep the design's canvas size for the built-in graph; grow for larger ones.
  const width = Math.max(870, ...all.map((p) => p.left + NODE_W + 30));
  const height = Math.max(430, ...all.map((p) => p.top + 80));

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        // Scrolls only when a published course is bigger than the canvas.
        overflow: "auto",
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
          width,
          height,
        }}
      >
        <Edges
          graph={graph}
          positions={positions}
          masteryMap={masteryMap}
          focusConceptId={focusConceptId}
          width={width}
          height={height}
        />
        {graph.concepts.map((c) => {
          const cm = masteryMap[c.id];
          const pos = positions[c.id];
          if (!cm || !pos) return null;
          return (
            <NodeCard
              key={c.id}
              concept={c}
              pos={pos}
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
