import { buildGapAnalysisPrompt } from "@/prompts/gap-analysis";
import { completeAndParse } from "@/lib/llm/parse-json";
import {
  gapAnalysisSchema,
  type GapAnalysis,
  type JobDescriptionProfile,
  type ResumeProfile,
} from "@/lib/schemas";

export async function analyzeGaps(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  phase: "initial" | "post"
): Promise<GapAnalysis> {
  const { system, user } = buildGapAnalysisPrompt(
    JSON.stringify(resume, null, 2),
    JSON.stringify(jobDescription, null, 2),
    phase
  );
  return completeAndParse(system, user, gapAnalysisSchema);
}
