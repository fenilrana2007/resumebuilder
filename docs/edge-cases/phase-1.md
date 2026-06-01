# Phase 1 Edge Cases — Static Prototype

**Plan:** [implementation-plan.md §5](../implementation-plan.md#5-phase-1--static-prototype)  
**Scope:** UI, Zod schemas, mocks, pasted text only, side-by-side in browser (no LLM, no PDF).

---

## How to use this file

While coding Phase 1, for each component you touch, scan the **Component** column. Implement **Expected behavior** before the phase exit gate. Mark **P0** items first.

---

## 1. Input & validation (`ResumeInput`, `JDInput`)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-01 | P0 | Empty resume on Analyze | Disable Analyze or show inline error; no navigation to results with empty mock |
| EC-P1-02 | P0 | Empty JD on Analyze | Same as resume |
| EC-P1-03 | P0 | Whitespace-only paste (`"   \n  "`) | Treat as empty |
| EC-P1-04 | P1 | Very long paste (50k+ chars) | Optional char counter + soft warning; UI must not freeze |
| EC-P1-05 | P1 | Paste includes `\r\n` vs `\n` | Display and store consistently; mock still loads |
| EC-P1-06 | P2 | User pastes HTML from web resume | Render as text in textarea, not interpreted HTML (XSS-safe) |

**Component:** `ResumeInput.tsx`, `JDInput.tsx`, `app/tailor/page.tsx`

---

## 2. Schemas (`lib/schemas.ts`)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-10 | P0 | Mock `TailoringRun` fails Zod parse | Fix mock data—CI or script validates mocks on build |
| EC-P1-11 | P0 | `overallScore` outside 0–100 in mock | Schema rejects; forces realistic demo data |
| EC-P1-12 | P1 | Optional fields missing (`certifications: []`) | Schema allows empty arrays; UI handles empty sections |
| EC-P1-13 | P1 | `confidence` typo in mock (`"High"`) | Zod enum fails—use `high \| medium \| low` |
| EC-P1-14 | P1 | Experience entry with zero bullets | UI shows role header without bullet list crash |
| EC-P1-15 | P2 | Extremely long `explanation` string | UI truncates with “show more” or scrolls |

**Component:** `lib/schemas.ts`, `lib/mocks/*`

---

## 3. Mock data & sample loader

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-20 | P0 | “Load sample” with empty form | Fills both textareas + can run Analyze |
| EC-P1-21 | P1 | Load sample over existing user text | Confirm overwrite or merge—document choice in UI |
| EC-P1-22 | P1 | Mock tailored score ≤ original (demo realism) | Prefer mock where tailored > original for happy path; document if reversed for testing |
| EC-P1-23 | P1 | Mock has 0 gaps | `GapAnalysis` shows empty state, not broken layout |
| EC-P1-24 | P1 | Mock has 10+ gaps | List scrolls; sort by importance in UI if implemented |

**Component:** `lib/mocks/tailoring-run.ts`, Landing CTA

---

## 4. Navigation & flow (`StepIndicator`, routing)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-30 | P0 | Analyze without visiting input page | N/A if single flow; else redirect to input |
| EC-P1-31 | P0 | Direct URL to `/tailor/results` without state | Redirect to input or show “Run analyze first” |
| EC-P1-32 | P1 | Back button from results to input | Preserved textarea content (local state or sessionStorage) |
| EC-P1-33 | P1 | Double-click Analyze | Single transition; no duplicate mock loads flickering |
| EC-P1-34 | P1 | Click Tailor before Analyze | Disabled or prompt to analyze first |
| EC-P1-35 | P2 | Browser refresh on results page | Restore mock run from `sessionStorage` if `runId` stored |

**Component:** `app/tailor/*`, `StepIndicator.tsx`

---

## 5. `ScoreCard` (original score only in Phase 1)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-40 | P0 | Only `originalMatch` present | Renders; no crash waiting for tailored score |
| EC-P1-41 | P1 | Sub-scores missing in mock | Hide or show “—”; don’t show `undefined` |
| EC-P1-42 | P1 | `criticalMissingRequirements` empty | Section hidden or “None identified” |
| EC-P1-43 | P1 | After Tailor, show before → after | Two scores visible; arrow or delta label |
| EC-P1-44 | P2 | Score displayed with false precision (`73.456`) | Round to integer in UI (prep for Phase 2) |

**Component:** `ScoreCard.tsx`

---

## 6. `GapAnalysis`

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-50 | P0 | `importance: "high"` | Distinct visual weight vs medium/low |
| EC-P1-51 | P1 | Long `jdEvidence` text | Wraps; readable on mobile |
| EC-P1-52 | P1 | `canSafelyAdd: false` | Copy hints “do not invent” (tooltip or subtext) |
| EC-P1-53 | P2 | Duplicate gap names in mock | UI dedupes or shows both with clear labels |

**Component:** `GapAnalysis.tsx`

---

## 7. `SideBySideDiff`

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-60 | P0 | Bullet unchanged (`original === tailored`) | Show both columns; optional “No change” badge |
| EC-P1-61 | P0 | Expand metadata: reason, keywords, confidence | All fields visible when expanded |
| EC-P1-62 | P1 | `riskFlag` non-empty in mock | Visible warning styling (prep Phase 4) |
| EC-P1-63 | P1 | 20+ bullets | Scroll per column or virtualize; no layout break |
| EC-P1-64 | P1 | Mobile viewport | Columns stack (tabs or vertical), readable |
| EC-P1-65 | P2 | Special characters in bullet (`<`, `&`) | Escaped rendering |

**Component:** `SideBySideDiff.tsx`

---

## 8. `PDFExportButton`

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-70 | P0 | Always disabled in Phase 1 | Tooltip: “Available in Phase 3” |
| EC-P1-71 | P1 | Status not `tailored` | Remains disabled |
| EC-P1-72 | P2 | Keyboard focus on disabled button | Accessible label explains why disabled |

**Component:** `PDFExportButton.tsx`

---

## 9. JD summary panel (analysis results)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P1-80 | P1 | Mock JD missing `company` | Show job title only |
| EC-P1-81 | P1 | Empty `preferredSkills` | Section omitted or “None listed” |
| EC-P1-82 | P2 | Many keywords (30+) | Collapsible “Show all” |

**Component:** Results page JD panel

---

## Phase 1 exit checklist

Before closing Phase 1 in [implementation-plan.md](../implementation-plan.md):

- [ ] All **EC-P1-* P0** rows handled
- [ ] Mocks pass `lib/schemas.ts` validation
- [ ] Empty input blocked
- [ ] Results page works only after Analyze
- [ ] Side-by-side works after Tailor with metadata visible
- [ ] PDF button disabled with clear message

**Next phase prep:** Schemas and components must accept **real** LLM shapes without redesign—verify optional fields match [problemStatement.md](../problemStatement.md) §9 JSON.
