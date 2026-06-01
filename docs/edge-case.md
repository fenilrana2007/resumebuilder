# Edge Cases — Master Index

**Use while implementing:** open the file for your **current phase** and check off scenarios as you handle them.

| Phase | Doc | Implementation plan |
|-------|-----|---------------------|
| **1** | [edge-cases/phase-1.md](./edge-cases/phase-1.md) | [implementation-plan.md §5](./implementation-plan.md#5-phase-1--static-prototype) |
| **2** | [edge-cases/phase-2.md](./edge-cases/phase-2.md) | [implementation-plan.md §6](./implementation-plan.md#6-phase-2--llm-integration) |
| **3** | [edge-cases/phase-3.md](./edge-cases/phase-3.md) | [implementation-plan.md §7](./implementation-plan.md#7-phase-3--pdf-export) |
| **4** | [edge-cases/phase-4.md](./edge-cases/phase-4.md) | [implementation-plan.md §8](./implementation-plan.md#8-phase-4--validation-and-guardrails) |
| **5** | [edge-cases/phase-5.md](./edge-cases/phase-5.md) | [implementation-plan.md §9](./implementation-plan.md#9-phase-5--polish) |

**Source requirements:** [problemStatement.md](./problemStatement.md) §17 (Risks and Edge Cases)

---

## Priority legend

| Tag | When to handle |
|-----|----------------|
| **P0** | Must handle before phase exit gate |
| **P1** | Should handle in this phase or document as known limitation |
| **P2** | Nice-to-have; can defer with README note |

---

## Cross-phase edge cases (quick reference)

These span multiple phases—primary owner phase is listed.

| ID | Scenario | Owner phase |
|----|----------|-------------|
| X-01 | Empty resume or JD | 1 (block UI), 2 (API validate) |
| X-02 | Vague / non-job JD text | 2 |
| X-03 | LLM invents employers or skills | 2 (prompts), 4 (guardrails) |
| X-04 | Tailored score lower than original | 2 |
| X-05 | Export before tailor complete | 1 (disabled), 3 (gate) |
| X-06 | User skips review / trusts AI blindly | 4, 5 (disclaimer) |
| X-07 | Multi-column / scanned PDF | 2 optional, 5 (upload) |
| X-08 | Session lost on refresh | 1–2 (sessionStorage), 5 (polish) |

---

## Phase exit: edge-case sign-off

Before marking a phase complete in [implementation-plan.md](./implementation-plan.md), verify all **P0** items in that phase’s edge-case file are **Handled** or **Documented**.

```text
Phase 1: docs/edge-cases/phase-1.md  →  all P0 checked
Phase 2: docs/edge-cases/phase-2.md  →  all P0 checked
...
```

---

## Test case template

Copy into phase files or your test suite:

```markdown
- [ ] **EC-Px-NN**: [Title]
  - Input:
  - Steps:
  - Expected:
  - Status: ☐ Not tested | ☑ Pass | ☐ Fail
```
