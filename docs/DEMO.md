# Resume Shapeshifter — Premium Presentation Script (Demo Guide)

This document provides a highly polished, step-by-step walkthrough to run a live or offline demonstration of **Resume Shapeshifter** in under 10 minutes.

---

## 1. Quick Setup (< 3 minutes)

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd cursor-p2
   npm install
   ```

2. **Configure API Key (For Live Mode)**:
   Create a `.env.local` file in the root of the project:
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_api_key_goes_here
   ```
   *Note: If no API key is present, the application automatically runs in **Mock Demo Mode** with pre-baked high-quality SWE scenarios so the presentation never crashes.*

3. **Start the Application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Interactive Demo Flow (5-Minute Script)

### Step 1: The Landing & Drag-and-Drop Upload
1. **Value Prop Introduction**:
   Explain the goal: candidates tailoring resumes manually often make mistakes, hallucinate metrics, or lose hours. Resume Shapeshifter automates alignment while **strictly policing truthfulness** and offering full audit logs.
2. **Interactive Drag-and-Drop**:
   - Highlight the **Resume Source** upload zone.
   - Drag and drop a `.txt` resume file, or select a `.pdf`/`.docx` file.
   - Show off the **animated extraction progress bar**.
   - Note the **parsing layout warning banner** that warns users to review extracted fields: this prevents blind trust in binary parser outputs.
3. **One-Click Loading**:
   Click the secondary button: **"Load sample resume & JD"** to populate a realistic Senior React Developer resume and a Frontend Engineer Job Description.

---

### Step 2: The Alignment Assessment & Gaps
1. Click the **"Analyze"** button.
2. Review the **ScoreCard** showing the candidate's initial fit (Overall: **62**). 
3. Scroll through the **extracted JD summary** (tools, keywords, and seniority level) and walk the audience through the **Actionable Gap Analysis**. Point out that it flags "Next.js" as a gap and gives realistic, non-fabricated tips (e.g. *Transferable React patterns* rather than claiming fake Next.js experience).

---

### Step 3: Triggering Tailoring (Shimmer State)
1. Click **"Generate tailored resume"**.
2. Point out the **premium shimmer skeleton loader** that mimics the layout of the tailored bullet rows. This keeps the user engaged during the AI completion and programmatic guardrail evaluation.

---

### Step 4: Programmatic Guardrails & Manual Review
1. Once tailoring finishes, point out the new tailored match score (**81**, an increase of **+19**).
2. Scroll to the **Side-by-Side Review** grid:
   - Point out the **"Changed"** and **"Unchanged"** badges.
   - Point out the **"low" or "medium" confidence** warning badges and **"Review Flag"** warning boxes.
   - Expand a flagged bullet (e.g., bullet #3 under TechFlow Inc) to reveal the programmatic **Guardrail Warning** alerting the candidate of potential metric overstatement (*"Confirm dashboard traffic qualifies as high-traffic context"*).
3. **Interactive Verification Checklist**:
   - Scroll to the bottom and show that the **PDF Export buttons are locked** because there are unconfirmed bullets.
   - Check the box inside the flagged bullet rows. Watch the banner turn into a beautiful emerald **"Verified Accurate"** badge! Notice the active warning count in the export gate decreases.

---

### Step 5: Secured Export
1. Show that the export button is still locked until the candidate checks the legal **Truthfulness Acknowledgment** checkbox.
2. Check the **Truthfulness Acknowledgment** checkbox. The export buttons dynamically light up!
3. Click **"Export comparison PDF"** to stream down the complete side-by-side proof report, showing all keyword coverage, change rationales, and the truthfulness audit.

---

## 3. Supported Quality Guidelines (§14 Compliance)

| Heuristic | Checked Behavior |
|-----------|------------------|
| **Truthfulness** | Prompts forbid inventing degrees/skills, and the server-side claim engines catch metrics/seniority overstatements. |
| **Explainable Gaps** | Every gap analysis provides exact JD evidence and a realistic candidate career action. |
| **Audit Trails** | Exported PDF reports list the exact change reason and keyword alignment for every rewritten bullet. |
