"use client";

import * as React from "react";
import Link from "next/link";
import { use } from "react";
import { STUDENTS, MASTERY } from "@/lib/seed/data";
import { FRACTIONS_GRAPH } from "@/lib/domain/conceptGraph";
import { pct } from "@/lib/domain/mastery";
import { C, FONT } from "@/lib/ui/theme";
import { Avatar } from "@/components/ui";
import { SkillGraph } from "@/components/graph/SkillGraph";
import { GraphDetail } from "@/components/graph/GraphDetail";
import type { ConceptMastery, Student, StudentGraphResponse } from "@/lib/domain/types";

interface Props {
  params: Promise<{ id: string }>;
}

function seedData(id: string): {
  student: Student;
  mastery: ConceptMastery[];
  focusConceptId: string;
} {
  const student =
    STUDENTS.find((s) => s.id === id) ?? STUDENTS[0];
  const mastery = MASTERY[id] ?? MASTERY["maya"];
  const focusConceptId = student.currentConceptId ?? "adding-unlike-fractions";
  return { student, mastery, focusConceptId };
}

export default function SkillGraphPage({ params }: Props) {
  const { id } = use(params);

  const seed = seedData(id);
  const [student, setStudent] = React.useState<Student>(seed.student);
  const [mastery, setMastery] = React.useState<ConceptMastery[]>(seed.mastery);
  const [focusConceptId, setFocusConceptId] = React.useState(seed.focusConceptId);
  const [selectedConceptId, setSelectedConceptId] = React.useState(seed.focusConceptId);

  // Try live API; keep seed on failure
  React.useEffect(() => {
    fetch(`/api/students/${id}/graph`)
      .then((r) => {
        if (!r.ok) throw new Error("not ready");
        return r.json() as Promise<StudentGraphResponse>;
      })
      .then((d) => {
        setStudent(d.student);
        setMastery(d.mastery);
        setFocusConceptId(d.focusConceptId);
        setSelectedConceptId(d.focusConceptId);
      })
      .catch(() => {
        // keep seed data
      });
  }, [id]);

  const overallPct = pct(student.overallMastery);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: C.paper,
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px",
          background: C.paper2,
          borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Back arrow */}
          <Link
            href="/teacher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: C.muted,
              textDecoration: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span
            style={{
              width: 1,
              height: 18,
              background: "rgba(22,26,34,0.14)",
            }}
          />
          <Avatar initials={student.initials} size={30} />
          <h3
            style={{
              fontFamily: FONT.serif,
              fontWeight: 600,
              fontSize: 21,
              margin: 0,
              color: C.ink,
            }}
          >
            {student.id === "maya" ? "Your skill graph" : `${student.name}'s skill graph`}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* Overall mastery */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10.5,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: C.mono,
              }}
            >
              Overall mastery
            </div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 20,
                fontWeight: 500,
                color: C.ink,
              }}
            >
              {overallPct}%
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 12,
              color: C.muted,
            }}
          >
            <LegendDot color="#5C8A6E" label="Mastered" />
            <LegendDot color="#C28A2C" label="Developing" />
            <LegendDot color="#C2533A" label="Needs work" />
            <LegendDot color="#CFC6B5" label="Not started" />
          </div>
        </div>
      </div>

      {/* Body: graph + detail panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SkillGraph
          mastery={mastery}
          focusConceptId={focusConceptId}
          selectedConceptId={selectedConceptId}
          onSelect={setSelectedConceptId}
        />
        <GraphDetail conceptId={selectedConceptId} mastery={mastery} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
