import fs from "fs";
import path from "path";
import { analyzeResumeAndJd, tailorRun } from "../services/orchestrator";
import { generateComparisonPdf, generateTailoredResumePdf } from "../lib/pdf/generator";

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
  console.log("=== Standalone Direct PDF Generation Test ===");
  console.log("GROQ_API_KEY present in process.env:", Boolean(process.env.GROQ_API_KEY));
  console.log("LLM_MODEL present in process.env:", process.env.LLM_MODEL);

  try {
    // 1. Run Analyze
    console.log("\n1. Running analyzeResumeAndJd...");
    const { run: run1, usedMock: mock1 } = await analyzeResumeAndJd(sampleResume, sampleJd);
    console.log(`\u2714 Analyze succeeded! Run ID: ${run1.id}`);
    console.log(`  - Original Match Score: ${run1.originalMatch?.overallScore}%`);
    console.log(`  - Mock Mode fallback: ${mock1}`);

    // 2. Run Tailor
    console.log("\n2. Running tailorRun...");
    const { run: run2, usedMock: mock2 } = await tailorRun(run1.id);
    console.log(`\u2714 Tailor succeeded!`);
    console.log(`  - Tailored Match Score: ${run2.tailoredMatch?.overallScore}%`);
    console.log(`  - Mock Mode fallback: ${mock2}`);

    // 3. Generate Comparison PDF
    console.log("\n3. Generating Comparison PDF Report...");
    const compBuffer = await generateComparisonPdf(run2);
    const compPath = path.join(process.cwd(), "comparison-report-direct.pdf");
    fs.writeFileSync(compPath, compBuffer);
    console.log(`\u2714 Comparison PDF successfully generated and saved!`);
    console.log(`  - Path: ${compPath}`);
    console.log(`  - Size: ${compBuffer.length} bytes`);

    // 4. Generate Tailored Resume PDF
    console.log("\n4. Generating Tailored Resume PDF...");
    const resumeBuffer = await generateTailoredResumePdf(run2);
    const resumePath = path.join(process.cwd(), "tailored-resume-direct.pdf");
    fs.writeFileSync(resumePath, resumeBuffer);
    console.log(`\u2714 Tailored Resume PDF successfully generated and saved!`);
    console.log(`  - Path: ${resumePath}`);
    console.log(`  - Size: ${resumeBuffer.length} bytes`);

    console.log("\n=== ALL STANDALONE PDF TESTS PASSED SUCCESSFULLY! ===");

  } catch (err) {
    console.error("\n\u274c Test failed with error:");
    console.error(err);
    process.exit(1);
  }
}

void main();
