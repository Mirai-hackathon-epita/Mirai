// Client-side typed fetch helpers. Frontend screens call these; they hit the
// API routes built by the backend. Keep the paths in sync with INTEGRATION.md.

import type {
  ActivityItem,
  AskResponse,
  CallRequest,
  ChatResponse,
  DashboardResponse,
  FeedEvent,
  MasteryDeadline,
  NextExerciseResponse,
  OcrResponse,
  PublishCourseResponse,
  StudentGraphResponse,
  SubmitResponse,
  TopicMastery,
  UploadCourseResponse,
  VisualizationSpec,
} from "@/lib/domain/types";

/** Response shape for POST /api/teacher/concept/retaught */
export interface RetaughtResponse {
  topicMastery: TopicMastery[];
  activityItem: ActivityItem;
  studentsAffected: number;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  dashboard: () => get<DashboardResponse>("/api/teacher/dashboard"),
  studentGraph: (id: string) =>
    get<StudentGraphResponse>(`/api/students/${id}/graph`),
  nextExercise: (id: string) =>
    get<NextExerciseResponse>(`/api/students/${id}/exercise/next`),
  feed: (id: string) =>
    get<{ feed: FeedEvent[] }>(`/api/students/${id}/feed`),
  submit: (
    id: string,
    body: { exerciseId: string; answer: string; viaOcr?: boolean },
  ) => post<SubmitResponse>(`/api/students/${id}/submit`, body),
  ocr: (body: { imageUrl?: string; sample?: string }) =>
    post<OcrResponse>("/api/ocr", body),
  chat: (id: string, body: { message: string }) =>
    post<ChatResponse>(`/api/students/${id}/chat`, body),
  ask: (body: { question: string }) =>
    post<AskResponse>("/api/teacher/ask", body),
  visualize: (body: { conceptId: string; currentKind?: string }) =>
    post<{ visualization: VisualizationSpec }>(
      "/api/teacher/course/visualize",
      body,
    ),

  // ── Phase 1: course upload + enrichment + publish ───────────────
  uploadCourse: (body: { text?: string; sourceName?: string }) =>
    post<UploadCourseResponse>("/api/teacher/course/upload", body),
  publishCourse: () =>
    post<PublishCourseResponse>("/api/teacher/course/publish", {}),

  // ── Phase 1: mark concept as re-taught ──────────────────────────
  markRetaught: (body: { conceptId: string }) =>
    post<RetaughtResponse>("/api/teacher/concept/retaught", body),

  // ── Phase 1: deadline + call-teacher ────────────────────────────
  setDeadline: (body: { topic: string; date: string }) =>
    post<{ deadline: MasteryDeadline }>("/api/teacher/deadline", body),
  callTeacher: (studentId: string, body?: Record<string, unknown>) =>
    post<{ callRequest: CallRequest }>(
      `/api/students/${studentId}/call`,
      body ?? {},
    ),
  resolveCall: (id: string) =>
    post<{ resolved: boolean }>(`/api/teacher/call/${id}/resolve`, {}),
};
