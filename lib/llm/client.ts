const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const TIMEOUT_MS = 90_000;

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function chatCompletionJson(
  system: string,
  user: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new LlmError("GROQ_API_KEY is not configured");
  }

  const model = process.env.LLM_MODEL?.trim() || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) {
        throw new LlmError("Rate limit exceeded. Try again shortly.", 429);
      }
      throw new LlmError(
        `LLM request failed (${response.status}): ${body.slice(0, 200)}`,
        response.status
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new LlmError("Empty response from LLM");
    }
    return content;
  } catch (err) {
    if (err instanceof LlmError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LlmError("Request timed out. Try again.", 504);
    }
    throw new LlmError(err instanceof Error ? err.message : "LLM request failed");
  } finally {
    clearTimeout(timeout);
  }
}
