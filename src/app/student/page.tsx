"use client";

import * as React from "react";
import { EXERCISES, FEED, STUDENTS } from "@/lib/seed/data";
import { api } from "@/lib/ui/api";
import { WorkspaceNav } from "@/components/student/WorkspaceNav";
import { ProblemPanel } from "@/components/student/ProblemPanel";
import { WorkPanel } from "@/components/student/WorkPanel";
import { ChatDrawer } from "@/components/student/ChatDrawer";
import { AgentFeed } from "@/components/student/AgentFeed";
import type { Exercise, FeedEvent } from "@/lib/domain/types";

const STUDENT_ID = "maya";
const MAYA = STUDENTS.find((s) => s.id === STUDENT_ID)!;
const SEED_EXERCISE = EXERCISES[0]; // ¾ + ⅙, difficulty 4
const SEED_FEED = FEED[STUDENT_ID] ?? [];

// Progress: problem 3 of 8 (0-indexed: index 2)
const PROGRESS_INDEX = 2;
const PROGRESS_TOTAL = 8;

export default function StudentPage() {
  const [exercise, setExercise] = React.useState<Exercise>(SEED_EXERCISE);
  const [problemNumber, setProblemNumber] = React.useState(PROGRESS_INDEX + 1);
  const [progressIndex, setProgressIndex] = React.useState(PROGRESS_INDEX);
  const [feed, setFeed] = React.useState<FeedEvent[]>(SEED_FEED);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [workKey, setWorkKey] = React.useState(0); // force re-mount WorkPanel on next problem

  // Try to load from API, fall back to seed silently
  React.useEffect(() => {
    let cancelled = false;
    api
      .nextExercise(STUDENT_ID)
      .then((res) => {
        if (!cancelled) {
          setExercise(res.exercise);
          setProblemNumber(res.progress.index + 1);
          setProgressIndex(res.progress.index);
        }
      })
      .catch(() => {
        /* keep seed */
      });
    api
      .feed(STUDENT_ID)
      .then((res) => {
        if (!cancelled && res.feed.length > 0) setFeed(res.feed);
      })
      .catch(() => {
        /* keep seed */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNextProblem() {
    // Advance to next exercise from seed pool or re-fetch
    const nextIdx = EXERCISES.findIndex((e) => e.id === exercise.id);
    const nextExercise = EXERCISES[(nextIdx + 1) % EXERCISES.length];
    setExercise(nextExercise);
    setProgressIndex((p) => Math.min(p + 1, PROGRESS_TOTAL - 1));
    setProblemNumber((n) => n + 1);
    setWorkKey((k) => k + 1);
    // Also try API
    api
      .nextExercise(STUDENT_ID)
      .then((res) => {
        setExercise(res.exercise);
        setProblemNumber(res.progress.index + 1);
        setProgressIndex(res.progress.index);
      })
      .catch(() => {});
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F7F2EA",
        overflow: "hidden",
      }}
    >
      <WorkspaceNav
        topic={MAYA.currentTopicLabel}
        progressIndex={progressIndex}
        progressTotal={PROGRESS_TOTAL}
        studentName="Maya"
        studentInitials={MAYA.initials}
        onCallTeacher={() => alert("Calling Ms. Rivera…")}
      />

      {/* Two-column body */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
        }}
      >
        <ProblemPanel exercise={exercise} problemNumber={problemNumber} />
        <WorkPanel
          key={workKey}
          exercise={exercise}
          onNextProblem={handleNextProblem}
          onAskHint={() => setChatOpen(true)}
        />
      </div>

      {/* Agent reasoning feed strip */}
      <AgentFeed events={feed} />

      {/* Chat drawer */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        studentId={STUDENT_ID}
      />
    </div>
  );
}
