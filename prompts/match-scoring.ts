import { TRUTHFULNESS_PREAMBLE } from "@/prompts/_preamble";

export function buildMatchScoringPrompt(
  resumeJson: string,
  jdJson: string,
  label: "original" | "tailored"
): { system: string; user: string } {
  return {
    system: `${TRUTHFULNESS_PREAMBLE}

Score how well the ${label} resume aligns with the job description (0-100 each dimension).

Return JSON:
{
  "overallScore": number,
  "skillCoverageScore": number,
  "responsibilityAlignmentScore": number,
  "keywordScore": number,
  "seniorityScore": number,
  "criticalMissingRequirements": string[],
  "explanation": string
}

The explanation must be 2-4 sentences, honest, and not claim ATS guarantees.`,
    user: `Resume (${label}):\n${resumeJson}\n\nJob description:\n${jdJson}`,
  };
}
