"use client";

import * as React from "react";
import {
  STUDENTS,
  TEACHER,
  ACTIVITY,
  CLASS_STATS,
  TOPIC_MASTERY,
} from "@/lib/seed/data";
import { C, FONT } from "@/lib/ui/theme";
import { Icon } from "@/components/ui";
import { Sidebar } from "@/components/teacher/Sidebar";
import { StatCards } from "@/components/teacher/StatCards";
import { FlaggedList } from "@/components/teacher/FlaggedList";
import { RosterTable } from "@/components/teacher/RosterTable";
import { ActivityTimeline } from "@/components/teacher/ActivityTimeline";
import { TopicMasteryBars } from "@/components/teacher/TopicMasteryBars";
import { AskMira } from "@/components/teacher/AskMira";
import { DeadlineControl } from "@/components/teacher/DeadlineControl";
import { CallRequestsPanel } from "@/components/teacher/CallRequestsPanel";
import { api } from "@/lib/ui/api";
import type {
  ActivityItem,
  CallRequest,
  ClassStats,
  DashboardResponse,
  FlagInfo,
  MasteryDeadline,
  Student,
  TopicMastery,
} from "@/lib/domain/types";
import { formatServerTime } from "@/lib/ui/format";

type FlaggedStudent = Student & { flag: FlagInfo };

function seedFlagged(): FlaggedStudent[] {
  return STUDENTS.filter(
    (s): s is FlaggedStudent => s.flag != null,
  ).slice(0, 3);
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = React.useState(TEACHER);
  const [stats, setStats] = React.useState<ClassStats>(CLASS_STATS);
  const [flagged, setFlagged] = React.useState<FlaggedStudent[]>(seedFlagged());
  const [roster, setRoster] = React.useState<Student[]>(STUDENTS);
  const [activity, setActivity] = React.useState<ActivityItem[]>(ACTIVITY);
  const [topics, setTopics] = React.useState<TopicMastery[]>(TOPIC_MASTERY);
  const [deadline, setDeadline] = React.useState<MasteryDeadline | null>(null);
  const [callRequests, setCallRequests] = React.useState<CallRequest[]>([]);
  const [serverTime, setServerTime] = React.useState(
    "Tue, Mar 18 · 9:30 AM",
  );

  function applyDashboard(d: DashboardResponse) {
    setTeacher(d.teacher);
    setStats(d.classStats);
    setFlagged(d.flagged);
    setRoster(d.roster);
    setActivity(d.activity);
    setTopics(d.topicMastery);
    setDeadline(d.deadline ?? null);
    setCallRequests(d.callRequests ?? []);
    setServerTime(d.serverTime);
  }

  function fetchDashboard() {
    api
      .dashboard()
      .then(applyDashboard)
      .catch(() => {
        // keep seed data — looks identical anyway
        setServerTime(formatServerTime());
      });
  }

  // Try live API; keep seed on failure
  React.useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      {/* Left sidebar */}
      <Sidebar teacher={teacher} />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 28px",
            borderBottom: `1px solid ${C.line}`,
            background: C.paper2,
            flexShrink: 0,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3
              style={{
                fontFamily: FONT.serif,
                fontWeight: 600,
                fontSize: 22,
                margin: 0,
                color: C.ink,
              }}
            >
              Grade 7 · Period 3
            </h3>
            <Icon name="chevron-down" size={16} color={C.mono} />
          </div>

          {/* Deadline control — center area of the header */}
          <DeadlineControl deadline={deadline} onDeadlineSet={setDeadline} />

          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              color: C.mono,
            }}
          >
            {serverTime}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Stat cards */}
          <StatCards stats={stats} />

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: 16,
            }}
          >
            {/* Left column: flagged + roster */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <FlaggedList flagged={flagged} />
              <RosterTable roster={roster} />
            </div>

            {/* Right column: call requests + activity + topic bars + ask mira */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <CallRequestsPanel
                callRequests={callRequests}
                onResolved={(id) =>
                  setCallRequests((prev) => prev.filter((r) => r.id !== id))
                }
              />
              <ActivityTimeline activity={activity} />
              <TopicMasteryBars topics={topics} onRetaught={fetchDashboard} />
              <AskMira />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
