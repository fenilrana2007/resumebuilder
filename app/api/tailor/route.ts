import { NextResponse } from "next/server";
import { z } from "zod";
import { LlmError } from "@/lib/llm/client";
import { tailorRun } from "@/services/orchestrator";

export const maxDuration = 120;

const bodySchema = z.object({
  runId: z.string().min(1, "runId is required"),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
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
      return NextResponse.json({ error: err.message }, { status: 404 });
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
