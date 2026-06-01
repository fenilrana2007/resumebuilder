# Phase 3 Edge Cases — PDF Export

**Plan:** [implementation-plan.md §7](../implementation-plan.md#7-phase-3--pdf-export)  
**Scope:** Tailored resume PDF, side-by-side comparison PDF, `POST /api/export`, enabled download UI.

**Requires:** Phase 2 complete `TailoringRun` with `status: tailored`.

---

## 1. Export API (`POST /api/export`)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-01 | P0 | Export with `runId` not found | `404` |
| EC-P3-02 | P0 | Export when status is `analyzed` only (no tailor) | `400` “Complete tailoring first” |
| EC-P3-03 | P0 | Invalid `type` | `400` |
| EC-P3-04 | P0 | `type: 'both'` | Returns both PDFs (zip or two URLs—document choice) |
| EC-P3-05 | P1 | Concurrent export requests same run | Idempotent; no server crash |
| EC-P3-06 | P1 | Playwright/Chromium missing in dev | README documents install; clear error |

**Component:** `app/api/export/route.ts`

---

## 2. Comparison PDF content (§7.8, §9, §19)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-10 | P0 | Missing disclaimer | PDF must include “verify all content before use” |
| EC-P3-11 | P0 | Missing original or tailored score | Both scores in header |
| EC-P3-12 | P0 | Missing JD summary | Required skills/tools/seniority summarized |
| EC-P3-13 | P0 | Missing gap section | Gap summary present (or “None identified”) |
| EC-P3-14 | P0 | Changed bullets not visually distinct | Highlight or bold tailored changes |
| EC-P3-15 | P1 | Missing `company` in JD | Header shows title only |
| EC-P3-16 | P1 | Bullet-level `changeReason` omitted for space | Appendix or footnotes per changed bullet—§19 requires explanations |
| EC-P3-17 | P2 | Very long `explanation` text | Wrap; don’t clip page |

**Component:** `lib/pdf/templates/comparison.*`

---

## 3. Tailored resume PDF

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-20 | P0 | Uses tailored bullets, not original | Verified in QA |
| EC-P3-21 | P1 | Empty `tailoredSummary` | Omit section or use original summary—document rule |
| EC-P3-22 | P1 | Long resume (8+ pages) | Paginate; readable font size |
| EC-P3-23 | P1 | Unicode name (diacritics) | UTF-8 font embedded; no tofu |
| EC-P3-24 | P2 | Emoji in project title | Renders or strips consistently |

**Component:** `lib/pdf/templates/tailored-resume.*`

---

## 4. Layout & rendering

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-30 | P0 | Two-column comparison overflows page | Column breaks paginate correctly |
| EC-P3-31 | P1 | 50+ bullets | Multi-page; no single-page microscopic font |
| EC-P3-32 | P1 | Special chars `<`, `&` in bullets | Escaped in HTML template |
| EC-P3-33 | P1 | Serverless function timeout | Node runtime; increase timeout or async job (document) |
| EC-P3-34 | P2 | Dark mode UI vs white PDF | PDF always print-friendly white background |

**Component:** PDF renderer (Playwright/Puppeteer/React-PDF)

---

## 5. UI (`PDFExportButton`)

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-40 | P0 | Button enabled only when `tailored` | Enforced |
| EC-P3-41 | P0 | Download starts; browser receives `application/pdf` | Correct headers |
| EC-P3-42 | P1 | Export in progress | Loading on button; prevent double download |
| EC-P3-43 | P1 | Export API fails | Error message; user can retry |
| EC-P3-44 | P2 | Safari/iOS download behavior | File downloads or opens inline—acceptable if documented |

**Component:** `PDFExportButton.tsx`

---

## 6. Data edge cases from Phase 2

| ID | P | Scenario | Expected behavior |
|----|---|----------|-------------------|
| EC-P3-50 | P1 | `original === tailored` for all bullets | PDF still valid; highlights optional “unchanged” |
| EC-P3-51 | P1 | Empty `gaps` array | Gap section shows none |
| EC-P3-52 | P1 | `riskFlag` on bullets | Optionally show warning icon in PDF (Phase 4 may require) |

---

## Phase 3 exit checklist

- [ ] All **EC-P3-* P0** handled
- [ ] §12 #10 + §19 PDF requirements from [problemStatement.md](../problemStatement.md)
- [ ] Demo: real JD + resume → downloadable comparison PDF
- [ ] Tailored-only PDF works separately
- [ ] Export blocked before tailor complete

**Handoff to Phase 4:** Export gate will add disclaimer checkbox—leave hook in `PDFExportButton`.
