import { NextResponse } from "next/server";
import { z } from "zod";
import { LlmError } from "@/lib/llm/client";
import { analyzeResumeAndJd } from "@/services/orchestrator";

export const maxDuration = 120;

const bodySchema = z.object({
  resumeText: z.string().min(1, "Resume is required"),
  jdText: z.string().min(1, "Job description is required"),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const { run, usedMock } = await analyzeResumeAndJd(
      body.resumeText,
      body.jdText
    );
    return NextResponse.json({ run, usedMock });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }
    if (err instanceof LlmError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status ?? 502 }
      );
    }
    console.error("analyze error", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
