# Teacher-Side Implementation Plan — Mira

> Build plan for the four missing teacher features. Companion to the feature spec in
> [TEACHER_PLAN.md](TEACHER_PLAN.md). English-only deliverables (CLAUDE.md rule).
>
> **Decisions locked (from review):**
> - Scope: all four gaps — course upload+enrich+publish, mark-concept-re-taught, set-mastery-deadline, receive call-teacher.
> - Enrichment: **live agentic** (parse upload → LLM extracts concept DAG + viz) with a **cached fallback** (existing `LLM_ENABLED`/seed pattern).
> - Cross-effects: **real** — teacher actions mutate student-agent state visible on the student side.
> - Topic domain stays **Fractions** (what the code is built around); `FRACTIONS_GRAPH` becomes the seed for the default published course.

---

## Current state (verified)

**Already working (read-only over seed/KV):** dashboard stat cards, roster, flagged/escalation list, topic-mastery bars, activity feed, "Ask Mira" NL Q&A (`/api/teacher/ask`), on-demand AI visualizations (`/api/teacher/course/visualize`).

**Missing:** real course upload, AI enrichment → concept-graph extraction, review & publish, set mastery deadline, receive "Call teacher" requests, mark-concept-re-taught.

**Architectural linchpin:** `src/lib/domain/conceptGraph.ts` exports `FRACTIONS_GRAPH` as a constant, imported directly by the course page, the repo (`getConceptGraph()` is sync), and the student graph route. To support an *uploaded* course producing a *new* graph, the active graph must become **async + KV-backed**, falling back to `FRACTIONS_GRAPH`.

**Contracts to respect:** `src/lib/domain/types.ts` is the single source of truth; `src/lib/data/repo.ts` is the *only* module that touches KV keys; `src/lib/llm/client.ts` exposes `chat`, `chatJSON`, `genId`, `LLM_ENABLED`, `LLMUnavailableError`; UI fetches go through `src/lib/ui/api.ts`.

---

## Work breakdown

Sequenced so feature agents share a stable contract. **Phase 0 must land and be reviewed before Phase 1 fans out.**

### Phase 0 — Foundation (1 agent, blocking)

Owns the shared contract. No feature logic.

1. **New domain types** in `types.ts`:
   - `Course` — `{ id, topic, sourceName, status: "draft"|"enriching"|"enriched"|"published", createdAt, publishedAt? }`.
   - `MasteryDeadline` — `{ topic, date (ISO), setAt }`.
   - `CallRequest` — `{ id, studentId, conceptId, ts, status: "open"|"resolved", lastDiagnosis? }`.
   - Extend `DashboardResponse` with `callRequests: CallRequest[]`, `deadline: MasteryDeadline | null`, `activeCourse: Course`.
2. **Dynamic active course/graph** in `repo.ts` (+ new keys `mira:course:active`, `mira:graph:active`, `mira:deadline`, `mira:callRequests`):
   - `getActiveCourse()`, `saveCourse(course)`.
   - `getActiveConceptGraph(): Promise<ConceptGraph>` (KV-backed, falls back to `FRACTIONS_GRAPH`). Replace sync `getConceptGraph()` usages with the async accessor.
   - `getDeadline()/saveDeadline()`, `getCallRequests()/pushCallRequest()/resolveCallRequest()`.
   - Seed a default `published` course backed by `FRACTIONS_GRAPH` so existing screens keep working.
3. **Dashboard route plumbing** (`/api/teacher/dashboard`): include `callRequests`, `deadline`, `activeCourse` in the response (reading the new accessors). Feature agents only fill data via repo.
4. Keep `conceptGraph.ts` helpers (`conceptLabel`, `prerequisitesOf`) working against the active graph (make them tolerant of dynamic concepts).

**Done when:** `npm run build` + `jest` green; dashboard still renders identically from seed; new accessors unit-tested.

