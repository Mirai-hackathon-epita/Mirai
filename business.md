# Adaptive AI Tutor — Business Analysis (Pitch-Ready)

> **How this was built:** the numbers below were drafted, then stress-tested by four specialized business critics (market/TAM analyst, unit-economics CFO, B2B2C GTM strategist, skeptical seed/Series-A VC) and re-verified by three independent checkers (arithmetic consistency, market realism, pitch persuasiveness). It went through a corrective round when the CFO check caught an unreachable margin claim. Market sizes, student counts, model pricing and competitor prices are sourced (see [Sources](#sources)); financial projections are model estimates whose load-bearing assumptions are flagged inline and listed at the end.

> Currency: EUR primary, $1 ≈ 0.92 EUR. Competitor prices kept in $.

---

## 1. Executive Summary / One-Liner

**Personalization at scale was always too expensive — one human tutor per student does not scale. We make it cost a fraction of a cent.**

An **autonomous AI tutoring agent** that, from a teacher's uploaded course, continuously generates personalized exercises, OCR-grades handwritten work, maintains a per-student skill graph, and flags blocked students to the teacher — running a per-student loop on **sovereign French AI** (Mistral Small via Cloud Temple LLMaaS; SecNumCloud / HDS / RGPD). At **15 EUR/student/year** (blended ~17 EUR with the Premium tier), all-in COGS is **~4.20 EUR/student/year → ~72% gross margin**. Serviceable France market **~127.5M EUR/yr**; realistic 3-year obtainable revenue **~5M EUR ARR** inside an AI-in-education market growing **25–43%/yr** (our served grading sub-segment the fastest at ~46.7%).

---

## 2. Problem & Why Now

- **1:1 tutoring works but does not scale** — human tutors cost ~30–50 EUR/hour; personalization for a 35-student class is economically impossible. Teachers cannot diagnose every gap before a tutorial (TD).
- **Generic edtech is not adaptive** — most tools are content libraries or teacher-productivity add-ons, not an autonomous per-student loop with persistent memory.
- **Why now (3 converging shifts):**
  1. **LLM inference collapsed in price** — Mistral Small 3 raw API is $0.10/M input, $0.30/M output (verified June 2026), making a continuous per-student agent loop cost a fraction of a cent.
  2. **Sovereign EU AI is now procurable** — Cloud Temple LLMaaS (SecNumCloud-qualified, HDS-certified, France-hosted, RGPD) makes a per-student tutoring agent on student data **legally deployable** in French/EU education, which US-hosted tools cannot match.
  3. **AI-in-education is inflecting** — the broad segment is compounding at **~25–43% CAGR**, and our served sub-segment (adaptive assessment/grading) is the fastest within it at **~46.7% CAGR**.

---

## 3. Product in One Paragraph

A teacher uploads their course once. From it, an **autonomous agent** runs a continuous per-student loop — **plan** (decide the next exercise from the skill graph), **act** (generate the exercise, OCR-grade the handwritten submission, update persistent memory), **reflect** (re-read results, adjust difficulty, flag blocking points) — adapting to each learner's cognitive profile (visual/auditory/written) and generating interactive course content. The teacher only **supervises**: a dashboard surfaces, per TD, exactly which students are blocked and why. The whole product *is* the autonomous agent; the human is in the loop for oversight, not operation.

---

## 4. Market & TAM / SAM / SOM

**Market context (verified):** Global EdTech ~250–280B USD (2025) → ~350B by 2030 (CAGR ~12–16%). **AI-in-education ~6–8B USD (2025) → ~40B by 2030 (CAGR ~25–43%)**. Within that, our **served segment — adaptive assessment/grading — is the fastest at ~46.7% CAGR.** We cite the 46.7% as the served-segment growth, but always alongside the blended AI-in-education **25–43% CAGR**, so the headline number is never presented in isolation: it is the fast end of a broad, independently-verified band, and it is precisely where our autonomous grading loop sits.

**One reconciled scope (resolves the top-down/bottom-up gap):** the 40B USD is the *global market-context anchor*; the EU/France figures are *bottom-up serviceable revenue at our price* and nest cleanly inside it.

| Layer | Definition | Figure | Nesting check |
| :--- | :--- | :--- | :--- |
| **TAM** (context anchor) | Global AI-in-education spend, 2030 (top-down) | **~40B USD ≈ 36.8B EUR** | — |
| **SAM-EU** (bottom-up) | EU 56M secondary+tertiary students × 15 EUR (Eurostat) | **840M EUR/yr** | = **2.3%** of TAM (EUR) — the credible reconciliation |
| **SAM-France** (beachhead) | France 8.5M students (5.6M secondary + 2.9M higher-ed, DEPP/INSEE) × 15 EUR | **127.5M EUR/yr** | = **15.2%** of SAM-EU |
| **SOM** (3-yr obtainable) | Realistic France share by Y3 (= Y3 base ARR band 4.25–5.95M EUR) | **~5M EUR ARR** | = **~3.3–4.7%** of France SAM; **~0.6%** of SAM-EU |

**SAM assumption (stated to survive scrutiny):** France student population is ~flat, so we model SAM as a **penetration play (students × price)**, *not* rising willingness-to-pay. SAM therefore grows with **price/tier mix**, not headcount — conservative on purpose. Denominators: **Eurostat** (EU 56M), **DEPP/INSEE** (France 8.5M).

**Serviceable-now wedge inside SAM:** private schools, grandes écoles (incl. EPITA), and tutoring networks — faster procurement, real budgets, no public-tender delay. This wedge, not "1% of all of France," is what the SOM rests on.

---

## 5. Business Model & Pricing Tiers

**Motion:** B2B2C SaaS, **land-and-expand**. Free teacher tier drives bottom-up adoption → paid institutional rollout. Annual contracts billed per academic year.

| Tier | Price | Who | Purpose |
| :--- | :--- | :--- | :--- |
| **Free (Teacher)** | 0 EUR | Single teacher, 1 class, capped generation | Acquisition / bottom-up funnel |
| **School** | **15 EUR/student/yr** | Schools, academies | Core volume tier (procurement floor for large public tenders) |
| **Premium (District/University)** | **25 EUR/student/yr** | Districts, universities — advanced analytics, **native ENT/Pronote/Moodle LMS sync**, priority support | Margin-accretive upsell; the 67% uplift is justified by the must-have LMS integration for the French CIO buyer |

**Blended ASP assumption (so ARR and student counts reconcile): 80% School (15) + 20% Premium (25) = 17 EUR/student/yr.** All ARR figures below use 17 EUR blended; sizing/SAM use the conservative 15 EUR.

**Price-anchoring note:** We avoid over-leaning on Khanmigo's $35–60 US *school-district* figure — that is a different product/market, and Khanmigo is *free* for teachers / **$4/mo (~$48/yr) consumer**. The honest anchor: at 15–25 EUR we sit **well below** any comparable institutional adaptive offering while holding ~72% margin, giving **deliberate room to raise price** toward 22–35 EUR once efficacy is proven. We keep 15 EUR as a **volume floor for large public tenders only**, where price sensitivity is real.

---

## 6. Tokenomics & Unit Economics

**Load-bearing assumption, stated honestly:** a *continuous* per-student loop with vision/OCR realistically consumes **~300–500k tokens/active-student/month** — not 250–300k. The hidden driver is **context re-injection** (course material + per-student memory on every call). We keep it in range via a **deliberate technical choice**: persistent memory is **summarized in Redis and prompt-cached**, so each call re-injects per-student *deltas*, not the full course. (Caveat for Q&A: this assumes Cloud Temple LLMaaS supports prompt caching; if not, tokens rise toward 600k+ and we fall back to the worst-case margin below — still positive.)

**Per-student/month token build (≈400k mid-point):**

| Loop component | Volume | ~Tokens/mo |
| :--- | :--- | :--- |
| Exercise generation | ~20/mo × ~4k | ~80k |
| OCR / vision grading | ~20 submissions (image + rubric + grading output) | ~70–100k |
| Memory + skill-graph updates (delta, cached) | continuous | ~120–250k |
| Interactive content + teacher-feedback aggregation share | occasional | ~30–50k |
| **Total** | | **~300–500k** |

**Blend:** $0.16/M is exactly a **70/30 input:output** mix (0.70×$0.10 + 0.30×$0.30 = $0.16) — generation and chain-of-thought grading are output-heavy, so we state **70/30, not "mostly input."** (A truly input-heavy 85/15 mix would be ~$0.13/M.)

**Per-student cost math (mid-point 400k tokens, 70/30, FX 0.92):**

| Step | Value |
| :--- | :--- |
| Raw model cost | 400k × $0.16/M = **$0.064/mo** = 0.059 EUR/mo |
| × Cloud Temple sovereignty premium (assume **3x**, conservative buffer vs. unpublished price) | 0.177 EUR/mo |
| + Non-model COGS (vision surcharge, Scalingo compute/student, Redis memory footprint) | +0.15 EUR/mo |
| **All-in COGS** | **~0.33–0.39 EUR/mo → ~4.20 EUR/student/yr** (mid-point of own 0.30–0.40 EUR/mo range) |

We headline **4.20 EUR/yr (0.35 EUR/mo)**, the *midpoint* of our own range. The "fraction of a cent per agent loop" thesis holds regardless: a single loop is **~$0.001–0.003**.

**Bounding the unpublished sovereignty premium (Q&A defense):** Cloud Temple's exact euro price is not public, so the 3x premium is the load-bearing input to the 72% margin. We bound the open-ended risk explicitly: at **4x premium GM is ~68%**, at **6x premium (no token stress) all-in COGS is ~6.05 EUR/yr → GM still ~60%**. The hard ceiling on any premium is the **self-host Mistral fallback on sovereign infra (Scaleway/OVHcloud)** — i.e. we are never price-takers above the cost of running the open-weights model ourselves, which caps the realistic premium well below 6x. We will obtain a written quote pre-pilot.

**Active vs. licensed:** COGS is per **active** student/month; revenue is per **licensed** student/year. If 40–60% of licensed students are monthly-active (realistic in schools, with summer dormant), COGS per *licensed* student is **lower** — engagement risk shows up as churn/value, never as a margin blow-up. We model the conservative (high-active) case.

---

## 7. Margins

| Scenario | COGS/yr | Gross margin @15 EUR | Contribution/student |
| :--- | :--- | :--- | :--- |
| Best case | 3.50 EUR | 76.7% | 11.50 EUR |
| **Headline (mid)** | **4.20 EUR** | **72.0%** | **10.80 EUR** |
| Conservative | 4.80 EUR | 68.0% | 10.20 EUR |
| **Stress (2× tokens + 4× premium)** | **~7.45 EUR** | **~50.3%** | **~7.55 EUR** |

- **Lead with ~72% (mid), present 68–77% range.**
- **Premium tier is margin-accretive:** at 25 EUR with 4.20 EUR COGS → **83% GM**.
- **Survives compound stress — recomputed transparently from our own formula:** the model line alone is 0.059 EUR/mo × **2 (tokens)** × **4 (premium)** = **0.471 EUR/mo**; add the full **0.15 EUR/mo non-model COGS** (which is *not* dropped under stress) → **0.621 EUR/mo = ~7.45 EUR/yr → ~50% GM**. Fifty percent is still a strong SaaS margin and the worst case is *fully reproducible from the stated build*. (Naive RAG-on-every-call would push tokens far higher and break this; that is the scenario the Redis-summarized + prompt-cached architecture explicitly prevents.) For reference, milder stress sets land higher: **2× tokens + 3× premium** or **1.5× tokens + 4× premium** each give ~6.05 EUR/yr → **~60% GM**.
- **COGS as % of revenue:** ~28% at 15 EUR (4.20/15), falling to **~17% at 25 EUR**, so blended company COGS% **declines** as Premium mix grows.

---

## 8. 3-Year Revenue Projection

**Two scenarios, honestly labeled** (one annual buying window + 6–12mo procurement cannot deliver 7× growth as a floor).

**Base case (blended ASP 17 EUR):**

| Year | Paying students | Institution bridge | ARR | % of France SAM (127.5M) |
| :--- | :--- | :--- | :--- | :--- |
| Y1 | 15–25k | ~8–12 logos, avg ~2,000 students (grandes écoles, private network, 1 motivated académie) | **0.26–0.42M EUR** | <0.5% |
| Y2 | 70–100k | ~25–40 logos, avg 2,000–3,000 students | **1.2–1.7M EUR** | ~1–1.3% |
| Y3 | 250–350k | large-logo concentration + free-tier conversion | **4.25–5.95M EUR (~5M = SOM)** | **~3.3–4.7%** |

**Conservative downside (15 EUR, ~80% renewal, fewer/smaller early deals):**

| Year | Paying students | ARR |
| :--- | :--- | :--- |
| Y1 | 3–5k | 0.04–0.07M EUR |
| Y2 | 20–30k | 0.30–0.45M EUR |
| Y3 | 80–120k | 1.2–1.8M EUR |

**SOM reconciliation:** SOM = the **Y3 base obtainable revenue ≈ 5M EUR**, spanning the **4.25–5.95M EUR band = ~3.3–4.7% of France SAM** (the rounded ~5M point estimate is ~3.9%). The conservative-downside Y3 figure (~1.3M EUR, ~1% of SAM) is the floor, not the target. Both scenarios are internally consistent; we do *not* "beat our own SAM."

**Bridge credibility note:** Y2's ~75k net-new students requires **~25–40 institutions averaging 2,000–3,000 students** — i.e. **large-logo concentration (grandes écoles, private networks, one académie), not 144 mid-size schools.** This is why we staff sales for whales, not volume (Section 9), and acknowledge: **one annual buying window per year; a slipped large deal moves the year.**

---

## 9. Cost Structure & Path to Break-Even

- **COGS:** ~17–28% of revenue (declining with Premium mix), scales with active students.
- **OpEx Y1:** **400–600k EUR** — founders + 2–3 eng + sales. Institutional rollout needs a **Customer Success / onboarding function** (teachers must upload/structure courses; dashboards must be acted on) — folded into Y2 OpEx, which rises to **~650–700k EUR** as we add 2–4 sales/channel reps for the large-logo motion.
- **Free-tier COGS (budgeted):** free teachers run real inference. ~30 students × 4.20 EUR × ~20% capped loop ≈ **25 EUR/teacher/yr**; 10k free teachers ≈ **~0.25M EUR/yr**. **Guardrail:** cap free-tier generation volume + cheaper cached path; **target free-teacher-school → paid conversion 15–25% within 2 academic years.**
- **CAC (quantified):** ~**8,000–20,000 EUR/institution** fully loaded (6–12mo rep cycle + pilot support). Amortized over a 2,000-student deal at ~12.8 EUR contribution: deal contribution ≈ 25,600 EUR/yr → **CAC payback ~4–9 months** (3.8mo at 8k CAC, ~6.6mo at the 14k midpoint, 9.4mo at 20k CAC) — i.e. **under 7 months at typical CAC ~8–15k**, longer at the top of the range. Per-student CAC is tiny *only if we land whales* — and whale procurement is slow, the key Y1 dependency. (Payback assumes the 2,000-student logo activates within year one; partial-year activation lengthens it proportionally.)
- **Break-even (derived explicitly):** Break-even students = OpEx ÷ contribution.

  | OpEx | ÷ 10.80 EUR contribution | Students |
  | :--- | :--- | :--- |
  | 500k | | **~46,000** |
  | 600k | | **~56,000** |
  | 700k (Y2 loaded, incl. CS + free-tier) | | **~65,000** |

  **We state ~46–56k students** at 500–600k OpEx. **Contribution-positive from student #1.** Company break-even lands **late Y2 in the base case**, slipping to **Y3 in the downside** — stated honestly.

---

## 10. Moats & Defensibility (reframed for diligence)

1. **Usage-based switching cost (not a "network effect").** After one academic year a student's skill graph encodes **~240 generated exercises and ~180 grading events** a competitor cannot replicate without re-running the year. This is real *switching cost*; we explicitly **do not** claim a cross-user network effect (student A's data does not improve student B's experience). **The moat to build (roadmap):** an anonymized, cross-institution **item-difficulty calibration dataset** — that *would* compound across users and is the durable asset.
2. **Sovereignty = procurement key / table-stakes, not a moat.** SecNumCloud/HDS/RGPD makes us **eligible** for French/EU education where US-hosted tools cannot play — but any EU competitor can also run on Cloud Temple/Mistral, so it differentiates us from US tools, not from French peers. Treat it as **eligibility for the public segment we deprioritize in Y1–Y2.**
3. **Cost asymmetry vs. human tutoring.** The autonomous loop costs ~4.20 EUR/student/yr; a human tutor is orders of magnitude more. This is the genuinely defensible economic wedge.
4. **Execution + integration depth.** Native ENT/Pronote/Moodle sync + a working autonomous agent that demos cleanly is a real lead-time advantage over a single LLM call bolted on a CRUD app.

---

## 11. Competitive Landscape

| Player | Price | Motion | Sovereign EU? | Autonomous per-student loop + memory? |
| :--- | :--- | :--- | :--- | :--- |
| **Us** | 15–25 EUR/student/yr | B2B2C, free-teacher land-and-expand | **Yes (SecNumCloud/HDS)** | **Yes** (plan→act→reflect, persistent memory, skill graph, OCR) |
| Khanmigo | Free (teacher) / $4/mo (~$48/yr) consumer / $35–60 US district | B2B2C / district | No (US-hosted) | Chat assistant; not a persistent-memory adaptive loop |
| MagicSchool | ~$100/yr per teacher | Teacher productivity | No | No — teacher tools, not a student adaptive loop |
| Squirrel AI | n/a (China) | Adaptive tutoring | No (CN) | Adaptive, but not EU-sovereign / not our market |
| Century Tech | UK enterprise | Adaptive learning | UK, not FR-sovereign | Adaptive analytics; not an autonomous generation+grading agent |

**Our wedge:** autonomous loop + persistent memory + skill graph + OCR grading + **sovereign EU AI** + integration depth.

---

## 12. Risks & Mitigations

| Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| **Long/seasonal procurement** (6–12mo; one buying window/yr; public sector slower) | High | Beachhead = private schools / grandes écoles / tutoring networks (fast budgets); public sovereignty = Y3+ option, not near-term revenue |
| **Pedagogical efficacy unproven** (schools buy outcomes, not tokens) | High | Budget a Y1 **pilot learning-gain study** as a required milestone + sales gate; lead expansion with the result |
| **Mis-grading / hallucination on minors' work** (trust- and liability-bearing) | High | **Human-in-the-loop teacher confirmation** on graded handwritten work; route hard tasks; error-rate budget + QA review line in OpEx; dispute workflow |
| **EU AI Act = high-risk (education/assessment) + RGPD Art. 22 (automated decisions on minors)** | High | Conformity assessment, transparency, mandatory human oversight, documentation — budgeted recurring compliance cost + sales-gate readiness (sovereignty solves residency, **not** AI Act obligations) |
| **Cloud Temple single-supplier / unpublished price** (3–4× premium is assumed) | Med-High | Benchmark + obtain written quote pre-pilot; name second sources (**Scaleway, OVHcloud, self-host Mistral on sovereign infra**); even **4× premium keeps GM ~68%**, and **6× still ~60%**, with self-host as the hard ceiling on premium |
| **Churn / weak NRR** (annual academic contracts; one bad September = cohort churns) | High | Assume **~85% logo retention Y1**, targeting >100% NRR via Premium upsell + multi-year contracts; tie renewal to demonstrated learning gains |
| **Mistral Small quality ceiling** | Med | Route hard tasks; human-in-the-loop teacher; deliberate use of summarized memory to keep context tight |
| **Mixed-currency / FX** ($ costs, EUR revenue) | Low | Stated $1 ≈ 0.92 EUR throughout |

---

## 13. KPIs

- **Growth/revenue:** paying students, **# institutions (logos) × avg students/logo**, ARR, **blended ASP**.
- **Funnel:** free-teacher → paid-institution conversion (target 15–25%/2yr), **pilot → paid conversion**.
- **Economics:** gross margin (target ~72%), COGS/active-student, **CAC/institution & payback (~4–9mo; <7mo at typical CAC ~8–15k)**, **NRR** (target >100%), free-tier COGS as % of revenue.
- **Engagement/value:** weekly active students, % licensed → active, teacher NPS.
- **Impact (the differentiator):** **students flagged-and-helped per TD**, measured **learning gain** vs. baseline (the efficacy signal procurement requires).

---

## 14. The 5-Minute Pitch Narrative (presenter script / bullet flow)

**[0:00–0:45] Hook**
- "Personalization in education was always too expensive — one human tutor per student does not scale. We make it cost **a fraction of a cent**."
- A teacher uploads their course. From it, an **autonomous agent** tutors *every* student, continuously.

**[0:45–1:45] Product / the autonomous loop**
- The agent **plans** (next exercise from the skill graph), **acts** (generates it, OCR-grades the handwritten work, updates persistent memory), **reflects** (adjusts difficulty, flags blocked students).
- The teacher only **supervises**: the dashboard says exactly who to pull aside in the next TD. The product *is* the agent.

**[1:45–2:45] Why it works — the economics**
- 400k tokens/student/month on **sovereign French AI** (Mistral Small via Cloud Temple, SecNumCloud/HDS/RGPD).
- Raw model cost: **$0.064/student/month**. All-in, with a 3× sovereignty buffer + vision + infra: **~4.20 EUR/student/year.**
- Sell at **15 EUR → 72% gross margin, ~10.80 EUR contribution per student.** Each agent loop costs ~$0.001. *This is why personalization-at-scale is now profitable — unlike human tutoring.*

**[2:45–3:30] Market**
- Served segment — **adaptive assessment/grading — is the fastest in AI-in-education at ~46.7% CAGR**, inside a broad AI-in-education market compounding at **25–43% CAGR** toward 40B USD (36.8B EUR) by 2030.
- Bottom-up: **France 8.5M students × 15 EUR = 127.5M EUR SAM**; EU = 840M EUR. **3-year obtainable ~5M EUR ARR (~3.3–4.7% of France).**

**[3:30–4:15] Go-to-market & defensibility**
- **Free teacher tier** → land-and-expand into institutions. Beachhead = **private schools, grandes écoles (like EPITA), tutoring networks** — fast budgets.
- **Sovereignty disqualifies US tools** from EU public tenders (eligibility, not just a feature).
- Switching cost compounds: a year of skill-graph data a competitor can't replicate. **CAC payback ~4–9 months (under 7 at typical deal size)** once a 2,000-student logo lands.

**[4:15–5:00] Proof & next milestone (it survives Q&A)**
- 3-yr base: **Y1 ~0.3M → Y2 ~1.5M → Y3 ~5M EUR ARR.** Break-even **~46–56k students, late Y2.**
- Stress-tested honestly: even at **2× tokens + 4× sovereignty premium, COGS ~7.45 EUR/yr → gross margin stays ~50%** (recomputed from our own formula; milder stress sets land ~60%). The thesis stays solidly positive — and the premium is bounded by a self-host Mistral fallback.
- **Why us / the ask:** we are an EPITA hackathon team that has built the working autonomous loop end-to-end on the sovereign stack. The concrete near-term ask is **pilot partners** — starting with EPITA and one private network — to run the **Y1 learning-gain study**, because schools buy outcomes and we are built to prove them.

---

## Key Assumptions (stated for Q&A defense)

- **Cloud Temple sovereignty premium: 3×** raw Mistral (range 3–4×), bounded by a self-host Mistral fallback on Scaleway/OVHcloud — GM stays ~60% even at 6×. Exact euro price is not public; obtain a written quote pre-pilot.
- **Token volume: 400k/active-student/month** (range 300–500k), held down by Redis-summarized memory + prompt caching (assumes Cloud Temple supports caching; worst case ~600k+ → ~50% GM).
- **Blend: 70/30 input:output** (→ $0.16/M); **blended ASP 17 EUR** (80% School @15 / 20% Premium @25).
- **FX:** $1 = 0.92 EUR throughout.
- **Population denominators:** France 8.5M students (DEPP/INSEE), EU 56M (Eurostat) — modeled flat (penetration play, not rising headcount).
- **Retention:** ~85% logo retention Y1, targeting >100% NRR via Premium upsell.

---

## Sources

**EdTech market size & CAGR**
- [Grand View Research — Education Technology Market ($348.41B by 2030, CAGR 13.3%)](https://www.grandviewresearch.com/industry-analysis/education-technology-market)
- [MarketsandMarkets — EdTech & Smart Classrooms ($197.3B 2025 → $353.1B 2030, CAGR 12.3%)](https://www.marketsandmarkets.com/Market-Reports/educational-technology-ed-tech-market-1066.html)
- [Market.us — Global EdTech ($277.2B 2025 → $907.7B 2034, CAGR 13.9%)](https://market.us/report/edtech-market/)

**AI-in-education & adaptive learning market**
- [Grand View Research — AI in Education Market](https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-education-market-report)
- [Mordor Intelligence — AI in Education ($6.90B 2025 → $41.01B 2030, CAGR 42.83%; adaptive assessment fastest ~46.7%)](https://www.mordorintelligence.com/industry-reports/ai-in-education-market)
- [Precedence Research — AI in Education Market](https://www.precedenceresearch.com/ai-in-education-market)

**Model & infrastructure pricing**
- [Mistral — official pricing](https://mistral.ai/pricing/) · [Mistral Small via OpenRouter](https://openrouter.ai/mistralai/mistral-small-2603) (Mistral Small 3: $0.10/M in, $0.30/M out)
- [Cloud Temple — Sovereign LLMaaS (SecNumCloud / HDS, France-hosted)](https://www.cloud-temple.com/en/products/large-language-model-as-a-service-llmaas/)

**Student populations**
- [INSEE — Effectifs scolaires premier/second degré et supérieur 2024-2025](https://www.insee.fr/fr/statistiques/2012683) · [Ministère de l'Éducation / DEPP — prévisions effectifs second degré](https://www.education.gouv.fr/prevision-des-effectifs-du-second-degre-pour-les-annees-2023-2027-357773) (France ~5.6M secondary)
- [Statista — Higher education students in France 2024 (~2.9M)](https://www.statista.com/statistics/779600/number-of-higher-education-students-schools-france/)
- [Eurostat — ~76M pupils & students in the EU (~56M secondary+tertiary)](https://ec.europa.eu/eurostat/web/products-eurostat-news/-/ddn-20210427-1)

**Competitor pricing**
- [Khanmigo — pricing (free for teachers, $4/mo consumer, $35–60/student district)](https://www.khanmigo.ai/pricing)
- [MagicSchool pricing (~$100/yr per teacher) — comparison](https://academicaitrends.com/blog/magicschool-ai-vs-khanmigo-for-teachers/)

*Note: market-size estimates vary by research firm and methodology; ranges above reflect that spread. Figures verified June 2026.*
