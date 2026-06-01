import type { ResumeProfile } from "@/lib/schemas";

export const sampleResumeText = `Alex Rivera
alex.rivera@email.com | github.com/arivera | Portland, OR

SUMMARY
Full-stack developer with 3 years building React and Node.js applications for B2B SaaS products.

SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL, REST APIs, Git, Jest, Agile

EXPERIENCE
TechFlow Inc — Software Engineer | Jan 2022 – Present
- Built customer dashboard features in React used by 2,000+ monthly active users
- Developed REST APIs in Node.js and Express for billing and reporting modules
- Improved API response times by 30% through query optimization and caching
- Collaborated with product and QA in two-week sprint cycles

BrightStart Labs — Junior Developer | Jun 2020 – Dec 2021
- Fixed bugs and shipped small UI improvements for an internal admin tool
- Wrote unit tests with Jest for critical checkout flows

PROJECTS
Portfolio Tracker — Personal
- Created a React app with charting for mock investment data using public APIs

EDUCATION
State University — B.S. Computer Science | 2020

CERTIFICATIONS
AWS Cloud Practitioner`;

export const sampleResumeProfile: ResumeProfile = {
  contact: {
    name: "Alex Rivera",
    email: "alex.rivera@email.com",
    location: "Portland, OR",
    github: "github.com/arivera",
  },
  summary:
    "Full-stack developer with 3 years building React and Node.js applications for B2B SaaS products.",
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "REST APIs",
    "Git",
    "Jest",
    "Agile",
  ],
  experience: [
    {
      company: "TechFlow Inc",
      title: "Software Engineer",
      startDate: "Jan 2022",
      endDate: "Present",
      bullets: [
        "Built customer dashboard features in React used by 2,000+ monthly active users",
        "Developed REST APIs in Node.js and Express for billing and reporting modules",
        "Improved API response times by 30% through query optimization and caching",
        "Collaborated with product and QA in two-week sprint cycles",
      ],
    },
    {
      company: "BrightStart Labs",
      title: "Junior Developer",
      startDate: "Jun 2020",
      endDate: "Dec 2021",
      bullets: [
        "Fixed bugs and shipped small UI improvements for an internal admin tool",
        "Wrote unit tests with Jest for critical checkout flows",
      ],
    },
  ],
  projects: [
    {
      name: "Portfolio Tracker",
      bullets: [
        "Created a React app with charting for mock investment data using public APIs",
      ],
      technologies: ["React"],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. Computer Science",
      dates: "2020",
    },
  ],
  certifications: ["AWS Cloud Practitioner"],
};
