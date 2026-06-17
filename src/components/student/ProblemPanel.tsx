"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { Chip, Icon } from "@/components/ui";
import { FractionBars } from "./FractionBars";
import { NumberLine } from "./NumberLine";
import { AreaModel } from "./AreaModel";
import { api } from "@/lib/ui/api";
import type { Exercise, VisualizationSpec } from "@/lib/domain/types";

interface ProblemPanelProps {
  exercise: Exercise;
  problemNumber: number;
}

export function ProblemPanel({ exercise, problemNumber }: ProblemPanelProps) {
  const [extraViz, setExtraViz] = React.useState<VisualizationSpec | null>(null);
  const [vizLoading, setVizLoading] = React.useState(false);

  async function handleAddVisualization() {
    if (vizLoading) return;
    setVizLoading(true);
    try {
      const res = await api.visualize({
        conceptId: exercise.conceptId ?? "adding-unlike-fractions",
        currentKind: extraViz?.kind ?? exercise.visualization?.kind ?? "fraction-bars",
        expression: exercise.expression,
        answer: exercise.answer,
      });
      setExtraViz(res.visualization);
    } catch {
      // silently fail on demo
    } finally {
      setVizLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "28px 30px",
        overflowY: "auto",
        borderRight: `1px solid ${C.line}`,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Problem header + instruction */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: C.mono,
            }}
          >
            Problem {problemNumber}
          </span>

          <Chip
            fg={C.terracotta}
            bg={C.terracottaBg}
            mono
            style={{ fontWeight: 600, fontSize: 11 }}
          >
            <span style={{ color: C.terracotta, fontWeight: 600 }}>
              Difficulty {exercise.difficulty} / 10
            </span>
          </Chip>
        </div>

        <p
          style={{
            fontSize: 15,
            color: C.muted,
            margin: "0 0 12px",
            lineHeight: 1.5,
            fontFamily: FONT.sans,
          }}
        >
          {exercise.prompt}
        </p>

        {/* Big expression card */}
        <div
          style={{
            background: C.paper2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: "30px 28px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT.serif,
              fontSize: 54,
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: C.ink,
            }}
          >
            {exercise.expression}
          </span>
        </div>
      </div>

      {/* Answer — visible for demo */}
      <div style={{ textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: FONT.mono,
            fontSize: 12,
            color: C.muted,
            background: C.paper2,
            border: `1px dashed ${C.line2}`,
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          Answer: {exercise.answer}
        </span>
      </div>

      {/* Fraction-bar visualization card */}
      {exercise.visualization && exercise.visualization.kind === "fraction-bars" && (
        <div
          style={{
            background: C.paper2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 20,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.blue,
                  display: "inline-block",
                }}
              />
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: FONT.sans,
                  color: C.ink,
                }}
              >
                {exercise.visualization.title}
              </h4>
            </div>

            <Chip
              fg={C.blue}
              bg={C.blueBg}
              mono
              style={{ gap: 6, fontSize: 11 }}
            >
              <Icon name="play" size={11} style={{ color: C.blue }} />
              Interactive
            </Chip>
          </div>

          <FractionBars spec={exercise.visualization} />
        </div>
      )}

      {/* Extra generated visualization */}
      {extraViz && (
        <div
          style={{
            background: C.paper2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.terracotta,
                  display: "inline-block",
                }}
              />
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: FONT.sans,
                  color: C.ink,
                }}
              >
                {extraViz.kind === "number-line"
                  ? extraViz.title
                  : extraViz.kind === "area-model"
                    ? extraViz.title
                    : ""}
              </h4>
            </div>
            <Chip fg={C.terracotta} bg={C.terracottaBg} mono style={{ fontSize: 11 }}>
              ✦ AI Generated
            </Chip>
          </div>

          {extraViz.kind === "number-line" && <NumberLine spec={extraViz} />}
          {extraViz.kind === "area-model" && <AreaModel spec={extraViz} />}
        </div>
      )}

      {/* Add Visualization button */}
      <div>
        <button
          onClick={handleAddVisualization}
          disabled={vizLoading}
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: vizLoading ? C.mono : C.terracotta,
            background: C.terracottaBg,
            border: `1px solid rgba(194,83,58,0.2)`,
            borderRadius: 8,
            padding: "6px 13px",
            cursor: vizLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {vizLoading ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  border: `2px solid ${C.terracotta}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Generating…
            </>
          ) : (
            <>✦ Add Visualization</>
          )}
        </button>
      </div>
    </div>
  );
}
