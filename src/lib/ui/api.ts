// Client-side typed fetch helpers. Frontend screens call these; they hit the
// API routes built by the backend. Keep the paths in sync with INTEGRATION.md.

import type {
  AskResponse,
  ChatResponse,
  DashboardResponse,
  FeedEvent,
  NextExerciseResponse,
  OcrResponse,
  StudentGraphResponse,
  SubmitResponse,
  VisualizationSpec,
} from "@/lib/domain/types";

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
};
