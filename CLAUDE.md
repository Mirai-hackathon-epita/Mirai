# CLAUDE.md — Adaptive Learning Platform (EPITA Hackathon)

> **⚠️ LANGUAGE RULE — NON-NEGOTIABLE**
> The **entire project is built in English**. All code, comments, identifiers, commit messages, documentation, UI copy, API responses, seed data, and demo content **must be written in English**. Do not produce French in any deliverable. (Conversation with the user may be in French; the artifacts may not.)

---

## 1. Project Overview

We are building an **adaptive learning platform with incremental difficulty**, powered by an **autonomous AI tutoring agent**.

A teacher uploads their course. From that material, the agent **autonomously**:
- generates personalized exercises for each student,
- adapts difficulty incrementally using **persistent memory** of each learner's history,
- maintains a **skill graph** per student (strengths and weaknesses),
- pushes **regular feedback** so that, during tutorials (TD), the teacher can see blocking points and pull aside the students who need it.

The experience adapts to each student's **cognitive profile** (visual, auditory, written, or a combination).

### Key features
- **Personalized exercise generation** from the teacher's uploaded course.
- **Incremental difficulty** driven by persistent per-student memory.
- **Per-student skill graph** visualizing mastery and gaps.
- **OCR module** for handwritten exercises (e.g. math): the student writes naturally, the agent grades automatically.
- **Interactive course experiences** (animations, visualizations) generated from the course material.
- **Teacher dashboard** with regular AI feedback to identify blocking points during TD.

See [Idee-Projet.md](Idee-Projet.md) for the full feature description.

---

## 2. Hackathon Theme & How We Win

**Theme: Agentic AI and Autonomy.** This is the single most important framing. Every design decision should make the AI more **autonomous and agentic** — planning, deciding, and executing multi-step tasks with minimal human intervention.

Concretely, lean into the agentic angle by treating the tutor as an **autonomous loop**, not a one-shot prompt:
- The agent **decides** what exercise each student needs next (planning over the skill graph).
- The agent **acts** (generates the exercise, grades the OCR submission, updates memory).
- The agent **reflects** (re-reads results, adjusts difficulty, flags blocking points to the teacher).
- The agent runs this loop **per student, continuously**, surfacing only what the teacher needs to act on.

When in doubt, ask: *"Does this make the agent more autonomous, or does it just bolt an LLM onto a CRUD app?"* Always choose the former.

### Judging criteria (1–5 each) — optimize for all five

| Criterion | What judges look for | How we score 5 |
| :--- | :--- | :--- |
| **Autonomous agent functionality** | Core ability of the agent to operate autonomously — decide, plan, execute toward goals without constant human input. | The tutor agent achieves complex multi-step goals (generate → grade → update memory → re-plan) autonomously, per student. |
| **Innovation & technical complexity** | Novelty and sophistication of the AI techniques, frameworks, models, orchestration. | Novel combination: agentic loop + persistent memory + skill graph + OCR grading + generated interactive content. |
| **Real-world applicability & impact** | Potential to solve a real problem and create concrete value. | Addresses a real teaching pain: personalization at scale, targeted TD interventions. |
| **Alignment with theme (Agentic AI & autonomy)** | Depth of agentic design, sophistication of the autonomous workflow, emergent behavior. | The whole product *is* an autonomous agent; teacher only supervises. |
| **Code quality & demo functionality** | Stability, robustness, clarity, and an effective final demo. | Clean, deployed, tested app; flawless, convincing live demo of every feature. |

Full grid: [judging_criterias.md](judging_criterias.md).

### Submission strategy
Deadlines are **operationally soft** — judges may grade whatever is available when they look. **Ship a working, deployed version early**, then keep improving. A live, testable deployment beats a more ambitious local-only build.

---

## 3. Tech Stack & Workflow (from the Handbook)

The hackathon provides a sponsor toolchain. Use it.

- **MuleRun** — AI development agent that generates production-ready **Node.js** code, runs infrastructure commands, handles deployment, debugging, and verification from natural-language prompts.
- **Scalingo** — API-first deployment platform: hosting, managed addons, logs, buildpacks.
- **Redis** — provisioned as a **Scalingo managed addon** (use for persistent memory / session / fast state).
- **GitHub** — push to trigger deployment via the Scalingo integration (CI/CD).

### Core workflow
1. Generate a production-ready **Node.js** app with MuleRun.
2. Configure Scalingo programmatically (app + Redis addon).
3. Push to GitHub → trigger deploy via the Scalingo integration.
4. Verify in production: logs, HTTP requests, Redis connection checks.
5. Iterate: add endpoints, resize containers, improve CI/CD, refine the UI.

Full reference: [Handbook.md](Handbook.md).

### What the best projects must show (handbook)
- a **functional product**;
- a **clear use case**;
- **deliberate technical choices**;
- **evidence the deployed app was actually tested**.

---

## 4. Working Agreement for Claude

When working on this project, you (Claude) must:

1. **Write everything in English** — no exceptions (see the language rule above).
2. **Default to the agentic framing** — favor autonomous, multi-step agent behavior over manual flows or single LLM calls. This is how we win the theme.
3. **Keep it deployed and testable** — prefer changes that keep the Scalingo deployment green. Verify with logs / HTTP checks before claiming something works.
4. **Use the sponsor stack** — Node.js, Scalingo, Redis, GitHub, MuleRun. Don't introduce alternatives without a reason tied to the criteria.
5. **Optimize for the judging grid** — when choosing between options, pick the one that raises a criterion score (autonomy, innovation, impact, theme alignment, demo quality).
6. **Use the latest, most capable Claude models** for any AI/LLM feature in the product (e.g. Opus 4.8). Default to agentic patterns (tool use, memory, multi-step loops) over single prompts.
7. **Prioritize the demo** — a feature that demos cleanly and autonomously beats a half-finished ambitious one. Ship a working slice early, then deepen.

---

## 5. Quick Reference

| Item | Value |
| :--- | :--- |
| Theme | Agentic AI and Autonomy |
| Project language | **English only** |
| Runtime | Node.js |
| Deployment | Scalingo (push-to-deploy via GitHub) |
| Persistent state | Redis (Scalingo managed addon) |
| Codegen / infra agent | MuleRun |
| Idea doc | [Idee-Projet.md](Idee-Projet.md) |
| Judging grid | [judging_criterias.md](judging_criterias.md) |
| Handbook | [Handbook.md](Handbook.md) |
