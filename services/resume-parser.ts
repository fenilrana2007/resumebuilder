import { buildResumeParserPrompt } from "@/prompts/resume-parser";
import { completeAndParse } from "@/lib/llm/parse-json";
import { resumeProfileSchema, type ResumeProfile } from "@/lib/schemas";

export async function parseResume(resumeText: string): Promise<ResumeProfile> {
  const { system, user } = buildResumeParserPrompt(resumeText);
  return completeAndParse(system, user, resumeProfileSchema) as Promise<ResumeProfile>;
}

