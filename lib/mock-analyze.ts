import {
  applyMockTailor,
  createMockTailoringRun,
} from "@/lib/mocks/tailoring-run";
import type { TailoringRun } from "@/lib/schemas";

export function runMockAnalyze(resumeText: string, jdText: string): TailoringRun {
  return createMockTailoringRun({
    rawResumeText: resumeText.trim(),
    rawJdText: jdText.trim(),
  });
}

export function runMockTailor(run: TailoringRun): TailoringRun {
  return applyMockTailor(run);
}
