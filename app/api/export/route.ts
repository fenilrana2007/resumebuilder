import { NextResponse } from "next/server";
import { getServerRun, saveServerRun } from "@/lib/run-store";
import { generateComparisonPdf, generateTailoredResumePdf } from "@/lib/pdf/generator";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { runId, type, userConfirmations } = await request.json() as {
      runId: string;
      type: "comparison" | "tailored" | "both";
      userConfirmations?: Record<string, boolean>;
    };

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    if (!type || !["comparison", "tailored", "both"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    const run = getServerRun(runId);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    if (run.status !== "tailored" && run.status !== "exported") {
      return NextResponse.json({ error: "Complete tailoring first" }, { status: 400 });
    }

    // Server-side validation of truthfulness confirmations
    if (run.tailoredResume) {
      const requiredConfirmations: string[] = [];
      run.tailoredResume.tailoredExperience.forEach((role) => {
        role.bullets.forEach((bullet, idx) => {
          const isLowOrMed = bullet.confidence === "low" || bullet.confidence === "medium";
          const hasRisk = !!bullet.riskFlag;
          if (isLowOrMed || hasRisk) {
            requiredConfirmations.push(`${role.company}-${role.title}-${idx}`);
          }
        });
      });

      const unconfirmed = requiredConfirmations.filter(
        (key) => !userConfirmations?.[key]
      );

      if (unconfirmed.length > 0) {
        return NextResponse.json(
          { error: `Cannot export: ${unconfirmed.length} high-risk or medium/low confidence bullet(s) require manual confirmation.` },
          { status: 400 }
        );
      }
    }


    let pdfBuffer: Buffer;
    let filename: string;

    const jobSlug = run.jobDescription?.jobTitle
      ? run.jobDescription.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "job";
    const companySlug = run.jobDescription?.company
      ? run.jobDescription.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "company";

    if (type === "tailored") {
      pdfBuffer = await generateTailoredResumePdf(run);
      filename = `tailored-resume-${companySlug}-${jobSlug}.pdf`;
    } else {
      // both or comparison returns the full side-by-side comparison report
      pdfBuffer = await generateComparisonPdf(run);
      filename = `comparison-report-${companySlug}-${jobSlug}.pdf`;
    }

    // Mark status as exported
    run.status = "exported";
    saveServerRun(run);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Export PDF error", err);
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
