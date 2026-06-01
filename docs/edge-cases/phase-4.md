# Phase 4 Edge Cases — Validation and Guardrails

**Plan:** [implementation-plan.md §8](../implementation-plan.md#8-phase-4--validation-and-guardrails)  
**Scope:** Unsupported-claim detection, confidence UI, confirmations, stricter Zod, export gate, prompt preamble.

**Can overlap Phase 3** once Phase 2 tailoring is stable.

---

## 1. Entity guardrails (employers, education, certs)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-01 | P0 | Tailored bullet mentions company not in `ResumeProfile.experience` | `riskFlag` or block; strip before save |
| EC-P4-02 | P0 | Tailored adds degree/school not in `education` | Flag/block |
| EC-P4-03 | P0 | Tailored adds certification not in `certifications` | Flag/block |
| EC-P4-04 | P1 | Company name substring match ( “Google” vs “Google LLC”) | Define normalization rules to avoid false positives/negatives |
| EC-P4-05 | P1 | JD company name appears as verb object, not employer | Heuristic: don’t false-flag “aligned with Acme goals” |

**Component:** `lib/guardrails/entity-check.ts`

---

## 2. Skill & technology guardrails

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-10 | P0 | “GraphQL” in tailored bullet; resume only has REST | `riskFlag`; suggest gap not bullet |
| EC-P4-11 | P1 | Skill in `skills[]` but no experience mention | Allow weaker match; optional medium confidence |
| EC-P4-12 | P1 | Synonym (K8s vs Kubernetes) in resume | Do not flag as new tech |
| EC-P4-13 | P2 | Tool in `projects` only | Allow if project lists technology |

**Component:** `lib/guardrails/skill-check.ts`

---

## 3. Metrics & scope guardrails

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-20 | P0 | New percentage not in original bullet | Flag or revert to original number |
| EC-P4-21 | P0 | New dollar amounts / user counts invented | Flag |
| EC-P4-22 | P1 | “Led team of 5” → “Led organization of 200” | `riskFlag` seniority inflation |
| EC-P4-23 | P1 | Stronger verb only (“helped” → “drove”) | `confidence: high` if facts unchanged |

**Component:** `lib/guardrails/metric-check.ts`, `seniority-check.ts`

---

## 4. Schema validation (stricter Zod)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-30 | P0 | `overallScore: 150` | Reject |
| EC-P4-31 | P0 | `confidence: "very-high"` | Reject |
| EC-P4-32 | P0 | Empty `explanation` | Reject |
| EC-P4-33 | P1 | `importance` missing on gap | Reject or default `medium`—document |
| EC-P4-34 | P1 | LLM returns before UI update | User never sees unvalidated payload |

**Component:** `lib/schemas.ts`, `lib/llm/parse-json.ts`

---

## 5. Confidence UI & confirmations

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-40 | P0 | `confidence: low` bullet | Checkbox required before export |
| EC-P4-41 | P0 | `confidence: medium` bullet | Checkbox required (per plan) |
| EC-P4-42 | P0 | `confidence: high` only | No per-bullet checkbox |
| EC-P4-43 | P1 | User checks then edits bullet text manually (future) | Out of scope MVP—confirm applies to system text |
| EC-P4-44 | P1 | Multiple low-confidence bullets | All must be confirmed |
| EC-P4-45 | P2 | User unchecks after checking | Export blocked again |

**Component:** `SideBySideDiff.tsx`, `TailoringRun.userConfirmations`

---

## 6. Export gate

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-50 | P0 | Export without disclaimer checkbox | Blocked with message |
| EC-P4-51 | P0 | Export with unconfirmed medium/low bullets | Blocked; list which bullets |
| EC-P4-52 | P1 | Phase 3 PDF API called directly bypassing UI | Server validates confirmations if stored server-side; or accept client-only gate for MVP |
| EC-P4-53 | P1 | Disclaimer text matches §7.7 / §17 mitigations | Exact legal tone: user verifies accuracy |

**Component:** `PDFExportButton.tsx`, optional server check in `/api/export`

---

## 7. Prompt hardening

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P4-60 | P0 | All prompts import shared `TRUTHFULNESS_PREAMBLE` | Code review checklist |
| EC-P4-61 | P1 | Regression: guardrails flag >50% bullets | Tune prompts before loosening guardrails |
| EC-P4-62 | P2 | Second LLM pass to fix flagged bullets | Optional; document if implemented |

**Component:** `prompts/_preamble.ts`, all prompt files

---

## 8. Automated tests (recommended)

| ID | P | Scenario | Test type |
|----|---|----------|-----------|
| EC-P4-70 | P1 | Crafted bullet with fake employer | Unit: entity-check fails |
| EC-P4-71 | P1 | Crafted bullet with new metric | Unit: metric-check fails |
| EC-P4-72 | P1 | Valid paraphrase only | Unit: passes, high confidence |

---

## Phase 4 exit checklist

- [ ] All **EC-P4-* P0** handled
- [ ] §17 mitigations from [problemStatement.md](../problemStatement.md) implemented
- [ ] Fabrication test case fails closed
- [ ] Export cannot proceed without disclaimer + risky confirmations
- [ ] `riskFlag` visible in UI for manual QA

**Handoff to Phase 5:** Demo script should mention reviewing flagged bullets.
