import * as React from "react";

/** Render a string with **bold** spans into React nodes. */
export function renderBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement(
        "b",
        { key: i, style: { fontWeight: 600, color: "var(--ink)" } },
        part.slice(2, -2),
      );
    }
    return part;
  });
}

/** "Tue, Mar 18 · 9:30 AM" style timestamp. */
export function formatServerTime(d = new Date()): string {
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/** "9:24" style clock for feed/activity entries. */
export function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
