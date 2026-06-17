"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { Icon, MiraMark, Button } from "@/components/ui";
import { api } from "@/lib/ui/api";
import type { Exercise, GradeResult, OcrResponse } from "@/lib/domain/types";

interface WorkPanelProps {
  exercise: Exercise;
  onNextProblem: () => void;
  onAskHint: () => void;
}

type DrawMode = "draw" | "type";

export function WorkPanel({ exercise, onNextProblem, onAskHint }: WorkPanelProps) {
  const [drawMode, setDrawMode] = React.useState<DrawMode>("type");
  const [answer, setAnswer] = React.useState(
    "¾ + ⅙\n= 9⁄12 + 2⁄12\n= 11⁄12",
  );
  const [ocrResult, setOcrResult] = React.useState<OcrResponse | null>(null);
  const [ocrLoading, setOcrLoading] = React.useState(false);
  const [gradeResult, setGradeResult] = React.useState<GradeResult | null>(null);
  const [gradeLoading, setGradeLoading] = React.useState(false);

  // Canvas refs
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const isDrawingRef = React.useRef(false);
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);

  // ─── Canvas drawing ───────────────────────────────────────────────
  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
    e.preventDefault();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    const last = lastPosRef.current ?? pos;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
    e.preventDefault();
  }

  function stopDraw() {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Draw lined-paper guidelines on canvas mount
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || drawMode !== "draw") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(44,74,223,0.06)";
    ctx.lineWidth = 1;
    for (let y = 58; y < canvas.height; y += 38) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [drawMode]);

  // ─── OCR ─────────────────────────────────────────────────────────
  async function handleOcr() {
    setOcrLoading(true);
    try {
      const result = await api.ocr({ sample: "maya-fractions" });
      setOcrResult(result);
    } catch {
      // Fallback
      setOcrResult({
        text: "3/4 + 1/6 = 9/12 + 2/12 = 11/12",
        confidence: "high",
      });
    } finally {
      setOcrLoading(false);
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────
  async function handleSubmit() {
    setGradeLoading(true);
    try {
      const res = await api.submit("maya", {
        exerciseId: exercise.id,
        answer: ocrResult?.text ?? answer,
        viaOcr: !!ocrResult,
      });
      setGradeResult(res.grade);
    } catch {
      // Fallback seed grade result
      setGradeResult({
        correct: true,
        readBack: "3/4 + 1/6 = 9/12 + 2/12 = 11/12",
        steps: [
          { step: "Find common denominator: 12", ok: true },
          { step: "Rewrite: 9/12 + 2/12", ok: true },
          { step: "Add: 11/12", ok: true },
        ],
        failingStepIndex: null,
        tutorMessage:
          "You found the common denominator on your own this time — that's the step you missed yesterday. I'll nudge the next one to **difficulty 5** and bring in a subtraction.",
        nextDifficulty: 5,
        masteryDelta: 0.08,
      });
    } finally {
      setGradeLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "28px 30px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        background: C.paper4,
      }}
    >
      {/* Header: "Your work" + toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4
          style={{
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
            fontFamily: FONT.sans,
            color: C.ink,
          }}
        >
          Your work
        </h4>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Draw/Type toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              background: C.paper2,
              border: `1px solid ${C.line2}`,
              borderRadius: 8,
              overflow: "hidden",
              marginRight: 6,
            }}
          >
            {(["draw", "type"] as DrawMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDrawMode(mode)}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "5px 11px",
                  border: "none",
                  background: drawMode === mode ? C.terracotta : "transparent",
                  color: drawMode === mode ? C.cream : C.muted,
                  cursor: "pointer",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Pencil */}
          <span
            title="Pencil"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: C.paper2,
              border: `1px solid rgba(22,26,34,0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
              cursor: "pointer",
            }}
          >
            <Icon name="pencil" size={16} />
          </span>

          {/* Eraser */}
          <span
            title="Eraser"
            onClick={drawMode === "draw" ? clearCanvas : undefined}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: C.paper2,
              border: `1px solid rgba(22,26,34,0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
              cursor: "pointer",
            }}
          >
            <Icon name="eraser" size={16} />
          </span>

          {/* Undo */}
          <span
            title="Undo"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: C.paper2,
              border: `1px solid rgba(22,26,34,0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
              cursor: "pointer",
            }}
          >
            <Icon name="undo" size={16} />
          </span>
        </div>
      </div>

      {/* Writing area */}
      <div
        style={{
          position: "relative",
          background: C.paper2,
          border: `1px solid rgba(22,26,34,0.1)`,
          borderRadius: 14,
          minHeight: 230,
          overflow: "hidden",
        }}
      >
        {/* OCR read badge */}
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT.mono,
            fontSize: 10.5,
            color: C.mono,
            background: C.paper3,
            borderRadius: 5,
            padding: "3px 8px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
              display: "inline-block",
            }}
          />
          read by OCR
        </span>

        {drawMode === "type" ? (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            style={{
              width: "100%",
              height: "100%",
              minHeight: 230,
              boxSizing: "border-box",
              padding: "22px 24px",
              paddingTop: 22,
              border: "none",
              outline: "none",
              resize: "none",
              background: "transparent",
              backgroundImage:
                "linear-gradient(rgba(44,74,223,0.06) 1px, transparent 1px)",
              backgroundSize: "100% 38px",
              backgroundPosition: "0 20px",
              fontFamily: FONT.hand,
              fontSize: 40,
              lineHeight: "38px",
              color: C.ink,
              display: "block",
            }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={520}
            height={230}
            style={{
              display: "block",
              width: "100%",
              height: 230,
              cursor: "crosshair",
              touchAction: "none",
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        )}
      </div>

      {/* OCR section */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={handleOcr}
          disabled={ocrLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: C.blue,
            background: C.blueBg,
            border: `1px solid rgba(44,74,223,0.2)`,
            borderRadius: 8,
            padding: "7px 13px",
            cursor: ocrLoading ? "not-allowed" : "pointer",
            opacity: ocrLoading ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          <Icon name="camera" size={13} />
          {ocrLoading ? "Reading…" : "OCR"}
        </button>

        {ocrResult ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontFamily: FONT.mono,
              fontSize: 12,
              color: C.muted,
              background: C.paper2,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "11px 14px",
            }}
          >
            <span style={{ color: C.blue, flexShrink: 0 }}>Mira read →</span>
            {ocrResult.text}
          </div>
        ) : (
          <span
            style={{
              flex: 1,
              fontFamily: FONT.mono,
              fontSize: 11,
              color: C.faint,
              padding: "0 4px",
            }}
          >
            Click OCR to let Mira read your handwriting
          </span>
        )}
      </div>

      {/* Submit button (shown when OCR result is available and no grade yet) */}
      {ocrResult && !gradeResult && (
        <Button
          variant="primary"
          block
          onClick={handleSubmit}
          disabled={gradeLoading}
          style={{ fontSize: 15 }}
        >
          {gradeLoading ? "Grading…" : "Submit answer"}
        </Button>
      )}

      {/* Feedback card */}
      {gradeResult && (
        <FeedbackCard result={gradeResult} />
      )}

      {/* Bottom action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: "auto",
          paddingTop: 4,
        }}
      >
        <button
          onClick={onNextProblem}
          style={{
            background: C.terracotta,
            color: C.cream,
            borderRadius: 10,
            padding: "13px 24px",
            fontSize: 15,
            fontWeight: 500,
            flex: 1,
            textAlign: "center",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT.sans,
            transition: "filter 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(0.93)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          Next problem →
        </button>
        <button
          onClick={onAskHint}
          style={{
            background: C.paper2,
            border: `1px solid rgba(22,26,34,0.14)`,
            color: C.muted,
            borderRadius: 10,
            padding: "13px 20px",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT.sans,
            transition: "filter 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(0.96)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          Ask Mira for a hint
        </button>
      </div>
    </div>
  );
}

// ─── Feedback sub-component ───────────────────────────────────────────
function FeedbackCard({ result }: { result: GradeResult }) {
  // Render **bold** in tutor message
  const messageParts = result.tutorMessage.split(/(\*\*[^*]+\*\*)/g).map(
    (part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <b key={i} style={{ fontWeight: 600 }}>
            {part.slice(2, -2)}
          </b>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    },
  );

  if (result.correct) {
    return (
      <div
        style={{
          background: C.paper2,
          border: `1px solid rgba(92,138,110,0.4)`,
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={14} style={{ color: "#fff" }} />
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: C.greenDark,
              fontFamily: FONT.sans,
            }}
          >
            Correct — and you showed every step.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <MiraMark size={24} />
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: C.ink2,
              margin: 0,
              fontFamily: FONT.sans,
            }}
          >
            {messageParts}
          </p>
        </div>
      </div>
    );
  }

  // Error case
  const failingStep =
    result.failingStepIndex !== null
      ? result.steps[result.failingStepIndex]
      : null;

  return (
    <div
      style={{
        background: C.terracottaBg2,
        border: `1px solid rgba(194,83,58,0.3)`,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: C.terracotta,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: C.cream,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONT.sans,
          }}
        >
          ✕
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: C.terracotta,
            fontFamily: FONT.sans,
          }}
        >
          Not quite — let&apos;s look at step{" "}
          {result.failingStepIndex !== null ? result.failingStepIndex + 1 : "?"}
          .
        </span>
      </div>
      {failingStep && (
        <p
          style={{
            fontSize: 13,
            color: C.muted,
            margin: "0 0 10px",
            fontFamily: FONT.mono,
            background: C.terracottaBg,
            borderRadius: 6,
            padding: "6px 10px",
          }}
        >
          {failingStep.step}
          {failingStep.note && (
            <span style={{ display: "block", color: C.terracotta, marginTop: 3 }}>
              {failingStep.note}
            </span>
          )}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <MiraMark size={24} />
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: C.ink2,
            margin: 0,
            fontFamily: FONT.sans,
          }}
        >
          {messageParts}
        </p>
      </div>
    </div>
  );
}
