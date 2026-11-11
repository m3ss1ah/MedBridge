# MedBridge — Presentation Content (16 slides)

> Content file for the project presentation. Each slide has **on-slide content** (what the audience reads) and **speaker notes** (what you say). All numbers come from the actual build: tests, retrieval evaluation and live runs on the synthetic sample reports.

---

## Slide 1 — Title

**MedBridge**
*AI-Powered Medical Report Assistant*

- Lab reports, in plain words
- Academic Digital Health course project
- LLM (Groq) + Retrieval-Augmented Generation (RAG) + deterministic validation
- Team / names / date

**Speaker notes:**
MedBridge is a web app that takes a text-based lab report PDF and explains it in language a patient can understand. It shows every result against the lab's own range and helps people prepare questions for their doctor. It combines a large language model, a retrieval system over a curated knowledge base, and plain, testable code that makes the important decisions.

---

## Slide 2 — The Problem

**Lab reports are written for clinicians, not patients**

- Dense tables, abbreviations (Hb, PCV, MCV, eGFR, SGPT) and flags (H, L, HH)
- A flag looks alarming but often isn't. Patients can't tell which results matter
- Reference ranges differ between labs, ages and sexes, which is confusing to compare
- Web searches give generic, often frightening answers with no link to *your* numbers
- Doctor visits are short, so patients don't know what to ask

**Goal:** close the gap between complex medical information and patient understanding.

**Speaker notes:**
Show a raw sample CBC PDF here, with its abbreviations, numbers and letters like "L" in a column. Most people either ignore their report or search online and panic. We want people to understand their report and walk into the doctor's office with better questions, without the app ever acting as a doctor.

---

## Slide 3 — Our Solution & Who It's For

**Upload a report → understand it → ask better questions**

| Persona | Need | What MedBridge gives |
|---|---|---|
| P1 Everyday patient | CBC with low haemoglobin | What haemoglobin is, why it's flagged, what to ask |
| P2 Health-conscious individual | Lipid profile | LDL vs HDL, triglycerides, targets explained |
| P3 Caregiver | Elderly relative's metabolic panel | Clear summary, read-aloud, printable questions |

**Principle:** educate, never diagnose or prescribe.

**Speaker notes:**
Three personas drove the design and the synthetic test data. Each has a matching sample report built into the app, so the demo is one click per persona. Throughout, the system explains and points back to the doctor. It never says "you have" a condition and never suggests medicines.

---

## Slide 4 — Three Core Features

**F1 — Report Explanation** (LLM, structured JSON)
- Plain-language overview, key findings, per-test explanations, questions for the doctor

**F2 — Knowledge Assistant** (RAG with citations)
- Q&A about tests and terms, answered only from 30 curated articles, every claim cited

**F3 — Health Dashboard** (deterministic rendering)
- Each value drawn on a gauge against the lab's reference range, with filters and ordering

**Exactly two API endpoints:** `POST /api/analyze-report` and `POST /api/ask`

**Speaker notes:**
F1 and F2 are the two AI features. F3 involves no AI: it simply draws the validated numbers from F1. A hard rule in our spec was that the backend exposes only two application endpoints, and an automated test enforces it. Every later feature had to fit inside those two.

---

## Slide 5 — System Architecture

```
React + Vite (browser)
  Landing · Report · Dashboard · Ask · Glossary
        │ POST /api/analyze-report        │ POST /api/ask
        ▼                                  ▼
FastAPI backend
  pdf_extractor (PyMuPDF → pdfplumber)   retriever (MiniLM embeddings → vector search)
  report_analyzer                         answerer (grounded prompt → Groq, citations)
    1) LLM extraction → JSON               guardrails (emergency, post-check)
    2) Python validation + status
    3) LLM explanation (validated data only)
    4) related knowledge (retrieval only)
  llm_client (one Groq wrapper: retries, timeouts, JSON mode)
        ▲
knowledge_base/*.md (30 docs) → build_index → vectors + chunks.json
```

**Speaker notes:**
The frontend is a single-page React app. The backend is FastAPI. All LLM calls go through one wrapper that handles retries, timeouts and errors, and logs only latency and token counts, never content. The knowledge base is indexed once by a script, and the index loads at startup. If the index is missing, report analysis still works and only the assistant is disabled.

---

## Slide 6 — Design Principles (Hard Rules)

1. **Exactly 2 endpoints.** Enforced by an automated test
2. **No persistence.** PDFs processed in memory; no database, no saved files, no browser storage
3. **No secrets in code.** API key only in `backend/.env` (git-ignored); model name from `GROQ_MODEL`
4. **Never diagnose or prescribe.** Enforced in every prompt, plus an answer post-check
5. **Deterministic over generative.** AI copies values; *code* decides low / normal / high
6. **Every AI answer carries a disclaimer**, and knowledge answers carry sources

**Speaker notes:**
These rules came first and shaped everything. The most important is number 5: we never trust the AI to decide whether a number is abnormal. It only copies what the lab printed. Python parses the numbers and compares them with the lab's own range, so the dashboard can never show an invented range.

---

## Slide 7 — F1: How a Report Is Analysed

