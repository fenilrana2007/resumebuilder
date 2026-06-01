import { TRUTHFULNESS_PREAMBLE } from "@/prompts/_preamble";

export function buildResumeParserPrompt(resumeText: string): {
  system: string;
  user: string;
} {
  return {
    system: `${TRUTHFULNESS_PREAMBLE}

Parse the resume into structured JSON. Do not add information not present in the text.

Return JSON:
{
  "contact": { "name": "", "email": "", ... },
  "summary": string,
  "skills": string[],
  "experience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "bullets": string[] }],
  "projects": [{ "name": "", "bullets": string[], "technologies": string[] }],
  "education": [{ "institution": "", "degree": "", "dates": string }],
  "certifications": string[]
}`,
    user: `Resume text:\n\n${resumeText}`,
  };
}
