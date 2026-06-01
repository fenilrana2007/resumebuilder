import { z } from "zod";
import { chatCompletionJson } from "@/lib/llm/client";

export function extractJsonString(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

export function parseWithSchema<T>(
  raw: string,
  schema: z.ZodType<T>
): T {
  const jsonText = extractJsonString(raw);
  const parsed = JSON.parse(jsonText) as unknown;
  return schema.parse(parsed);
}

export async function completeAndParse<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  retry = true
): Promise<T> {
  try {
    const raw = await chatCompletionJson(system, user);
    return parseWithSchema(raw, schema);
  } catch (err) {
    if (!retry) throw err;
    const raw = await chatCompletionJson(
      system,
      `${user}\n\nReturn only valid JSON matching the schema. No prose.`
    );
    return parseWithSchema(raw, schema);
  }
}
