import { genId } from "@/lib/llm/client";
import type { FeedEvent, FeedKind } from "@/lib/domain/types";

export function makeEvent(
  studentId: string,
  kind: FeedKind,
  text: string,
): FeedEvent {
  return { id: genId("ev"), studentId, ts: Date.now(), kind, text };
}
