import { buildBulletRewriterPrompt } from "@/prompts/bullet-rewriter";
import { completeAndParse } from "@/lib/llm/parse-json";
import {
  tailoredResumeSchema,
  type TailoredResume,
  type JobDescriptionProfile,
  type ResumeProfile,
  type GapAnalysis,
} from "@/lib/schemas";
import { runGuardrailsOnBullet } from "@/lib/guardrails/claim-detector";

export async function tailorResume(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  gapAnalysis: GapAnalysis
): Promise<TailoredResume> {
  const { system, user } = buildBulletRewriterPrompt(
    JSON.stringify(resume, null, 2),
    JSON.stringify(jobDescription, null, 2),
    JSON.stringify(gapAnalysis, null, 2)
  );

  const tailored = await completeAndParse(system, user, tailoredResumeSchema);

  // Apply programmatic safety guardrails post-processing
  for (const item of tailored.tailoredExperience) {
    for (const b of item.bullets) {
      const risks = runGuardrailsOnBullet(b.original, b.tailored, resume);
      if (risks.length > 0) {
        // Append all risk messages to the riskFlag property
        const riskMessage = risks.map((r) => r.message).join(" ");
        b.riskFlag = b.riskFlag ? `${b.riskFlag} ${riskMessage}`.trim() : riskMessage;

        // Downgrade confidence: High risk -> Low, Medium risk -> Medium
        const hasHighSeverity = risks.some((r) => r.severity === "high");
        const hasMediumSeverity = risks.some((r) => r.severity === "medium");

        if (hasHighSeverity) {
          b.confidence = "low";
        } else if (hasMediumSeverity && b.confidence !== "low") {
          b.confidence = "medium";
        }
      }
    }
  }

  return tailored;
}
