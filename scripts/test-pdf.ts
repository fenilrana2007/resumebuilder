import fs from "fs";
import path from "path";

// Standard sample texts for testing
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

async function testPdfExport() {
  console.log("=== Starting End-to-End API Integration & PDF Export Test ===");
  const baseUrl = "http://localhost:3000";

  try {
    // 1. Trigger /api/analyze
    console.log("\n1. Triggering /api/analyze...");
    const analyzeRes = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: sampleResume,
        jdText: sampleJd
      })
    });

    if (!analyzeRes.ok) {
      throw new Error(`Analyze endpoint failed (${analyzeRes.status}): ${await analyzeRes.text()}`);
    }

    const { run: run1, usedMock: mock1 } = await analyzeRes.json() as any;
    console.log(`\u2714 Analyze successful! Run ID: ${run1.id}`);
    console.log(`  - Original Match Score: ${run1.originalMatch.overallScore}%`);
    console.log(`  - Mock Mode fallback: ${mock1}`);

    // 2. Trigger /api/tailor
    console.log("\n2. Triggering /api/tailor...");
    const tailorRes = await fetch(`${baseUrl}/api/tailor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: run1.id })
    });

    if (!tailorRes.ok) {
      throw new Error(`Tailor endpoint failed (${tailorRes.status}): ${await tailorRes.text()}`);
    }

    const { run: run2, usedMock: mock2 } = await tailorRes.json() as any;
    console.log(`\u2714 Tailoring successful! Status: ${run2.status}`);
    docMatchScore(run2);

    // 3. Export Comparison PDF
    console.log("\n3. Exporting Comparison Report PDF...");
    const exportCompRes = await fetch(`${baseUrl}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: run2.id, type: "comparison" })
    });

    if (!exportCompRes.ok) {
      throw new Error(`Export comparison failed (${exportCompRes.status}): ${await exportCompRes.text()}`);
    }

    const compBuffer = Buffer.from(await exportCompRes.arrayBuffer());
    const compPath = path.join(process.cwd(), "comparison-report-test.pdf");
    fs.writeFileSync(compPath, compBuffer);
    console.log(`\u2714 Comparison report PDF saved to: ${compPath}`);
    console.log(`  - Size: ${compBuffer.length} bytes`);

    // 4. Export Tailored Resume PDF
    console.log("\n4. Exporting Tailored Resume PDF...");
    const exportTailoredRes = await fetch(`${baseUrl}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: run2.id, type: "tailored" })
    });

    if (!exportTailoredRes.ok) {
      throw new Error(`Export tailored resume failed (${exportTailoredRes.status}): ${await exportTailoredRes.text()}`);
    }

    const tailoredBuffer = Buffer.from(await exportTailoredRes.arrayBuffer());
    const tailoredPath = path.join(process.cwd(), "tailored-resume-test.pdf");
    fs.writeFileSync(tailoredPath, tailoredBuffer);
    console.log(`\u2714 Tailored resume PDF saved to: ${tailoredPath}`);
    console.log(`  - Size: ${tailoredBuffer.length} bytes`);

    console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
    console.log("PDF files are successfully generated on your Desktop workspace.");

  } catch (err) {
    console.error("\n\u274c Test failed with error:");
    console.error(err);
    process.exit(1);
  }
}

function docMatchScore(run: any) {
  console.log(`  - Tailored Match Score: ${run.tailoredMatch.overallScore}%`);
  console.log(`  - Bullets tailored count: ${run.tailoredResume.tailoredExperience.reduce((acc: number, val: any) => acc + val.bullets.length, 0)}`);
}

void testPdfExport();
