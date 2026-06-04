import type { TailoringRun } from "@/lib/schemas";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new ApiError(data.error ?? "Request failed", res.status);
  }
  return data;
}

export async function apiAnalyze(resumeText: string, jdText: string) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jdText }),
  });
  return parseResponse<{ run: TailoringRun; usedMock: boolean }>(res);
}

export async function apiTailor(runId: string, runData?: TailoringRun) {
  const res = await fetch("/api/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Pass runData so the server can restore state in stateless/serverless environments
    body: JSON.stringify({ runId, runData }),
  });
  return parseResponse<{ run: TailoringRun; usedMock: boolean }>(res);
}

export async function apiGetRun(runId: string) {
  const res = await fetch(`/api/runs/${runId}`);
  return parseResponse<{ run: TailoringRun }>(res);
}

export async function apiExport(
  runId: string,
  type: "comparison" | "tailored" | "both",
  userConfirmations?: Record<string, boolean>,
  runData?: TailoringRun
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Pass runData so the server can restore state in stateless/serverless environments
    body: JSON.stringify({ runId, type, userConfirmations, runData }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new ApiError(data.error ?? "Export failed", res.status);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? `export-${type}.pdf`;
  return { blob, filename };
}
