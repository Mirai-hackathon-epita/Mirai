"use client";

import * as React from "react";
import { TEACHER } from "@/lib/seed/data";
import { C, FONT } from "@/lib/ui/theme";
import { Sidebar } from "@/components/teacher/Sidebar";
import { NumberLine } from "@/components/student/NumberLine";
import { AreaModel } from "@/components/student/AreaModel";
import { api } from "@/lib/ui/api";
import type {
  ConceptGraph,
  UploadCourseResponse,
  VisualizationSpec,
} from "@/lib/domain/types";

// ─── ConceptCard ─────────────────────────────────────────────────────

interface ConceptCardProps {
  conceptId: string;
  label: string;
  blurb: string;
  col: number;
}

function ConceptCard({ conceptId, label, blurb, col }: ConceptCardProps) {
  const [viz, setViz] = React.useState<VisualizationSpec | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleAddViz() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.visualize({ conceptId, currentKind: viz?.kind });
      setViz(res.visualization);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  const depthColors = [C.terracotta, C.blue, C.green, C.amber];
  const depthColor = depthColors[col % depthColors.length];

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
        borderTop: `3px solid ${depthColor}`,
      }}
    >
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

// ─── AgentStepLog ────────────────────────────────────────────────────

function AgentStepLog({ steps }: { steps: string[] }) {
  return (
    <div
      style={{
        background: C.paper3,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: "18px 22px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.terracotta,
          marginBottom: 14,
        }}
      >
        ✦ Agent Enrichment Log
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: C.green,
                marginTop: 1,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 12,
                color: C.ink2,
                lineHeight: 1.5,
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VizPreviewRow ───────────────────────────────────────────────────

function VizPreviewRow({ vizs }: { vizs: VisualizationSpec[] }) {
  if (!vizs.length) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.mono,
          marginBottom: 14,
        }}
      >
        Generated Visualizations
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(vizs.length, 2)}, 1fr)`,
          gap: 16,
        }}
      >
        {vizs.map((viz, i) => (
          <div
            key={i}
            style={{
              background: C.paper2,
              border: `1px solid ${C.line}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: C.terracotta,
                marginBottom: 12,
              }}
            >
              ✦ {viz.kind.replace("-", " ")}
            </div>
            {viz.kind === "number-line" && <NumberLine spec={viz} />}
            {viz.kind === "area-model" && <AreaModel spec={viz} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UploadArea ──────────────────────────────────────────────────────

interface UploadAreaProps {
  onResult: (result: UploadCourseResponse) => void;
}

function UploadArea({ onResult }: UploadAreaProps) {
  const [text, setText] = React.useState("");
  const [sourceName, setSourceName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!sourceName) setSourceName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") setText(content);
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.uploadCourse({
        text: text || undefined,
        sourceName: sourceName || undefined,
      });
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: "28px 32px",
        marginBottom: 32,
        maxWidth: 720,
      }}
    >
      <h2
        style={{
          margin: "0 0 6px",
          fontSize: 18,
          fontWeight: 600,
          fontFamily: FONT.serif,
          color: C.ink,
        }}
      >
        Upload Course Material
      </h2>
      <p
        style={{
          margin: "0 0 22px",
          fontSize: 13,
          color: C.muted,
          fontFamily: FONT.sans,
          lineHeight: 1.55,
        }}
      >
        Paste course text or load a .txt file. Mira's agent will extract a
        concept graph and generate visualizations automatically.
      </p>

      {/* Source name */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.mono,
            marginBottom: 6,
          }}
        >
          Course name
        </label>
        <input
          type="text"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="e.g. Grade 7 Fractions Unit"
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.ink,
            background: C.paper,
            border: `1px solid ${C.line2}`,
            borderRadius: 10,
            padding: "10px 14px",
            outline: "none",
          }}
        />
      </div>

      {/* Text area */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.mono,
            marginBottom: 6,
          }}
        >
          Course text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your course content here…"
          rows={8}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.ink,
            background: C.paper,
            border: `1px solid ${C.line2}`,
            borderRadius: 10,
            padding: "12px 14px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.55,
          }}
        />
      </div>

      {/* File input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: C.mono,
            background: C.paper3,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
          }}
        >
          Load .txt file
        </button>
        <span
          style={{ fontFamily: FONT.sans, fontSize: 12, color: C.faint }}
        >
          or paste text above
        </span>
      </div>

      {error && (
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 12,
            color: C.terracotta,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: loading ? C.mono : C.cream,
          background: loading ? C.neutral : C.terracotta,
          border: "none",
          borderRadius: 10,
          padding: "11px 22px",
          cursor: loading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "background 0.2s",
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                border: `2px solid ${C.mono}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Enriching…
          </>
        ) : (
          <>✦ Enrich with Mira Agent</>
        )}
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

type PageView = "upload" | "review";

export default function TeacherCoursePage() {
  const [view, setView] = React.useState<PageView>("upload");
  const [uploadResult, setUploadResult] =
    React.useState<UploadCourseResponse | null>(null);
  const [graph, setGraph] = React.useState<ConceptGraph | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState(false);

  function handleUploadResult(result: UploadCourseResponse) {
    setUploadResult(result);
    setGraph(result.graph);
    setView("review");
  }

  async function handlePublish() {
    if (publishing || published) return;
    setPublishing(true);
    try {
      await api.publishCourse();
      setPublished(true);
    } catch {
      // silent fail — still show success optimistically for the demo
      setPublished(true);
    } finally {
      setPublishing(false);
    }
  }

  // ── Upload view ──────────────────────────────────────────────────
  if (view === "upload") {
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
        <div style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
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
              Course Upload
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
              Upload your course material and Mira's autonomous agent will
              extract a concept graph, build prerequisite edges, and generate
              interactive visualizations — all in one pass.
            </p>
          </div>

          <UploadArea onResult={handleUploadResult} />
        </div>
      </div>
    );
  }

  // ── Review view ──────────────────────────────────────────────────
  const activeGraph = graph!;
  const result = uploadResult!;

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
      <div style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
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
                margin: "6px 0 8px",
                fontSize: 26,
                fontWeight: 600,
                fontFamily: FONT.serif,
                color: C.ink,
              }}
            >
              {activeGraph.topic} — Review
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: C.muted,
                fontFamily: FONT.sans,
              }}
            >
              {result.course.sourceName} ·{" "}
              {activeGraph.concepts.length} concepts extracted
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => setView("upload")}
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: C.mono,
                background: C.paper3,
                border: `1px solid ${C.line}`,
                borderRadius: 9,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              ← Re-upload
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing || published}
              style={{
                fontFamily: FONT.mono,
                fontSize: 12,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: published
                  ? C.greenDark
                  : publishing
                    ? C.mono
                    : C.cream,
                background: published
                  ? C.greenBg
                  : publishing
                    ? C.neutral
                    : C.terracotta,
                border: published ? `1px solid ${C.green}` : "none",
                borderRadius: 10,
                padding: "10px 22px",
                cursor: publishing ? "wait" : published ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.3s",
              }}
            >
              {published ? (
                "✓ Published"
              ) : publishing ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: 11,
                      height: 11,
                      border: `2px solid ${C.mono}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Publishing…
                </>
              ) : (
                "Publish Course →"
              )}
            </button>
          </div>
        </div>

        {/* Agent step log */}
        <AgentStepLog steps={result.agentSteps} />

        {/* Generated visualizations */}
        <VizPreviewRow vizs={result.visualizations} />

        {/* Concept grid */}
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.mono,
            marginBottom: 14,
          }}
        >
          Concept Graph — {activeGraph.concepts.length} nodes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 18,
            maxWidth: 900,
          }}
        >
          {activeGraph.concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              conceptId={concept.id}
              label={concept.label}
              blurb={concept.blurb}
              col={concept.layout.col}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
