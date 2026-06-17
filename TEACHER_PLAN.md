# Teacher-Side Feature Plan — Mirai

> Scoped from the design mockups + feature classification session.
> "Drill into a student's skill graph" is **out of scope** for the teacher side — the teacher sees class-level data only.

---

## User Journey

1. Upload course → Mirai enriches it (concept graph + visualizations)
2. Review & publish enriched course to class
3. Optionally set a mastery deadline
4. Monitor dashboard (async, between tutorials)
5. Act on escalations during TD (pull students aside)
6. Receive "Call teacher" requests from students in real time
7. Mark concepts as re-taught → agents re-probe all students
8. Ask Mirai natural-language questions about class progress

---

## Features

### 1. Course Upload
Teacher drops a PDF or slide deck for a topic (e.g. derivatives).
- Single-topic for the demo, no broad subject coverage.

### 2. AI Course Enrichment
Mirai ingests the uploaded material and:
- Extracts a **concept prerequisite graph** (DAG) — the structure that drives all student planning.
- Generates **interactive visualizations** for key concepts.
- Produces an enriched, interactive course experience.

> Build treatment (Tier 3): enrichment is pre-generated/cached at upload, not live.

### 3. Review & Publish
Teacher previews the enriched course and publishes it to the class.
- Unlocks student workspace for that topic.
- Simple approve/publish flow — no heavy CMS.

### 4. Set Mastery Deadline *(optional)*
Teacher sets a target: "class masters derivatives by June 23."
- Each student's agent plans backward from the deadline independently.
- Adjusts exercise intensity per learner to stay on track.
- Teacher does not configure per-student pacing — that is the agent's job.

---

### 5. Teacher Dashboard

The main teacher-facing view. Read-only synthesis over the agents' persistent memory.

#### Stat cards (top)
- **Average mastery** — class-wide % with a delta (e.g. 71%, +4 since last session).
- **Needs attention** — count of students the agent has flagged.

#### Class roster table
Columns: Student name | Current topic | Mastery bar + % | Status badge (On track / Needs attention / Blocked).

#### Escalation panel — "Mirai flagged these students"
Each escalation includes:
- Severity tag (e.g. Blocked, Falling behind).
- Mirai's **diagnosis** of the specific misconception.
- A **suggested intervention** ("5-min review of common factors").

Used by the teacher to decide who to pull aside in TD.

#### Class mastery by topic
Horizontal bar chart — one bar per concept in the DAG, showing class-average mastery.
Surfaces where the majority is stuck ("60% blocked on chain rule → re-teach first in TD").

#### Mirai's activity feed
Timestamped, plain-language log of what each student's agent did autonomously:
- "Léa failed 2 fraction problems → diagnosed numerator/denominator confusion → lowered difficulty, generated scaffolded exercise, flagged teacher."

Makes autonomous agent behavior **visible and scoreable** for judges.

---

### 6. Receive "Call Teacher" Requests
Student can tap "Call teacher" from their workspace when they are stuck.
- Surfaces as a notification / entry in the teacher dashboard.
- Teacher sees the student's current topic and last agent diagnosis alongside the request.

---

### 7. Act on Escalations in TD
Teacher uses the escalation list + suggested interventions to pull specific students aside.
- No in-app action required — the list is the artifact.
- After the conversation, teacher can mark the concept as re-taught (see §8).

---

### 8. Mark Concept as Re-taught
After a TD intervention, teacher marks a concept as re-taught.
- Signals **all student agents** to re-probe that concept with a fresh exercise.
- Closes the loop between teacher intervention and agent adaptation.

---

### 9. Ask Mirai About Progress *(natural language Q&A)*
Teacher types a question; Mirai synthesizes an answer from all students' persistent memory and skill graphs.

Example queries:
- "Who should I pull aside today?"
- "Where is the class blocked?"
- "How is Léa doing this week?"

---

## Build Priority (mapped to PLAN.md tiers)

| Feature | Tier |
|---|---|
| Course upload + publish | Tier 1 |
| Teacher dashboard: stat cards + roster + escalation + topic mastery + activity feed | Tier 1 |
| Receive "Call teacher" requests | Tier 1 |
| Act on escalations / pull-aside workflow | Tier 1 (read-only, dashboard artifact) |
| Mark concept as re-taught | Tier 2 |
| Set mastery deadline | Tier 2 |
| Ask Mirai natural-language Q&A | Tier 2 |
| AI course enrichment (interactive viz) | Tier 3 — pre-generated/cached |

---

## Out of Scope

- Drill into an individual student's skill graph — removed.
- Real auth / multi-class management.
- Broad subject coverage (demo is derivatives only).
