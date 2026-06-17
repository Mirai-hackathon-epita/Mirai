import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";

// ─── Shared presentational primitives ───────────────────────────────
// Pure render (no hooks) so they work in both server and client components.
// Faithful to the Editorial Warm design; extend via `style`.

/** "Mirai." wordmark. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: FONT.serif,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.01em",
        color: C.ink,
      }}
    >
      Mirai<span style={{ color: C.terracotta }}>.</span>
    </span>
  );
}

/** The terracotta "M" avatar that speaks Mirai's tutor messages. */
export function MiraiMark({ size = 24 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: C.terracotta,
        color: C.cream,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.serif,
        fontWeight: 600,
        fontSize: Math.round(size * 0.58),
      }}
    >
      M
    </span>
  );
}

export function Eyebrow({
  children,
  color = C.mono,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 13,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  style,
  raised,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  raised?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        boxShadow: raised ? "var(--shadow-raised)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Avatar({
  initials,
  size = 32,
  bg = C.neutral,
  fg = C.muted,
  style,
}: {
  initials: string;
  size?: number;
  bg?: string;
  fg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 600,
        ...style,
      }}
    >
      {initials}
    </span>
  );
}

export interface ChipStyle {
  fg: string;
  bg: string;
}

export function Chip({
  children,
  fg = C.muted,
  bg = C.paper3,
  mono,
  style,
}: {
  children: React.ReactNode;
  fg?: string;
  bg?: string;
  mono?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: mono ? FONT.mono : FONT.sans,
        fontSize: mono ? 11 : 11,
        fontWeight: 600,
        color: fg,
        background: bg,
        borderRadius: 6,
        padding: "3px 8px",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  color = C.green,
  track = C.neutral,
  height = 6,
  radius = 3,
  style,
}: {
  value: number; // 0..1
  color?: string;
  track?: string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const w = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span
      style={{
        display: "block",
        height,
        borderRadius: radius,
        background: track,
        overflow: "hidden",
        ...style,
      }}
    >
      <span
        style={{
          display: "block",
          height: "100%",
          width: `${w}%`,
          background: color,
          borderRadius: radius,
          transition: "width 0.5s ease",
        }}
      />
    </span>
  );
}
