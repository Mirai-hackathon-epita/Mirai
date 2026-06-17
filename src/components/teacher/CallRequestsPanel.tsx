"use client";

import * as React from "react";
import { C, FONT, RADIUS } from "@/lib/ui/theme";
import { Avatar } from "@/components/ui";
import { api } from "@/lib/ui/api";
import type { CallRequest } from "@/lib/domain/types";

interface CallRequestsPanelProps {
  callRequests: CallRequest[];
  onResolved?: (id: string) => void;
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Dashboard panel showing open student "call teacher" requests. */
export function CallRequestsPanel({ callRequests, onResolved }: CallRequestsPanelProps) {
  const [resolving, setResolving] = React.useState<Set<string>>(new Set());

  async function handleResolve(id: string) {
    setResolving((prev) => new Set(prev).add(id));
    try {
      await api.resolveCall(id);
      onResolved?.(id);
    } catch {
      // silently ignore — the button just stays enabled for retry
    } finally {
      setResolving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: callRequests.length > 0 ? C.amber : C.neutral2,
          }}
        />
        <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: C.ink }}>
          Call requests
          {callRequests.length > 0 && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 12,
                fontFamily: FONT.mono,
                color: C.amber,
                fontWeight: 500,
              }}
            >
              {callRequests.length} open
            </span>
          )}
        </h4>
      </div>
      <p style={{ fontSize: 13, color: C.mono, margin: "0 0 16px" }}>
        Students who asked Mira to call you over.
      </p>

      {/* Empty state */}
      {callRequests.length === 0 && (
        <p style={{ fontSize: 13, color: C.faint, fontStyle: "italic" }}>
          No open requests — all students are working independently.
        </p>
      )}

      {/* Request rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {callRequests.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              background: C.amberBg2,
              borderRadius: RADIUS.md,
              padding: "10px 14px",
            }}
          >
            <Avatar
              initials={getInitials(r.studentName ?? "Student")}
              size={32}
              style={{ fontSize: 12, marginTop: 1, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
                  {r.studentName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: FONT.mono,
                    color: C.amber,
                  }}
                >
                  {r.currentTopicLabel}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: FONT.mono,
                    color: C.faint,
                    marginLeft: "auto",
                  }}
                >
                  {formatTs(r.ts)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.detail}
              </div>
            </div>

            {/* Resolve button */}
            <button
              onClick={() => handleResolve(r.id)}
              disabled={resolving.has(r.id)}
              style={{
                fontSize: 12,
                fontFamily: FONT.sans,
                fontWeight: 600,
                color: resolving.has(r.id) ? C.faint : C.greenDark,
                background: C.greenBg,
                border: `1px solid ${C.green}`,
                borderRadius: RADIUS.sm,
                padding: "4px 10px",
                cursor: resolving.has(r.id) ? "wait" : "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "opacity 0.15s",
              }}
            >
              {resolving.has(r.id) ? "…" : "Resolve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
