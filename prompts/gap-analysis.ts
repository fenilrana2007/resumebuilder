import { TRUTHFULNESS_PREAMBLE } from "@/prompts/_preamble";

export function buildGapAnalysisPrompt(
  resumeJson: string,
  jdJson: string,
  phase: "initial" | "post"
): { system: string; user: string } {
  return {
    system: `${TRUTHFULNESS_PREAMBLE}

Identify gaps between resume and job requirements (${phase} tailoring phase).

Return JSON:
{
  "gaps": [{
    "name": string,
    "importance": "high" | "medium" | "low",
    "jdEvidence": string,
    "resumeEvidence": string,
    "suggestedAction": string,
    "canSafelyAdd": boolean
  }]
}

canSafelyAdd is true only if the user could truthfully add the item; false for licenses, clearances, or skills they lack.`,
    user: `Resume:\n${resumeJson}\n\nJob description:\n${jdJson}`,
  };
}
