"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { Icon, MiraiMark } from "@/components/ui";

const FALLBACK =
  "Class is mostly stuck on common denominators — focus tutorial time there.";

/** Ask Mirai a free-form question about the class. */
export function AskMirai() {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/teacher/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as { answer: string };
      setAnswer(data.answer);
    } catch {
      setAnswer(FALLBACK);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <MiraiMark size={22} />
        <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          Ask Mirai
        </h4>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the class, a student, or a topic…"
          rows={3}
          style={{
            width: "100%",
            resize: "none",
            background: C.paper,
            border: `1px solid ${C.line2}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontFamily: FONT.sans,
            fontSize: 13,
            color: C.ink,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            background: loading || !question.trim() ? C.neutral : C.terracotta,
            color: loading || !question.trim() ? C.muted : C.cream,
            border: "none",
            borderRadius: 9,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 500,
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            alignSelf: "flex-end",
          }}
        >
          <Icon name="send" size={14} />
          {loading ? "Asking…" : "Send"}
        </button>
      </form>
      {answer && (
        <div
          style={{
            marginTop: 14,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: C.ink2,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
