"use client";

import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";
import { Avatar } from "@/components/ui";
import type { FlagInfo, Student } from "@/lib/domain/types";

type Flagged = Student & { flag: FlagInfo };

/** "Mirai flagged these students" — pull-aside list for today's tutorial. */
export function FlaggedList({ flagged }: { flagged: Flagged[] }) {
  return (
    <div
      style={{
        background: C.paper2,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 20,
        order: 2,
      }}
    >
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
            background: C.terracotta,
          }}
        />
        <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          Mirai flagged these students
        </h4>
      </div>
      <p style={{ fontSize: 13, color: C.mono, margin: "0 0 16px" }}>
        Pull these aside in today&apos;s tutorial.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {flagged.map((s) => {
          const reasonColor =
            s.flag.severity === "high" ? C.terracottaDark : C.amber;
          return (
            <Link
              key={s.id}
              href={`/teacher/student/${s.id}`}
              style={{
                display: "flex",
                gap: 13,
                alignItems: "flex-start",
              }}
            >
              <Avatar
                initials={s.initials}
                size={32}
                style={{ fontSize: 12, marginTop: 1 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {s.name}
                  <span
                    style={{
                      fontWeight: 400,
                      color: reasonColor,
                      fontSize: 12,
                      fontFamily: FONT.mono,
                      marginLeft: 4,
                    }}
                  >
                    {s.flag.reason}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>
                  {s.flag.detail}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
