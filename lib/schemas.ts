import { z } from "zod";

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export const gapImportanceSchema = z.enum(["high", "medium", "low"]);
export const tailoringStatusSchema = z.enum([
  "draft",
  "analyzed",
  "tailored",
  "exported",
]);

export const resumeProfileSchema = z.object({
  contact: z.record(z.string()).default({}),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(
    z.object({
      company: z.string().default(""),
      title: z.string().default(""),
      startDate: z.string().default(""),
      endDate: z.string().default(""),
      bullets: z.array(z.string()).default([]),
    })
  ).default([]),
  projects: z.array(
    z.object({
      name: z.string().default(""),
      bullets: z.array(z.string()).default([]),
      technologies: z.array(z.string()).default([]).optional(),
    })
  ).default([]),
  education: z.array(
    z.object({
      institution: z.string().default(""),
      degree: z.string().default(""),
      dates: z.string().default("").optional(),
    })
  ).default([]),
  certifications: z.array(z.string()).default([]),
});




export const jobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  tools: z.array(z.string()),
  keywords: z.array(z.string()),
  seniorityLevel: z.string(),
  domainSignals: z.array(z.string()),
});

export const matchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()),
  explanation: z.string().min(1),
});

export const tailoredBulletSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()),
  confidence: confidenceSchema,
  riskFlag: z.string(),
});

export const tailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()),
  tailoredExperience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      bullets: z.array(tailoredBulletSchema),
    })
  ),
});

export const resumeGapSchema = z.object({
  name: z.string(),
  importance: gapImportanceSchema,
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const gapAnalysisSchema = z.object({
  gaps: z.array(resumeGapSchema),
});

export const tailoringRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  status: tailoringStatusSchema,
  rawResumeText: z.string(),
  rawJdText: z.string(),
  resume: resumeProfileSchema.optional(),
  jobDescription: jobDescriptionProfileSchema.optional(),
  originalMatch: matchScoreSchema.optional(),
  tailoredMatch: matchScoreSchema.optional(),
  tailoredResume: tailoredResumeSchema.optional(),
  gapAnalysis: gapAnalysisSchema.optional(),
  userConfirmations: z.record(z.string(), z.boolean()).optional(),
});

export type ResumeProfile = z.infer<typeof resumeProfileSchema>;
export type JobDescriptionProfile = z.infer<typeof jobDescriptionProfileSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;
export type TailoredBullet = z.infer<typeof tailoredBulletSchema>;
export type TailoredResume = z.infer<typeof tailoredResumeSchema>;
export type ResumeGap = z.infer<typeof resumeGapSchema>;
export type GapAnalysis = z.infer<typeof gapAnalysisSchema>;
export type TailoringRun = z.infer<typeof tailoringRunSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
