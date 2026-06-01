import { buildJdExtractionPrompt } from "@/prompts/jd-extraction";
import { completeAndParse } from "@/lib/llm/parse-json";
import {
  jobDescriptionProfileSchema,
  type JobDescriptionProfile,
} from "@/lib/schemas";

export async function parseJobDescription(
  jdText: string
): Promise<JobDescriptionProfile> {
  const { system, user } = buildJdExtractionPrompt(jdText);
  return completeAndParse(system, user, jobDescriptionProfileSchema);
}
