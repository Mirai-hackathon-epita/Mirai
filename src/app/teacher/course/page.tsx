"use client";

import * as React from "react";
import { TEACHER } from "@/lib/seed/data";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import { C, FONT } from "@/lib/ui/theme";
import { Sidebar } from "@/components/teacher/Sidebar";
import { NumberLine } from "@/components/student/NumberLine";
import { AreaModel } from "@/components/student/AreaModel";
import { api } from "@/lib/ui/api";
import type { VisualizationSpec } from "@/lib/domain/types";

/** Short blurbs for each concept (teacher-facing course view). */
const CONCEPT_BLURBS: Record<string, string> = {
  "whole-number-operations":
    "Foundation arithmetic: add, subtract, multiply and divide whole numbers. Prerequisite for all fraction work.",
  "equivalent-fractions":
    "Build and recognise fractions that represent the same value — e.g. ½ = 2/4 = 4/8.",
  "multiples-factors":
    "Find multiples, factors and the least common multiple (LCM) — essential for finding common denominators.",
  "common-denominators":
    "Rewrite two fractions over a shared denominator so they can be combined or compared directly.",
  "adding-like-fractions":
    "Add fractions that already share a denominator by summing numerators and keeping the bottom.",
  "adding-unlike-fractions":
    "Combine fractions with different denominators: find the LCD, rewrite, add, then simplify.",
  "comparing-fractions":
    "Order and compare fractions by rewriting them with a common denominator or cross-multiplying.",
  "subtracting-fractions":
    "Subtract fractions with unlike denominators using the same LCD strategy as addition.",
  "mixed-numbers":
    "Convert between improper fractions and mixed numbers; add and subtract mixed numbers.",
};

interface ConceptCardProps {
  conceptId: string;
  label: string;
  blurb: string;
}

function ConceptCard({ conceptId, label, blurb }: ConceptCardProps) {
  const [viz, setViz] = React.useState<VisualizationSpec | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleAddViz() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.visualize({
        conceptId,
        currentKind: viz?.kind,
      });
      setViz(res.visualization);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.mono,
            display: "block",
            marginBottom: 6,
          }}
        >
          {conceptId}
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: FONT.sans,
            color: C.ink,
          }}
        >
          {label}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: C.muted,
            fontFamily: FONT.sans,
            lineHeight: 1.55,
          }}
        >
          {blurb}
        </p>
      </div>

      {/* Generated visualization */}
      {viz && (
        <div
          style={{
            background: C.paper3,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: "16px 18px",
          }}
        >
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
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: C.terracotta,
              }}
            >
              ✦ AI Visualization
            </span>
            <button
              onClick={handleAddViz}
              disabled={loading}
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: C.mono,
                background: "transparent",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                padding: "2px 6px",
              }}
            >
              {loading ? "…" : "↺ Regenerate"}
            </button>
          </div>
          {viz.kind === "number-line" && <NumberLine spec={viz} />}
          {viz.kind === "area-model" && <AreaModel spec={viz} />}
        </div>
      )}

      {/* Add Visualization button */}
      {!viz && (
        <div>
          <button
            onClick={handleAddViz}
            disabled={loading}
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: loading ? C.mono : C.terracotta,
              background: C.terracottaBg,
              border: `1px solid rgba(194,83,58,0.2)`,
              borderRadius: 8,
              padding: "6px 13px",
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading ? (
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
      )}
    </div>
  );
}

export default function TeacherCoursePage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      <Sidebar teacher={TEACHER} />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 40px",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.mono,
            }}
          >
            Grade 7 · Math
          </span>
          <h1
            style={{
              margin: "6px 0 10px",
              fontSize: 26,
              fontWeight: 600,
              fontFamily: FONT.serif,
              color: C.ink,
            }}
          >
            Fractions — Course Overview
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: C.muted,
              fontFamily: FONT.sans,
              maxWidth: 560,
            }}
          >
            Click <strong style={{ color: C.terracotta }}>✦ Add Visualization</strong> on any concept to let Mira's AI agent
            generate an interactive visualization on the fly.
          </p>
        </div>

        {/* Concept grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            maxWidth: 900,
          }}
        >
          {FRACTIONS_GRAPH.concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              conceptId={concept.id}
              label={concept.label}
              blurb={CONCEPT_BLURBS[concept.id] ?? concept.blurb}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
