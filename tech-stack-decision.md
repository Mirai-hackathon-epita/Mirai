# Tech Stack Decision

Locked stack for the adaptive learning platform (EPITA hackathon).

## Stack

| Layer | Choice | Notes |
| :--- | :--- | :--- |
| App framework | **Next.js (App Router)** | Single full-stack repo (frontend + API routes / server actions), one deploy. |
| Agent / LLM layer | **Vercel AI SDK (`ai`)** + OpenAI-compatible provider | `generateText` + `tools` + `maxSteps` for the multi-step agentic loop. No LangChain, no LightRAG. Provider base URL points at Cloud Temple. |
| LLMaaS / model hosting | **Cloud Temple LLMaaS** (sovereign AI) | Serves Mistral via an OpenAI-compatible API. Base URL `https://api.ai.cloud-temple.com/v1/`, Bearer API-key auth. Docs: https://docs.cloud-temple.com/llmaas |
| Model | **Mistral Small only** (~$0.1/M tokens), served via Cloud Temple | Used for everything: generation, planning/reflection, grading. No hybrid, no fallback to a stronger model. |
| OCR (handwritten math) | **Mistral vision/OCR via Cloud Temple** | Routed through Cloud Temple like every other call. ⚠️ Confirm a vision/OCR-capable model is exposed on the `/models` endpoint. |
| Retrieval | **No RAG framework** | Course parsed into sections, stored in Redis, retrieved by topic label into the prompt. Add a vector store (Upstash Vector, or RediSearch if available) only if needed. |
| State + persistence | **Redis** (Scalingo managed addon) via `ioredis` | Source of truth for everything that must survive: course text, per-student skill graph, history, sessions. |
| Fake-user "DB" | **Redis hashes seeded from a JSON file** | 1 teacher + students. No Postgres, no SQLite. |
| Auth | **None (user picker)** | Select user → `userId` in cookie / Redis session → render correct panel. |
| Deployment | **Scalingo**, GitHub push-to-deploy, Node buildpack | As prescribed by the handbook. |
| Codegen / infra | **MuleRun** | Generate Node.js code, configure Scalingo, deploy, verify. |

## Key constraints

- **Mistral-only is a product decision.** The agent runs an autonomous loop per student, continuously — cheap per-loop cost is core to the business model and the "real-world applicability & impact" criterion. This intentionally overrides the CLAUDE.md default of "use the latest Claude models".
- **All model calls go through Cloud Temple LLMaaS** — chat/completions, embeddings, and OCR/vision. Base URL `https://api.ai.cloud-temple.com/v1/`, Bearer API key in an env var. Never call Mistral's API directly. Docs: https://docs.cloud-temple.com/llmaas
- **Scalingo filesystem is ephemeral.** Parse uploaded course files to text on upload and write to Redis immediately. Never rely on local files or SQLite persisting.
- **Everything in English** (code, comments, UI copy, data) per the project language rule.

## Post-POC extensions (real deployment, not the demo)

These add robustness at scale but bring nothing to the live demo, so they are deliberately deferred.

- **Verifiable grading (CAS-backed).** For the POC, **Mistral Small grades answers directly** — acceptable because demo exercises are seeded and rehearsed against known solutions. At real scale, free-form small-model math grading is unreliable (it can confidently mark a correct answer wrong, or miss a real error). Production approach: the model only **reads/normalizes** the student's answer into a symbolic form, then a deterministic **CAS / symbolic-equivalence check** (e.g. `math.js`, or a SymPy microservice) compares it against an **answer key generated at exercise-creation time**. The model reads; code decides correctness. Optionally pair with a confidence gate so low-confidence grades/diagnoses ask the teacher to confirm before being trusted.
- **RAG retrieval at scale.** Already noted in the Retrieval row: the POC retrieves by topic label into the prompt; multi-hundred-page courses get a vector store (RediSearch / Upstash Vector) so the tutor grounds every claim and never hallucinates on facts. Same rationale — no demo value, real value in production.
