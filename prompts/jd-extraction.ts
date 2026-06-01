import { TRUTHFULNESS_PREAMBLE } from "@/prompts/_preamble";

export function buildJdExtractionPrompt(jdText: string): {
  system: string;
  user: string;
} {
  return {
    system: `${TRUTHFULNESS_PREAMBLE}

Extract a structured job description profile from the posting text.

Return JSON matching this shape:
{
  "jobTitle": string,
  "company": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "tools": string[],
  "keywords": string[],
  "seniorityLevel": string,
  "domainSignals": string[]
}`,
    user: `Job description:\n\n${jdText}`,
  };
}
