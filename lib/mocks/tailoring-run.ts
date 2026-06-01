import type { TailoringRun } from "@/lib/schemas";
import { sampleJobDescription, sampleJdText } from "@/lib/mocks/sample-jd";
import {
  sampleResumeProfile,
  sampleResumeText,
} from "@/lib/mocks/sample-resume";

export const mockOriginalMatch = {
  overallScore: 62,
  skillCoverageScore: 58,
  responsibilityAlignmentScore: 65,
  keywordScore: 55,
  seniorityScore: 70,
  criticalMissingRequirements: [
    "Next.js or meta-framework experience",
    "Explicit accessibility improvements on production pages",
  ],
  explanation:
    "Strong overlap on React, TypeScript, and REST API work. Gaps include Next.js (preferred), e-commerce domain signals, and limited explicit accessibility language in bullets.",
};

export const mockTailoredMatch = {
  overallScore: 81,
  skillCoverageScore: 78,
  responsibilityAlignmentScore: 85,
  keywordScore: 80,
  seniorityScore: 72,
  criticalMissingRequirements: ["Next.js production experience"],
  explanation:
    "Rewrites surface JD-aligned terms (TypeScript, REST integration, performance, testing) using existing TechFlow experience. Next.js remains a honest gap.",
};

export const mockGapAnalysis = {
  gaps: [
    {
      name: "Next.js",
      importance: "medium" as const,
      jdEvidence: "Preferred: Next.js or similar meta-framework experience",
      resumeEvidence: "Resume lists React but not Next.js",
      suggestedAction:
        "Mention in skills if you have tutorial or side-project exposure; otherwise prepare to discuss transferable React patterns.",
      canSafelyAdd: false,
    },
    {
      name: "E-commerce domain",
      importance: "medium" as const,
      jdEvidence: "Preferred: e-commerce or payments domains",
      resumeEvidence: "B2B SaaS experience only",
      suggestedAction:
        "Emphasize transferable checkout/billing modules if accurate; do not claim retail e-commerce unless true.",
      canSafelyAdd: false,
    },
    {
      name: "Accessibility",
      importance: "low" as const,
      jdEvidence: "Improve web performance and accessibility for high-traffic pages",
      resumeEvidence: "Not explicitly mentioned in bullets",
      suggestedAction:
        "Add a bullet only if you have real a11y work (audits, WCAG fixes, semantic HTML).",
      canSafelyAdd: false,
    },
  ],
};

export const mockTailoredResume = {
  tailoredSummary:
    "Full-stack developer with 3 years delivering React and TypeScript features for B2B SaaS, with REST API integration, performance improvements, and test coverage for production user flows.",
  tailoredSkills: [
    "TypeScript",
    "React",
    "JavaScript",
    "Node.js",
    "REST APIs",
    "PostgreSQL",
    "Jest",
    "Git",
    "Agile",
  ],
  tailoredExperience: [
    {
      company: "TechFlow Inc",
      title: "Software Engineer",
      bullets: [
        {
          original:
            "Built customer dashboard features in React used by 2,000+ monthly active users",
          tailored:
            "Engineered customer-facing dashboard features in React and TypeScript for 2,000+ monthly active users",
          changeReason:
            "Adds TypeScript and customer-facing language from the JD without changing scope.",
          keywordsAddressed: ["React", "TypeScript", "customer-facing"],
          confidence: "high" as const,
          riskFlag: "",
        },
        {
          original:
            "Developed REST APIs in Node.js and Express for billing and reporting modules",
          tailored:
            "Developed and integrated RESTful APIs in Node.js for billing and reporting modules used by frontend dashboards",
          changeReason:
            "Highlights REST integration between frontend and backend per JD responsibilities.",
          keywordsAddressed: ["REST", "integration"],
          confidence: "high" as const,
          riskFlag: "",
        },
        {
          original:
            "Improved API response times by 30% through query optimization and caching",
          tailored:
            "Improved API response times by 30% through query optimization and caching, supporting faster page loads for high-traffic dashboard views",
          changeReason:
            "Connects backend performance work to web performance theme in the JD.",
          keywordsAddressed: ["performance", "high-traffic"],
          confidence: "medium" as const,
          riskFlag: "Confirm dashboard traffic qualifies as high-traffic context.",
        },
        {
          original:
            "Collaborated with product and QA in two-week sprint cycles",
          tailored:
            "Collaborated with product and QA in agile two-week sprint cycles including code reviews",
          changeReason: "Mirrors agile and code review expectations from the JD.",
          keywordsAddressed: ["agile", "code reviews"],
          confidence: "high" as const,
          riskFlag: "",
        },
      ],
    },
    {
      company: "BrightStart Labs",
      title: "Junior Developer",
      bullets: [
        {
          original:
            "Wrote unit tests with Jest for critical checkout flows",
          tailored:
            "Wrote unit tests with Jest for critical checkout flows in the admin application",
          changeReason:
            "Keeps Jest and checkout wording; clarifies context without inventing e-commerce scale.",
          keywordsAddressed: ["Jest", "testing", "checkout"],
          confidence: "high" as const,
          riskFlag: "",
        },
        {
          original:
            "Fixed bugs and shipped small UI improvements for an internal admin tool",
          tailored:
            "Fixed bugs and shipped small UI improvements for an internal admin tool",
          changeReason: "Already aligned; no change needed.",
          keywordsAddressed: [],
          confidence: "high" as const,
          riskFlag: "",
        },
      ],
    },
  ],
};

export function createMockTailoringRun(
  overrides: Partial<Pick<TailoringRun, "rawResumeText" | "rawJdText">> = {}
): TailoringRun {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `run-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "analyzed",
    rawResumeText: overrides.rawResumeText ?? sampleResumeText,
    rawJdText: overrides.rawJdText ?? sampleJdText,
    resume: sampleResumeProfile,
    jobDescription: sampleJobDescription,
    originalMatch: mockOriginalMatch,
    gapAnalysis: mockGapAnalysis,
  };
}

export function applyMockTailor(run: TailoringRun): TailoringRun {
  return {
    ...run,
    status: "tailored",
    tailoredResume: mockTailoredResume,
    tailoredMatch: mockTailoredMatch,
  };
}