**Read → Copy → Check → Explain**

1. **Read:** validate the file (type, size ≤ 10 MB, ≤ 20 pages, not encrypted) and extract text in memory. Scanned images are detected and politely refused
2. **Copy:** LLM call #1 extracts each test's name, value, unit, range and flag *exactly as printed* into JSON
3. **Check:** Python validates every row, parses numbers and ranges, and computes the status. Bad rows go to "couldn't read" instead of crashing
4. **Explain:** LLM call #2 writes the explanations, seeing **only the validated data**, never the raw PDF

Live result on the CBC sample: **13 tests, 3 low, explained in about 9 s**

**Speaker notes:**
We split the work into two LLM calls on purpose. Extraction errors are caught by code before any explanation is written. And because the explanation step never sees the raw PDF, a document can't slip hidden instructions to the model, which protects against prompt injection. Counts like "3 of 13 outside range" are computed in Python, not by the model.

---

## Slide 8 — Deterministic Status: The Range Parser

**Real lab formats handled in code:**

| Printed on report | Parsed |
|---|---|
| `12.0 - 15.5`, `12–15.5` (en dash) | low 12.0, high 15.5 |
| `1,50,000 - 4,10,000` (Indian grouping) | 150000 – 410000 |
| `< 100`, `Up to 200`, `Less than 200` | upper limit only |
| `> 40`, `>= 40` | lower limit only |
| `Desirable: <200 Borderline: 200-239` | first (desirable) band |
| `10,8` (comma decimal) | 10.8 |
| `Negative` | not numeric → compared as text |

- Lab flag (H, L, ↑, HH) is used when no range is printed. If the lab's flag disagrees with our comparison, **trust the lab**
- Critical markers (CRITICAL, HH, LL, PANIC) → red-flag banner: "contact your doctor promptly"

**Speaker notes:**
This module is pure functions with more than 50 unit tests. Labs print ranges in many ways, including Indian number grouping for platelets. When the lab's own flag disagrees with our comparison, we trust the lab, because it may use age- or sex-specific cut-offs we can't see. Red flags only ever come from the lab's own critical markers. We never invent clinical thresholds.

---

## Slide 9 — F2: Knowledge Assistant (RAG)

**Question → retrieve → grounded answer with citations**

1. Emergency phrases ("chest pain right now") → fixed emergency message, **no AI call**
2. Embed the question with **all-MiniLM-L6-v2** (runs locally, free)
3. Vector search over 180 chunks → keep matches with cosine ≥ **0.35**, max 2 per document
4. **Nothing relevant → fixed "not in knowledge base" answer, no AI call** (no hallucination)
5. Otherwise Groq answers **only from the numbered passages**, citing [1], [2]
6. Optional: uses the person's report. Statements from it are marked as "your report"

**Speaker notes:**
RAG means the model answers from passages we retrieved, not from its general memory. The key safety property is step 4: if nothing in our knowledge base is similar enough, the model is never called and we return a fixed message. Asked "who won the cricket match", it says the topic isn't covered. Asked "Should I take iron tablets?", it declines to advise and points to the doctor.

---

## Slide 10 — Knowledge Base & Retrieval Evaluation

**30 plain-language articles**, written in our own words
General (5) · Blood count (9) · Cholesterol (6) · Metabolic (5) · Liver · Thyroid · Vitamins & iron (3)
Sources credited: MedlinePlus (NIH), NHS, Testing.com, Cleveland Clinic

**Retrieval evaluation (20 seed questions):**

| Metric | Result | Target |
|---|---|---|
| **hit@1** | **0.95** | — |
| **hit@3** | **1.00** | ≥ 0.80 |
| On-topic best score | 0.51 – 0.76 | |
| Off-topic best score | 0.04 – 0.14 | |

Threshold 0.35 sits well inside the gap between off-topic and on-topic scores.

**Speaker notes:**
Each article follows the same template: what it measures, why it's done, the reference range, what high and low values can be associated with, and questions for the doctor. Aliases like "Hb" and "PCV" are added to the text we embed, so short queries work. Every question found its correct article in the top three. The one miss at rank 1 still returned a closely related article.

---

## Slide 11 — Dashboard & Interface Design

**The reference-range gauge is the visual language of the whole app**
- Logo = a tiny gauge; hero = a large gauge whose marker glides into place once
- Dashboard: every value on a gauge, labelled with the lab's limits
- Donut summary: "10 of 13 in range"

**Calm and accessible by design**
- Low = amber, not red; high = muted brick
- Status always shown as **colour + shape (↓ ↑ ✓) + word**, never colour alone
- Atkinson Hyperlegible body font (designed for low-vision readers); keyboard navigation; reduced motion respected; works at 360 px wide

**Speaker notes:**
Instead of a generic chart library look, one idea runs through the design: "where does my number sit?" The gauge appears everywhere, from the logo to the dashboard. Colours were chosen to avoid alarm, and status never depends on colour alone, which matters for colour-blind users. Out-of-range areas are lightly hatched, so they read even in greyscale.

---

## Slide 12 — Features That Make It Useful

