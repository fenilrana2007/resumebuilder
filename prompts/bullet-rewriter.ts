import { TRUTHFULNESS_PREAMBLE } from "@/prompts/_preamble";

export function buildBulletRewriterPrompt(
  resumeJson: string,
  jdJson: string,
  gapsJson: string
): { system: string; user: string } {
  return {
    system: `${TRUTHFULNESS_PREAMBLE}

Rewrite resume content to better align with the job description.

Return JSON:
{
  "tailoredSummary": string,
  "tailoredSkills": string[],
  "tailoredExperience": [{
    "company": string,
    "title": string,
    "bullets": [{
      "original": string,
      "tailored": string,
      "changeReason": string,
      "keywordsAddressed": string[],
      "confidence": "high" | "medium" | "low",
      "riskFlag": string
    }]
  }]
}

For each bullet: include original text exactly as in resume. If no truthful improvement, set tailored equal to original and explain. riskFlag only when overstatement risk exists.`,
    user: `Resume:\n${resumeJson}\n\nJob description:\n${jdJson}\n\nGaps to respect (do not invent to fill):\n${gapsJson}`,
  };
}
