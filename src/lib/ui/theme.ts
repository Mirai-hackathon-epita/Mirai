import type { MasteryStatus, StudentStatus } from "@/lib/domain/types";

// ─── Mira "Editorial Warm" palette ──────────────────────────────────
// Single source of truth for colours, mirrored as CSS variables in
// globals.css. Use these constants in inline styles / SVG fills.

export const C = {
  // surfaces (warm paper)
  bg: "#E7E5E1",
  paper: "#F7F2EA",
  paper2: "#FCFAF6",
  paper3: "#F1ECE2",
  paper4: "#F3EEE4",
  cream: "#FBF7F0", // text on terracotta
  // ink
  ink: "#161A22",
  ink2: "#3A424F",
  muted: "#5A5247",
  mono: "#8B7B68", // mono captions
  faint: "#A89D89",
  // terracotta (primary)
  terracotta: "#C2533A",
  terracottaDark: "#A8392E",
  terracottaBg: "#F6E2D9",
  terracottaBg2: "#FBEDE9",
  // blue (interactive accent)
  blue: "#2C4ADF",
  blueBg: "#DCE3FB",
  // green (mastered / on-track)
  green: "#5C8A6E",
  greenDark: "#3F6A4F",
  greenBg: "#DDE9E1",
  // amber (developing / review)
  amber: "#C28A2C",
  amberBg: "#F5E5C7",
  amberBg2: "#F6ECDA",
  // neutrals
  neutral: "#E7E0D2", // progress track, avatar bg
  neutral2: "#CFC6B5", // not started
  // hairlines
  line: "rgba(22,26,34,0.08)",
  line2: "rgba(22,26,34,0.12)",
} as const;

export const FONT = {
  serif: "Newsreader, serif",
  sans: "Geist, sans-serif",
  mono: "Geist Mono, monospace",
  hand: "Caveat, cursive",
} as const;

/** Bar/fill colour for a mastery status. */
export function statusColor(status: MasteryStatus): string {
  switch (status) {
    case "mastered":
      return C.green;
    case "developing":
      return C.amber;
    case "needs-work":
      return C.terracotta;
    case "not-started":
      return C.neutral2;
    case "locked":
      return C.neutral2;
  }
}

export interface Chip {
  fg: string;
  bg: string;
  label: string;
}

/** Roster status chip styling (dashboard). */
export function statusChip(status: StudentStatus): Chip {
  switch (status) {
    case "stuck":
      return { fg: "#A8392E", bg: "#F2D8D4", label: "Stuck" };
    case "review":
      return { fg: C.amber, bg: C.amberBg, label: "Review" };
    case "on-track":
      return { fg: C.muted, bg: C.paper3, label: "On track" };
    case "ahead":
      return { fg: C.greenDark, bg: C.greenBg, label: "Ahead" };
  }
}

/** Mastery-status chip styling (skill graph legend / detail). */
export function masteryChip(status: MasteryStatus): Chip {
  switch (status) {
    case "mastered":
      return { fg: C.greenDark, bg: C.greenBg, label: "Mastered" };
    case "developing":
      return { fg: C.amber, bg: C.amberBg, label: "Developing" };
    case "needs-work":
      return { fg: C.terracotta, bg: C.terracottaBg, label: "Needs work" };
    case "not-started":
      return { fg: C.muted, bg: C.paper3, label: "Not started" };
    case "locked":
      return { fg: C.faint, bg: C.paper3, label: "Locked" };
  }
}

export const RADIUS = { sm: 6, md: 10, lg: 14, xl: 18 } as const;
