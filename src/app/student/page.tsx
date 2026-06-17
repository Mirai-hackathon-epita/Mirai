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

type CallState = "idle" | "calling" | "called" | "error";

export default function StudentPage() {
  const [exercise, setExercise] = React.useState<Exercise>(SEED_EXERCISE);
  const [problemNumber, setProblemNumber] = React.useState(PROGRESS_INDEX + 1);
  const [progressIndex, setProgressIndex] = React.useState(PROGRESS_INDEX);
  const [feed, setFeed] = React.useState<FeedEvent[]>(SEED_FEED);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [workKey, setWorkKey] = React.useState(0); // force re-mount WorkPanel on next problem
  const [callState, setCallState] = React.useState<CallState>("idle");

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

  async function handleCallTeacher() {
    if (callState === "calling" || callState === "called") return;
    setCallState("calling");
    try {
      await api.callTeacher(STUDENT_ID);
      setCallState("called");
      // Reset confirmation after 4 s so the student can call again if needed
      setTimeout(() => setCallState("idle"), 4000);
    } catch {
      setCallState("error");
      setTimeout(() => setCallState("idle"), 3000);
    }
  }

  function handleNextProblem(preGeneratedExercise?: Exercise) {
    setProgressIndex((p) => Math.min(p + 1, PROGRESS_TOTAL - 1));
    setProblemNumber((n) => n + 1);
    setWorkKey((k) => k + 1);
    if (preGeneratedExercise) {
      // Use the pre-generated exercise returned by the submit API
      setExercise(preGeneratedExercise);
    } else {
      // Fall back: cycle through seed pool and try API
      const nextIdx = EXERCISES.findIndex((e) => e.id === exercise.id);
      const seedNext = EXERCISES[(nextIdx + 1) % EXERCISES.length];
      setExercise(seedNext);
      api
        .nextExercise(STUDENT_ID)
        .then((res) => {
          setExercise(res.exercise);
          setProblemNumber(res.progress.index + 1);
          setProgressIndex(res.progress.index);
        })
        .catch(() => {});
    }
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
      {/* Call-teacher confirmation banner */}
      {callState === "called" && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#3A424F",
            color: "#FBF7F0",
            fontSize: 14,
            fontFamily: "Geist, sans-serif",
            fontWeight: 500,
            padding: "10px 20px",
            borderRadius: 10,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          Ms. Rivera has been notified — she&apos;ll come over shortly.
        </div>
      )}
      {callState === "error" && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#C2533A",
            color: "#FBF7F0",
            fontSize: 14,
            fontFamily: "Geist, sans-serif",
            fontWeight: 500,
            padding: "10px 20px",
            borderRadius: 10,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          Could not send — please try again.
        </div>
      )}

      <WorkspaceNav
        topic={MAYA.currentTopicLabel}
        progressIndex={progressIndex}
        progressTotal={PROGRESS_TOTAL}
        studentName="Maya"
        studentInitials={MAYA.initials}
        studentId={STUDENT_ID}
        onCallTeacher={handleCallTeacher}
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
          onFeedUpdate={(events) => { if (events.length) setFeed(events); }}
          onNextExercise={(ex) => handleNextProblem(ex)}
        />
      </div>

      {/* Agent reasoning feed strip */}
      <AgentFeed events={feed} />

      {/* Chat drawer */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        studentId={STUDENT_ID}
        exerciseContext={exercise.expression}
      />
    </div>
  );
}
