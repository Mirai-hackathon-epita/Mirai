"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import type { FeedEvent, FeedKind } from "@/lib/domain/types";
import { clock } from "@/lib/ui/format";

const KIND_STYLE: Record<
  FeedKind,
  { fg: string; bg: string; label: string }
> = {
  plan: { fg: C.blue, bg: C.blueBg, label: "plan" },
  generate: { fg: C.blue, bg: C.blueBg, label: "generate" },
  act: { fg: C.blue, bg: C.blueBg, label: "act" },
  grade: { fg: C.amber, bg: C.amberBg, label: "grade" },
  diagnose: { fg: C.terracotta, bg: C.terracottaBg, label: "diagnose" },
  escalate: { fg: C.terracotta, bg: C.terracottaBg, label: "escalate" },
  reflect: { fg: C.green, bg: C.greenBg, label: "reflect" },
  replan: { fg: C.amber, bg: C.amberBg, label: "replan" },
};

interface AgentFeedProps {
  events: FeedEvent[];
}

export function AgentFeed({ events }: AgentFeedProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  // Show last 5 events
  const visible = events.slice(-5).reverse();

  return (
    <div
      style={{
        background: C.ink,
        borderTop: `1px solid rgba(255,255,255,0.06)`,
        flex: "none",
      }}
    >
      {/* Header bar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 28px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {/* Pulse dot */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.green,
              display: "inline-block",
              boxShadow: `0 0 0 3px rgba(92,138,110,0.25)`,
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Agent reasoning feed
          </span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            · live
          </span>
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 11,
            fontFamily: FONT.mono,
            userSelect: "none",
          }}
        >
          {collapsed ? "▲ show" : "▼ hide"}
        </span>
      </button>

      {/* Events list */}
      {!collapsed && (
        <div
          style={{
            padding: "0 28px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {visible.map((ev) => {
            const style = KIND_STYLE[ev.kind] ?? {
              fg: C.mono,
              bg: C.paper3,
              label: ev.kind,
            };
            return (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {/* Timestamp */}
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.25)",
                    flexShrink: 0,
                    paddingTop: 1,
                    minWidth: 48,
                  }}
                >
                  {clock(ev.ts)}
                </span>

                {/* Kind badge */}
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: style.fg,
                    background: "transparent",
                    border: `1px solid ${style.fg}`,
                    borderRadius: 4,
                    padding: "1px 6px",
                    flexShrink: 0,
                    opacity: 0.85,
                  }}
                >
                  {style.label}
                </span>

                {/* Text */}
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.45,
                  }}
                >
                  {ev.text}
                </span>
              </div>
            );
          })}

          {visible.length === 0 && (
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              No events yet — agent loop starts when student submits.
            </span>
          )}
        </div>
      )}

      {/* CSS keyframes for pulse dot */}
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(92,138,110,0.55); }
          70%  { box-shadow: 0 0 0 6px rgba(92,138,110,0); }
          100% { box-shadow: 0 0 0 0 rgba(92,138,110,0); }
        }
      `}</style>
    </div>
  );
}
