"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import type { VisualizationSpec } from "@/lib/domain/types";

type AreaModelSpec = Extract<VisualizationSpec, { kind: "area-model" }>;

interface AreaModelProps {
  spec: AreaModelSpec;
}

/** Horizontal proportional bar divided into colored segments. */
export function AreaModel({ spec }: AreaModelProps) {
  const total = spec.parts.reduce((sum, p) => sum + p.size, 0) || 100;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: C.mono,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {spec.title}
      </div>

      {/* Segmented bar */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 60,
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${C.line2}`,
        }}
      >
        {spec.parts.map((part, i) => (
          <div
            key={i}
            style={{
              flex: part.size / total,
              background: part.color,
              minWidth: 0,
            }}
            title={`${part.label} (${part.size}%)`}
          />
        ))}
      </div>

      {/* Labels below each segment */}
      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: 8,
        }}
      >
        {spec.parts.map((part, i) => (
          <div
            key={i}
            style={{
              flex: part.size / total,
              textAlign: "center",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: C.ink2,
                whiteSpace: "nowrap",
              }}
            >
              {part.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
