"use client";

import * as React from "react";
import { C, FONT, RADIUS } from "@/lib/ui/theme";
import { api } from "@/lib/ui/api";
import type { MasteryDeadline } from "@/lib/domain/types";

interface DeadlineControlProps {
  deadline: MasteryDeadline | null;
  onDeadlineSet?: (d: MasteryDeadline) => void;
}

/** Compact inline control for setting/viewing the class mastery deadline. */
export function DeadlineControl({ deadline, onDeadlineSet }: DeadlineControlProps) {
  const [topic, setTopic] = React.useState(deadline?.topic ?? "");
  const [date, setDate] = React.useState(deadline?.date ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync if parent updates deadline prop (e.g. initial API load)
  React.useEffect(() => {
    if (deadline) {
      setTopic(deadline.topic);
      setDate(deadline.date);
    }
  }, [deadline]);

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || !date.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { deadline: updated } = await api.setDeadline({ topic: topic.trim(), date });
      setSaved(true);
      onDeadlineSet?.(updated);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save deadline.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSet}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: 12,
          fontFamily: FONT.mono,
          color: C.mono,
          whiteSpace: "nowrap",
        }}
      >
        Deadline:
      </span>

      {/* Topic input */}
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={saving}
        style={{
          fontSize: 13,
          fontFamily: FONT.sans,
          color: C.ink,
          background: C.paper,
          border: `1px solid ${C.line2}`,
          borderRadius: RADIUS.sm,
          padding: "4px 8px",
          outline: "none",
          width: 160,
        }}
      />

      {/* Date input */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={saving}
        style={{
          fontSize: 13,
          fontFamily: FONT.mono,
          color: C.ink,
          background: C.paper,
          border: `1px solid ${C.line2}`,
          borderRadius: RADIUS.sm,
          padding: "4px 8px",
          outline: "none",
          cursor: "pointer",
        }}
      />

      {/* Set button */}
      <button
        type="submit"
        disabled={saving || !topic.trim() || !date.trim()}
        style={{
          fontSize: 12,
          fontFamily: FONT.sans,
          fontWeight: 600,
          color: saving || !topic.trim() || !date.trim() ? C.mono : C.paper2,
          background: saving || !topic.trim() || !date.trim() ? C.neutral : C.terracotta,
          border: "none",
          borderRadius: RADIUS.sm,
          padding: "5px 12px",
          cursor: saving ? "wait" : "pointer",
          transition: "background 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {saving ? "Saving…" : "Set deadline"}
      </button>

      {/* Confirmation / error feedback */}
      {saved && (
        <span style={{ fontSize: 12, color: C.green, fontFamily: FONT.mono }}>
          Saved — Mira re-paced the class.
        </span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: C.terracotta, fontFamily: FONT.mono }}>
          {error}
        </span>
      )}
    </form>
  );
}
