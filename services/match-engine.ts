import { buildMatchScoringPrompt } from "@/prompts/match-scoring";
import { completeAndParse } from "@/lib/llm/parse-json";
import {
  matchScoreSchema,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeProfile,
  type TailoredResume,
} from "@/lib/schemas";

function resumeForScoring(
  resume: ResumeProfile,
  tailored?: TailoredResume
): ResumeProfile {
  if (!tailored) return resume;

  return {
    ...resume,
    summary: tailored.tailoredSummary || resume.summary,
    skills:
      tailored.tailoredSkills.length > 0
        ? tailored.tailoredSkills
        : resume.skills,
    experience: resume.experience.map((exp) => {
      const tailoredExp = tailored.tailoredExperience.find(
        (t) => t.company === exp.company && t.title === exp.title
      );
      return {
        ...exp,
        bullets: tailoredExp
          ? tailoredExp.bullets.map((b) => b.tailored)
          : exp.bullets,
      };
    }),
  };
}

export async function scoreMatch(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  mode: "original" | "tailored",
  tailored?: TailoredResume
): Promise<MatchScore> {
  const resumePayload = resumeForScoring(resume, mode === "tailored" ? tailored : undefined);
  const { system, user } = buildMatchScoringPrompt(
    JSON.stringify(resumePayload, null, 2),
    JSON.stringify(jobDescription, null, 2),
    mode
  );
  return completeAndParse(system, user, matchScoreSchema);
}
