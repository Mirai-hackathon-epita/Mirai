# Mira — Integration Contract (for parallel build)

This is the shared contract for everyone building Mira in parallel. **The
foundation below already exists and is stable — do not modify it.** Build only
the files assigned to your area. Everything is **English only** (code,
comments, UI copy).

Mira is **the autonomous AI tutor**: one self-paced agent per student that
plans → generates → grades → diagnoses → escalates, on a grade-7 **fractions**
curriculum. The teacher only supervises.

The pixel reference for all four screens is **`mira/Mira.dc.html`** (open it /
read the relevant `<!-- ===== NN · ... ===== -->` block). Match it faithfully:
same layout, spacing, type, colour. It uses inline styles; do the same in React
(it's the fastest faithful path) and pull colours from the theme constants.

---

## Design tokens — `src/lib/ui/theme.ts` + `src/app/globals.css`

Import colours/fonts from `@/lib/ui/theme`:

```ts
import { C, FONT, statusColor, statusChip, masteryChip, RADIUS } from "@/lib/ui/theme";
```

- `C` — palette: `bg, paper, paper2, paper3, paper4, cream, ink, ink2, muted, mono, faint, terracotta, terracottaDark, terracottaBg, terracottaBg2, blue, blueBg, green, greenDark, greenBg, amber, amberBg, amberBg2, neutral, neutral2, line, line2`.
- `FONT` — `serif` (Newsreader, headings), `sans` (Geist, body), `mono` (Geist Mono, labels/data), `hand` (Caveat, handwriting).
- `statusColor(MasteryStatus)`, `statusChip(StudentStatus)`, `masteryChip(MasteryStatus)` → `{fg,bg,label}`.

Fonts are already loaded globally (layout `<head>`). CSS vars mirror `C`
(e.g. `var(--terracotta)`). Helper classes in globals.css: `.serif .mono .hand
.eyebrow .scroll .fade-up .pulse`.

## UI primitives — `@/components/ui`

```ts
import { Logo, MiraMark, Eyebrow, Card, Avatar, Chip, ProgressBar, Button, Icon } from "@/components/ui";
```

- `<Logo size?/>` — "Mira." wordmark. `<MiraMark size?/>` — terracotta "M" speaker avatar.
- `<Eyebrow color? style?>` — uppercase mono caption.
- `<Card raised? style?>` — paper surface (paper2 bg, hairline border, radius 14).
- `<Avatar initials size? bg? fg?/>`, `<Chip fg? bg? mono?>`, `<ProgressBar value(0..1) color? track? height?/>`.
- `<Button variant="primary|secondary|ghost" size="sm|md|lg" block?>`.
- `<Icon name size?/>` — names: `check, arrow-left, arrow-right, chevron-down, grid, users, activity, book, settings, lock, play, phone, pencil, eraser, undo, camera, upload, send, sparkle, graph, edit, bell`. Add new glyphs to `Icon.tsx` if needed.

Format helpers — `@/lib/ui/format`: `renderBold(text)` (renders `**bold**`),
`formatServerTime(date)`, `clock(ts)`.

## Domain types — `@/lib/domain/types`

The wire contract. Key types: `Student, Teacher, Concept, ConceptGraph,
ConceptMastery, MasteryStatus, StudentStatus, CognitiveProfile, Exercise,
VisualizationSpec, GradeResult, StepFeedback, Diagnosis, Misconception,
FeedEvent, FeedKind, Submission, ClassStats, TopicMastery, ActivityItem`, and
response types `DashboardResponse, StudentGraphResponse, NextExerciseResponse,
SubmitResponse, ChatResponse, OcrResponse, AskResponse`.

Concept graph: `@/lib/domain/conceptGraph` (`FRACTIONS_GRAPH`, `CONCEPTS_BY_ID`,
`conceptLabel`, `prerequisitesOf`). Mastery math: `@/lib/domain/mastery`
(`masteryStatus`, `studentStatus`, `updateMastery`, `MASTERY_THRESHOLD`, `pct`).

## Client data access (frontend) — `@/lib/ui/api`

```ts
import { api } from "@/lib/ui/api";
await api.dashboard();              // DashboardResponse
await api.studentGraph(id);         // StudentGraphResponse
await api.nextExercise(id);         // NextExerciseResponse
await api.feed(id);                 // { feed: FeedEvent[] }
await api.submit(id, { exerciseId, answer, viaOcr });  // SubmitResponse
await api.ocr({ sample: "maya-fractions" });           // OcrResponse  (or { imageUrl })
await api.chat(id, { message });    // ChatResponse
await api.ask({ question });        // AskResponse
```

Interactive pages must start with `"use client"`. Fetch in a `useEffect`, show
a light skeleton while loading. If a fetch throws (routes not up yet), fall back
gracefully — never blank-screen.

## Server data + AI (backend only)

- `@/lib/data/repo` — the only module that touches the store. `ensureSeeded`,
  `getStudents/getStudent/saveStudent`, `getMastery/saveMastery`,
  `getConceptGraph`, `getFeed/pushFeed`, `getExercises/getExerciseById/addExercise`,
  `getMisconceptions/saveMisconceptions`, `pushSubmission/getSubmissions`,
  `getTeacher/getActivity/getClassStats/getTopicMastery/getInsight`.
- `@/lib/store/kv` — KV backend (Redis or in-memory). Use repo, not kv, directly.
- `@/lib/llm/client` — `LLM_ENABLED`, `chat(messages,opts)`, `chatJSON<T>(messages,opts)`,
  `vision(imageUrl,prompt,opts)`, `parseJSON`, `genId(prefix)`. **Every LLM call
  must have a deterministic fallback** (catch `LLMUnavailableError`) so the demo
  works offline. Seed data exists for exactly this.

---

## API contract (routes under `src/app/api/**`) — built by the backend area

All routes `export const dynamic = "force-dynamic"`. JSON in/out. Shapes are the
`*Response` types in `types.ts`.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/teacher/dashboard` | — | `DashboardResponse` |
| POST | `/api/teacher/ask` | `{question}` | `AskResponse` |
| GET | `/api/students/:id/graph` | — | `StudentGraphResponse` |
| GET | `/api/students/:id/exercise/next` | — | `NextExerciseResponse` |
| GET | `/api/students/:id/feed` | — | `{feed: FeedEvent[]}` |
| POST | `/api/students/:id/submit` | `{exerciseId, answer, viaOcr?}` | `SubmitResponse` |
| POST | `/api/students/:id/chat` | `{message}` | `ChatResponse` |
| POST | `/api/ocr` | `{imageUrl?} | {sample?}` | `OcrResponse` |

`SubmitResponse` is the heart of the demo: it runs the agent loop (grade →
update mastery → diagnose misconception → maybe escalate → pre-generate next),
returns the `GradeResult`, optional `Diagnosis`, new `FeedEvent[]`, updated
`ConceptMastery[]`, the next `Exercise`, and `escalated`.

---

## File ownership (no overlaps)

- **Foundation (done):** `src/lib/**`, `src/components/ui/**`, `src/app/layout.tsx`, `src/app/globals.css`, configs.
- **Area A — Landing:** `src/app/page.tsx`, `src/components/landing/**`.
- **Area B — Teacher:** `src/app/teacher/page.tsx`, `src/app/teacher/student/[id]/page.tsx`, `src/components/teacher/**`, `src/components/graph/**`.
- **Area C — Student:** `src/app/student/page.tsx`, `src/components/student/**`.
- **Area D — Backend:** `src/app/api/**`, `src/lib/agent/**`.

Routes for demo navigation: `/` (landing) → `/teacher` (dashboard) →
`/teacher/student/maya` (skill graph) ; `/student` (Maya's workspace). Add
plain links between them where the design shows nav.
