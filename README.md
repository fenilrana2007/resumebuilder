# Resume Shapeshifter

A premium, interactive, JD-to-resume tailoring application featuring explainable match scoring, automated gap analysis, strict safety guardrails, and highly polished PDF proof exports. Built as a demo-ready portfolio MVP.

---

## Key Features

1. **Alignment & Parsing**: Structured extraction of target requirements, keywords, domain signals, and seniority from job descriptions, combined with automated resume segmentation.
2. **Explainable Scoring**: Clear and digestible fit score cards (original vs. tailored fit) across skill coverage, responsibility alignment, keywords, and seniority.
3. **Actionable Gaps**: Pinpoint missing qualifications with direct evidence from the job description and custom career actions (without hallucinated experience).
4. **Safety & Entity Guardrails (Phase 4)**: A programmatic server-side claim engine that intercepts overstatements, checking for metric/leadership inflation, unrecognized technologies, unknown employers, fake academic credentials, and unearned certifications.
5. **Interactive Verification UI**: Highlights low/medium confidence or flagged bullets with premium banners requiring manual candidate confirmation before download gates unlock.
6. **Polished PDF Export (Phase 3)**: Pure-JS, lightning-fast rendering of dynamic Tailored Resumes and beautifully formatted side-by-side Comparison Reports containing full audit trails.
7. **Premium File Upload & Polish (Phase 5)**: Beautiful drag-and-drop file uploader supporting `.txt`, `.pdf`, and `.docx` files, complete with extraction progress bars, responsive shimmering skeleton loaders, and layout warning banners.

---

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your **Groq API key**:
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_api_key_goes_here
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

*Note: Without `GROQ_API_KEY`, the application automatically runs in **Mock Demo Mode** using pre-validated data and displaying a notice banner.*

4. **Validate Mock Data**:
   Ensure mock objects match Zod schemas:
   ```bash
   npm run validate-mocks
   ```

---

## Environment Variables

| Variable | Default Value | Required | Description |
|----------|---------------|----------|-------------|
| `GROQ_API_KEY` | - | For Live LLM | Your Groq API cloud service key |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | No | Overrides the default versatile LLM model |
| `MAX_UPLOAD_MB` | `5` | No | Limits maximum file upload size (default: 5MB) |

---

## Documentation

- **Demo Guide**: Check out the premium presentation guide at [docs/DEMO.md](./docs/DEMO.md) to run a 5-minute pitch in under 10 minutes.
- **Architectural Plan**: Aligned details inside [docs/implementation-plan.md](./docs/implementation-plan.md).
- **Edge-Case Checklists**: Located under [docs/edge-cases/](./docs/edge-cases/).

---

## Tech Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, Zod, and PDFKit.
