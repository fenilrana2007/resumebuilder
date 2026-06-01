import { NextResponse } from "next/server";
import { isLlmConfigured } from "@/lib/llm/client";

export async function GET() {
  return NextResponse.json({ llmConfigured: isLlmConfigured() });
}