- **One-click sample reports:** three personas, no file hunting in a demo
- **Detail drawer:** click any result for its explanation, **related knowledge-base passages with sources**, and doctor questions (retrieval only, no extra AI call)
- **Glossary + tooltips:** 61 terms; hover or Tab over underlined words; searchable tab
- **Hindi:** the explanation in Hindi (test names and statuses unchanged), cached in the browser
- **Listen:** reads the summary aloud (English or Hindi)
- **Doctor visit summary:** copy, print, or download a plain-text note
- **Report-aware chat:** suggested questions from your own results ("What does low Haemoglobin mean?")

All within the same **two endpoints**.

**Speaker notes:**
These features were added after the core was stable. The drawer's related passages come from the same retrieval system, so they cost no extra AI calls. Hindi addresses an Indian audience. The translation is cached in the browser, not on the server, because server caching would mean storing report data. Read-aloud and the printable summary are aimed at the caregiver persona.

---

## Slide 13 — Safety, Privacy & Ethics

| Risk | Control |
|---|---|
| Diagnosis / prescription | Strict prompts + regex post-check + disclaimer everywhere |
| Hallucinated values or ranges | AI copies raw text; code computes status |
| Ungrounded answers | Similarity threshold, fixed no-answer message, citations |
| Prompt injection via PDF | Untrusted text in delimiters; explanation never sees raw PDF |
| Anxiety | Calm wording, amber for low; red flags only from the lab |
| Emergencies | Fixed "contact emergency services" message, no AI |
| Privacy | No storage, no database, no logging of report content; names and IDs not extracted |
| Abuse / cost | Size and page limits, question length limits, per-IP rate limit |

Synthetic reports only; no real patient data was used.

**Speaker notes:**
Health is a sensitive domain, so safety was designed in, not added at the end. We also checked every log line in the backend: logs contain only sizes, timings and token counts. Report text is sent to Groq to generate explanations, and the app says so up front. This is an academic project, not a medical device, and it makes no clinical accuracy claims.

---

## Slide 14 — Engineering & Testing

**Tech stack:** React 18 + Vite · FastAPI · Pydantic v2 · PyMuPDF/pdfplumber · Groq (`openai/gpt-oss-120b`, set by env variable) · sentence-transformers · FAISS (numpy fallback)

**Quality:**
- **126 backend tests** (pytest) with a mocked LLM: no key or network needed
- **19 frontend tests** (vitest + Testing Library)
- Route test enforces **exactly 2 endpoints**
- 1 live test against real Groq (`pytest -m live`): CBC → haemoglobin low, ≥ 4 questions, < 15 s ✔
- Uniform error envelope for every failure: scanned PDF, encrypted, too large, rate limited, timeout…
- Linters clean (ruff, eslint); every build decision documented in `DECISIONS.md`

**Speaker notes:**
Because the AI is mocked in tests, the whole suite runs offline in seconds. The error handling matters for a demo: a scanned PDF gets a helpful message, and a Groq rate limit becomes "please wait a moment" rather than a crash. Every place where we had to choose or deviate from the spec is recorded with the reasoning.

---

## Slide 15 — Challenges & How We Solved Them

| Challenge | Solution |
|---|---|
| Windows Application Control blocked the FAISS library | Same exact cosine search in numpy as a fallback; identical results at this scale |
| Groq retired the planned model (`llama-3.3-70b-versatile`) | Model is read from `.env`, so we switched to `openai/gpt-oss-120b` with no code change |
| New model wrote citations as 【1】 | Normalised to [1] before mapping sources; added a test |
| Free-tier rate limits during demos | Clear `RATE_LIMITED` message; related knowledge uses retrieval, not extra AI calls |
| Labs print ranges in many formats | Dedicated range parser with 50+ unit tests |
| Adding features under a "2 endpoints" rule | Folded into existing endpoints with optional, backward-compatible fields |

**Speaker notes:**
Two of these validated our design decisions. Because the model name was never hard-coded, the retired model took one line in a config file to fix. Because retrieval was separated from generation, the FAISS block only needed a small fallback. Being honest about these problems is part of the engineering story.

---

## Slide 16 — Limitations, Future Work & Conclusion

**Limitations**
- Text-based PDFs only (no OCR yet); English and Hindi only; lab reports only
- Explanations and knowledge base not clinically reviewed; no accuracy claims
- Depends on a third-party AI service and its rate limits

**Future work**
- OCR for scanned reports · more regional languages · streaming answers
- Trends across multiple reports (would need consented storage)
- Hybrid search (keyword + embeddings) and re-ranking · clinician-reviewed content

**Conclusion**
MedBridge shows that LLMs and RAG can make medical information **understandable without replacing the doctor**, when the AI explains and plain code decides.

**Thank you. Questions?**

**Speaker notes:**
Close by stating the limitations clearly. Then the key idea: the AI explains, the code decides, and the doctor interprets. Live demo order (about 7 minutes): CBC sample → summary and drawer → dashboard filtered to Low → Ask "What does MCV mean?" → "Why might my haemoglobin be low?" with the report → off-topic question → "Should I take iron tablets?" → scanned PDF error → thyroid sample for the critical banner → switch to Hindi.
