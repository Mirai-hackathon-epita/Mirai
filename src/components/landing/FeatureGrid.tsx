import * as React from "react";
import { C } from "@/lib/ui/theme";
import { Icon, type IconName } from "@/components/ui";

// The four product features, each with a coloured icon tile.
// Icon-tile background / colour pairs come straight from screen 01.

interface Feature {
  icon: IconName;
  tileBg: string;
  tileFg: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: "sparkle",
    tileBg: C.terracottaBg,
    tileFg: C.terracotta,
    title: "Works on its own",
    body: "Generates personalized exercises for every student and adjusts difficulty as they go.",
  },
  {
    icon: "graph",
    tileBg: C.blueBg,
    tileFg: C.blue,
    title: "A skill graph per student",
    body: "Maps each learner's strengths and gaps, and remembers everything across the year.",
  },
  {
    icon: "edit",
    tileBg: C.greenBg,
    tileFg: C.greenDark,
    title: "Grades handwriting",
    body: "Students solve on paper or screen. Mirai reads their handwritten math and grades it instantly.",
  },
  {
    icon: "bell",
    tileBg: C.amberBg,
    tileFg: C.amber,
    title: "Tells you who to help",
    body: "Weekly feedback surfaces the students who are stuck — so you know who to pull aside in tutorial.",
  },
];

export function FeatureGrid() {
  return (
    <section
      style={{
        background: C.paper3,
        borderRadius: 18,
        padding: 44,
      }}
    >
      <div
        className="mira-feature-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 28,
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="fade-up"
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: f.tileBg,
                color: f.tileFg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Icon name={f.icon} size={20} strokeWidth={1.6} />
            </div>
            <h4 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 7px" }}>
              {f.title}
            </h4>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: C.muted,
                margin: 0,
              }}
            >
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
