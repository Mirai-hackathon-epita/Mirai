"use client";

import * as React from "react";
import Link from "next/link";
import { C, FONT } from "@/lib/ui/theme";
import { Logo, Avatar, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import type { Teacher } from "@/lib/domain/types";

interface NavItem {
  icon: IconName;
  label: string;
  active?: boolean;
}

const NAV: NavItem[] = [
  { icon: "grid", label: "Overview", active: true },
  { icon: "users", label: "Students" },
  { icon: "activity", label: "Activity" },
  { icon: "book", label: "Course library" },
  { icon: "settings", label: "Settings" },
];

/** Teacher dashboard left navigation rail. */
export function Sidebar({ teacher }: { teacher: Teacher }) {
  return (
    <div
      style={{
        width: 230,
        flex: "none",
        background: C.paper2,
        borderRight: `1px solid ${C.line}`,
        padding: "22px 18px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href="/" style={{ padding: "0 8px 22px" }}>
        <Logo size={22} />
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 12px",
              borderRadius: 9,
              background: item.active ? C.terracottaBg : "transparent",
              color: item.active ? C.terracotta : C.muted,
              fontSize: 14,
              fontWeight: item.active ? 500 : 400,
            }}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <Avatar
          initials={teacher.initials}
          size={34}
          bg={C.blue}
          fg="#fff"
          style={{ fontSize: 13 }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{teacher.name}</div>
          <div
            style={{ fontFamily: FONT.mono, fontSize: 11, color: C.mono }}
          >
            {teacher.subject}
          </div>
        </div>
      </div>
    </div>
  );
}
