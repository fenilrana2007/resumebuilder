import type { JobDescriptionProfile } from "@/lib/schemas";

export const sampleJdText = `Frontend Engineer — NovaCommerce
Portland, OR (Hybrid)

About NovaCommerce
We build checkout and merchant tools for mid-market e-commerce brands.

Responsibilities
- Build and maintain customer-facing features in React and TypeScript
- Partner with backend engineers on RESTful API design and integration
- Improve web performance and accessibility for high-traffic pages
- Participate in code reviews and agile ceremonies
- Write unit and integration tests for critical user flows

Requirements
- 2+ years professional experience with React and modern JavaScript
- Strong TypeScript skills
- Experience consuming REST APIs
- Familiarity with PostgreSQL or similar relational databases
- Git workflow and collaborative development

Preferred
- Next.js or similar meta-framework experience
- Experience with e-commerce or payments domains
- Jest or React Testing Library
- CI/CD exposure (GitHub Actions)

Seniority: Mid-level individual contributor`;

export const sampleJobDescription: JobDescriptionProfile = {
  jobTitle: "Frontend Engineer",
  company: "NovaCommerce",
  requiredSkills: [
    "React",
    "TypeScript",
    "JavaScript",
    "REST APIs",
    "PostgreSQL",
    "Git",
  ],
  preferredSkills: [
    "Next.js",
    "E-commerce",
    "Jest",
    "React Testing Library",
    "CI/CD",
    "GitHub Actions",
  ],
  responsibilities: [
    "Build and maintain customer-facing features in React and TypeScript",
    "Partner with backend engineers on RESTful API design and integration",
    "Improve web performance and accessibility for high-traffic pages",
    "Participate in code reviews and agile ceremonies",
    "Write unit and integration tests for critical user flows",
  ],
  qualifications: [
    "2+ years professional experience with React and modern JavaScript",
    "Strong TypeScript skills",
    "Experience consuming REST APIs",
    "Familiarity with PostgreSQL or similar relational databases",
  ],
  tools: ["React", "TypeScript", "REST", "PostgreSQL", "Git", "Jest"],
  keywords: [
    "frontend",
    "React",
    "TypeScript",
    "REST",
    "accessibility",
    "performance",
    "agile",
  ],
  seniorityLevel: "Mid-level individual contributor",
  domainSignals: ["e-commerce", "checkout", "merchant tools", "B2B SaaS"],
};
