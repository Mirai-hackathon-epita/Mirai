"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import type { VisualizationSpec } from "@/lib/domain/types";

type NumberLineSpec = Extract<VisualizationSpec, { kind: "number-line" }>;

interface NumberLineProps {
  spec: NumberLineSpec;
}

/** SVG number line from 0 to 1, tick marks every 1/12. */
export function NumberLine({ spec }: NumberLineProps) {
  const W = 480; // viewBox width
  const H = 120;
  const padX = 28;
  const axisY = 72;
  const tickCount = 12; // ticks at every 1/12

  function xFor(value: number): number {
    return padX + value * (W - padX * 2);
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: C.mono,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {spec.title}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 120, display: "block" }}
        aria-label={spec.title}
      >
        {/* Main axis line */}
        <line
          x1={padX}
          y1={axisY}
          x2={W - padX}
          y2={axisY}
          stroke={C.ink}
          strokeWidth={1.5}
        />
        {/* Arrow at right end */}
        <polygon
          points={`${W - padX + 6},${axisY} ${W - padX},${axisY - 4} ${W - padX},${axisY + 4}`}
          fill={C.ink}
        />

        {/* Tick marks every 1/12 */}
        {Array.from({ length: tickCount + 1 }, (_, i) => i).map((i) => {
          const x = xFor(i / tickCount);
          const isWhole = i === 0 || i === tickCount;
          const isQuarter = i % 3 === 0;
          const tickH = isWhole ? 12 : isQuarter ? 8 : 5;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={axisY - tickH / 2}
                x2={x}
                y2={axisY + tickH / 2}
                stroke={C.mono}
                strokeWidth={isWhole ? 1.5 : 1}
              />
              {(isWhole || isQuarter) && (
                <text
                  x={x}
                  y={axisY + 18}
                  textAnchor="middle"
                  fontFamily={FONT.mono}
                  fontSize={9}
                  fill={C.mono}
                >
                  {i === 0 ? "0" : i === tickCount ? "1" : `${i}/12`}
                </text>
              )}
            </g>
          );
        })}

        {/* Markers */}
        {spec.markers.map((m) => {
          const x = xFor(m.value);
          return (
            <g key={m.label}>
              {/* Vertical marker line */}
              <line
                x1={x}
                y1={axisY - 28}
                x2={x}
                y2={axisY}
                stroke={m.color}
                strokeWidth={2}
                strokeDasharray="none"
              />
              {/* Diamond marker on axis */}
              <polygon
                points={`${x},${axisY - 6} ${x + 5},${axisY - 1} ${x},${axisY + 4} ${x - 5},${axisY - 1}`}
                fill={m.color}
              />
              {/* Fraction label above */}
              <text
                x={x}
                y={axisY - 34}
                textAnchor="middle"
                fontFamily={FONT.mono}
                fontSize={13}
                fontWeight="600"
                fill={m.color}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
