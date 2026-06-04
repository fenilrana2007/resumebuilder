import { NextResponse } from "next/server";
import { z } from "zod";
import { LlmError } from "@/lib/llm/client";
import { tailorRun } from "@/services/orchestrator";
import { tailoringRunSchema } from "@/lib/schemas";
import { saveServerRun } from "@/lib/run-store";

export const maxDuration = 120;

const bodySchema = z.object({
  runId: z.string().min(1, "runId is required"),
  runData: z.unknown().optional(), // full run object passed from client for stateless/serverless environments
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    
    // If client sent the full run data, save it to memory so tailorRun can find it
    if (body.runData) {
      try {
        const run = tailoringRunSchema.parse(body.runData);
        saveServerRun(run);
      } catch {
        // Ignore parse errors, tailorRun will handle missing run
      }
    }

    const { run, usedMock } = await tailorRun(body.runId);
    return NextResponse.json({ run, usedMock });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "Run not found") {
      return NextResponse.json({ error: "Run not found. Please re-analyze your resume." }, { status: 404 });
    }
    if (err instanceof LlmError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status ?? 502 }
      );
    }
    console.error("tailor error", err);
    return NextResponse.json(
      { error: "Tailoring failed. Please try again." },
      { status: 500 }
    );
  }
}