### Phase 1 — Feature agents (3 agents, parallel after Phase 0)

**Agent A — Course upload + enrichment + review/publish**
- `POST /api/teacher/course/upload`: accept pasted text or file (PDF→text or plain text for the demo; keep it simple/robust). Run **agentic enrichment**: `chatJSON` extracts a concept DAG (`concepts[]` with `id,label,prerequisites,blurb,layout`) + 1–2 `VisualizationSpec`s. Emit visible "agent steps" (plan→extract→layout→visualize) for the demo. **Cached fallback** to `FRACTIONS_GRAPH` when `!LLM_ENABLED` or on failure. Store as `draft`→`enriching`→`enriched` course.
- `POST /api/teacher/course/publish`: set course `published`, seed mastery rows for every student over the new concepts, push a class activity item ("Course published — N concepts unlocked").
- Rework `src/app/teacher/course/page.tsx`: upload dropzone + enrichment progress (show the agent steps) + review of the extracted graph & generated viz + **Publish** button. Read the graph from the API/dynamic accessor, **not** the `FRACTIONS_GRAPH` import.
- Add `api.uploadCourse`, `api.publishCourse` to `ui/api.ts`.

**Agent B — Mark concept as re-taught**
- `POST /api/teacher/concept/retaught` `{ conceptId }`: for every student, mark that concept for re-probe (drop status to `needs-work`/`developing`, flag for re-probe), enqueue a fresh probe exercise, push a per-student `FeedEvent` (`kind: "replan"`) and one class `ActivityItem`. Return updated topic-mastery + activity.
- Student-side cross-effect: `/api/students/[id]/exercise/next` surfaces the re-probe first.
- UI: "Mark re-taught" affordance on `TopicMasteryBars` rows (and/or from the flagged list). Optimistic update + refetch.
- Add `api.markRetaught` to `ui/api.ts`.

**Agent C — Mastery deadline + Call-teacher**
- Deadline: `POST /api/teacher/deadline` `{ topic, date }` → store; dashboard renders it (header/stat area); student planning reads it to set a `pace` indicator + a "Mira re-paced N students" activity item. Add a deadline control to the dashboard.
- Call-teacher: `POST /api/students/[id]/call` creates a `CallRequest` (with last diagnosis); student page gets a **"Call teacher"** button. Dashboard renders a **Call requests** panel from `DashboardResponse.callRequests` (student + current topic + last diagnosis), with a resolve action (`/api/teacher/call/[id]/resolve`).
- Add `api.setDeadline`, `api.callTeacher`, `api.resolveCall` to `ui/api.ts`.

### Phase 2 — Integration & verification (1 agent / orchestrator)

- Wire the three features into the dashboard page layout coherently; ensure the student page reflects cross-effects (published unlock, re-probe, call confirmation).
- `jest` for new domain/repo logic; `npm run build` + `next lint` green; manual smoke of the full teacher→student loop.
- Confirm graceful degradation with `MIRA_OFFLINE=1` / no API key (cached fallbacks everywhere).
- Short demo script: upload → enrich → publish → student works → flagged → mark re-taught → call-teacher → ask Mira.

---

## Parallelization & conflict notes

- **Shared files** edited by multiple agents: `types.ts`, `repo.ts`, `ui/api.ts`, dashboard route/page. Phase 0 stabilizes types + repo + dashboard response so Phase 1 agents only *add* their own routes/components and *append* their `api.*` helpers and repo accessors. Keep edits additive and localized to minimize merge conflicts.
- Each Phase 1 agent runs in its own git worktree (isolation) and is reviewed before merge.

## Guardrails (all agents)

- English only. Match existing code style (inline-style components, `C`/`FONT` theme tokens, `server-only` on server modules).
- Never crash the demo: every LLM path needs a deterministic fallback (mirror `visualize` route).
- Keep the Scalingo deploy green; KV via the existing `kv()` abstraction (Redis or in-memory).
