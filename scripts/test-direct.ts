import { analyzeResumeAndJd } from "../services/orchestrator";

const sampleResume = `
Jane Doe
jane.doe@email.com | 555-0199 | San Francisco, CA
linkedin.com/in/janedoe | github.com/janedoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3 years of experience specializing in React, TypeScript, and front-end performance optimization. Delivered core SaaS products matching design systems.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, HTML, CSS, SQL
Frameworks/Libraries: React, Redux, Node.js, Express, Jest
Tools: Git, PostgreSQL, Docker, Webpack

PROFESSIONAL EXPERIENCE
Software Engineer | TechFlow Inc | Jan 2023 - Present
• Built customer dashboard features in React used by 2,000+ monthly active users.
• Developed REST APIs in Node.js and Express for billing and reporting modules.
• Improved API response times by 30% through query optimization and caching.
• Collaborated with product and QA in two-week sprint cycles.

Junior Developer | BrightStart Labs | Jun 2021 - Dec 2022
• Wrote unit tests with Jest for critical checkout flows.
• Fixed bugs and shipped small UI improvements for an internal admin tool.
`;

const sampleJd = `
Software Engineer - Frontend
Acme SaaS corp is looking for a frontend developer.

Responsibilities:
- Engineer high-quality web applications using React and TypeScript.
- Implement responsive designs and web performance optimizations.
- Integrate RESTful APIs and collaborate in an agile environment.
- Conduct testing using Jest and carry out code reviews.
`;

async function main() {
  console.log("=== Direct Server-side Function Test ===");
  console.log("GROQ_API_KEY present in process.env:", Boolean(process.env.GROQ_API_KEY));
  console.log("LLM_MODEL present in process.env:", process.env.LLM_MODEL);
  
  try {
    const res = await analyzeResumeAndJd(sampleResume, sampleJd);
    console.log("Analyze succeeded directly!");
    console.log("Run ID:", res.run.id);
  } catch (err) {
    console.error("Direct function call failed with error:");
    console.error(err);
  }
}

void main();
