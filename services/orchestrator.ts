import { isLlmConfigured } from "@/lib/llm/client";
import { runMockAnalyze, runMockTailor } from "@/lib/mock-analyze";
import { saveServerRun, getServerRun } from "@/lib/run-store";
import type { TailoringRun } from "@/lib/schemas";
import { parseJobDescription } from "@/services/jd-parser";
import { parseResume } from "@/services/resume-parser";
import { scoreMatch } from "@/services/match-engine";
import { analyzeGaps } from "@/services/gap-engine";
import { tailorResume } from "@/services/tailoring-engine";

function newRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `run-${Date.now()}`;
}

export async function analyzeResumeAndJd(
  resumeText: string,
  jdText: string
): Promise<{ run: TailoringRun; usedMock: boolean }> {
  const trimmedResume = resumeText.trim();
  const trimmedJd = jdText.trim();

  if (!isLlmConfigured()) {
    const run = runMockAnalyze(trimmedResume, trimmedJd);
    saveServerRun(run);
    return { run, usedMock: true };
  }

  const [resume, jobDescription] = await Promise.all([
    parseResume(trimmedResume),
    parseJobDescription(trimmedJd),
  ]);

  const originalMatch = await scoreMatch(resume, jobDescription, "original");
  const gapAnalysis = await analyzeGaps(resume, jobDescription, "initial");

  const run: TailoringRun = {
    id: newRunId(),
    createdAt: new Date().toISOString(),
    status: "analyzed",
    rawResumeText: trimmedResume,
    rawJdText: trimmedJd,
    resume,
    jobDescription,
    originalMatch,
    gapAnalysis,
  };

  saveServerRun(run);
  return { run, usedMock: false };
}

export async function tailorRun(runId: string): Promise<{
  run: TailoringRun;
  usedMock: boolean;
}> {
  const existing = getServerRun(runId);
  if (!existing) {
    throw new Error("Run not found");
  }
  if (!existing.resume || !existing.jobDescription || !existing.gapAnalysis) {
    throw new Error("Run is missing parsed data or gap analysis");
  }


  if (!isLlmConfigured()) {
    const run = runMockTailor(existing);
    saveServerRun(run);
    return { run, usedMock: true };
  }

  const tailoredResume = await tailorResume(
    existing.resume,
    existing.jobDescription,
    existing.gapAnalysis
  );

  const tailoredMatch = await scoreMatch(
    existing.resume,
    existing.jobDescription,
    "tailored",
    tailoredResume
  );

  const gapAnalysis = await analyzeGaps(
    existing.resume,
    existing.jobDescription,
    "post"
  );

  const run: TailoringRun = {
    ...existing,
    status: "tailored",
    tailoredResume,
    tailoredMatch,
    gapAnalysis,
  };

  saveServerRun(run);
  return { run, usedMock: false };
}
