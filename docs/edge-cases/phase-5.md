# Phase 5 Edge Cases — Polish and Demo Readiness

**Plan:** [implementation-plan.md §9](../implementation-plan.md#9-phase-5--polish)  
**Scope:** UX polish, samples, file upload, README/DEMO, full QA, §13–§14 quality bar.

---

## 1. Loading & errors

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-01 | P0 | Analyze takes 45s | Skeleton on score/JD/gaps areas; cancel optional (P2) |
| EC-P5-02 | P0 | Tailor fails after successful analyze | Original analyze results remain; tailor retry offered |
| EC-P5-03 | P0 | Missing `GROQ_API_KEY` on server | Startup or first request: clear config error in README |
| EC-P5-04 | P1 | Intermittent 502 | Retry button; don’t clear user paste |
| EC-P5-05 | P1 | Partial network drop mid-download PDF | Error + retry export |

**Component:** Global error boundary, toasts, loading states

---

## 2. Sample data & demo (§13)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-10 | P0 | “Load sample” produces compelling before/after | Tailored score > original on sample |
| EC-P5-11 | P0 | `docs/DEMO.md` script works on fresh clone | < 10 min per exit gate |
| EC-P5-12 | P1 | Sample uses realistic SWE resume + real JD style | Not lorem ipsum |
| EC-P5-13 | P1 | Demo presenter runs live API | API key in `.env.local` documented |
| EC-P5-14 | P2 | Offline demo mode | Optional recorded PDF fallback in DEMO.md |

**Component:** `lib/mocks/*`, `docs/DEMO.md`

---

## 3. File upload (PDF/DOCX) — §7.1

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-20 | P0 | Upload + analyze same as paste path | Same `TailoringRun` shape |
| EC-P5-21 | P0 | Parse warning displayed | User sees warning before trusting structure |
| EC-P5-22 | P1 | Upload then user edits textarea | Re-parse or treat as paste override—document |
| EC-P5-23 | P1 | Drag-drop wrong file type | Reject with allowed types list |
| EC-P5-24 | P1 | Upload progress for 5MB PDF | Progress indicator |
| EC-P5-25 | P2 | Mobile file picker | Works on iOS/Android browsers |

**Component:** `ResumeInput` upload mode  
**Cross-ref:** EC-P2-40–45 in [phase-2.md](./phase-2.md)

---

## 4. Responsive & accessibility (§14)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-30 | P0 | Mobile 375px width | Usable input, stacked diff, readable gaps |
| EC-P5-31 | P0 | Score trend not color-only | “62 → 81 (+19)” text + optional color |
| EC-P5-32 | P1 | Keyboard: tab through confirmations | Export gate reachable |
| EC-P5-33 | P1 | Screen reader on `SideBySideDiff` | Labels for original vs tailored columns |
| EC-P5-34 | P2 | `prefers-reduced-motion` | No distracting animations |

**Component:** All major pages

---

## 5. Session & state polish

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-40 | P1 | Refresh mid-flow restores run | `sessionStorage` + `runId` |
| EC-P5-41 | P1 | Stale run from yesterday in storage | Optional expiry or “Start new” |
| EC-P5-42 | P2 | Two tabs same app | Last write wins or warn—document |

---

## 6. Downloads & optional exports

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-50 | P0 | Both PDF types downloadable from UI | Clear labels: “Comparison” vs “Tailored only” |
| EC-P5-51 | P1 | Filename includes job title slug | e.g. `comparison-acme-frontend.pdf` |
| EC-P5-52 | P2 | Markdown/DOCX export (§8 stretch) | Graceful “not available” if not built |

---

## 7. Quality bar regression (§14)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-60 | P0 | Tailored resume readable by human | Not keyword soup |
| EC-P5-61 | P0 | Gap actions actionable | No generic “improve skills” without JD evidence |
| EC-P5-62 | P1 | Three different JDs in QA pass | No crash; scores vary reasonably |
| EC-P5-63 | P1 | Vague JD demo | App degrades gracefully (see EC-P2-23) |
| EC-P5-64 | P1 | Junior vs senior mismatch demo | Honest gaps, no title fraud |

---

## 8. Deployment & public demo

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-70 | P1 | Public Vercel deploy | Rate limit on `/api/*`; no key in client |
| EC-P5-71 | P1 | PDF route on serverless | Chromium bundle or alternative documented |
| EC-P5-72 | P2 | Bot spam analyze endpoint | Basic IP rate limit |

---

## 9. Documentation edge cases

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P5-80 | P0 | README missing steps | Clone → install → env → dev → demo |
| EC-P5-81 | P1 | Known limitations listed | Multi-column PDF, score not ATS guarantee |
| EC-P5-82 | P1 | `.env.example` complete | All vars from implementation plan Appendix C |

---

## Phase 5 exit checklist (project done)

- [ ] All **EC-P5-* P0** handled
- [ ] All phase **P0** registries (Phases 1–4) still pass regression
- [ ] [problemStatement.md](../problemStatement.md) §19 Definition of Done
- [ ] §13 demo artifacts producible
- [ ] §14 quality bar spot-check on primary demo case

---

## Full-project regression (run before ship)

| ID | Flow |
|----|------|
| REG-01 | Paste → analyze → tailor → confirm flags → export comparison PDF |
| REG-02 | Load sample → same flow |
| REG-03 | Upload PDF (if supported) with warning path |
| REG-04 | Empty input blocked |
| REG-05 | API error shows message, data preserved |

See also [edge-case.md](../edge-case.md) cross-phase table **X-01–X-08**.
