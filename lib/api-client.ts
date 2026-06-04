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
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new ApiError(`Server error (${res.status}): ${res.statusText || "Internal Server Error"}`, res.status);
    }
    throw new ApiError("Invalid JSON response from server", res.status);
  }

  if (!res.ok) {
    throw new ApiError(data?.error ?? "Request failed", res.status);
  }
  return data as T;
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
    const text = await res.text();
    let errMsg = "Export failed";
    try {
      const data = JSON.parse(text);
      errMsg = data.error ?? errMsg;
    } catch {
      errMsg = `Server error (${res.status}): ${res.statusText || "Internal Server Error"}`;
    }
    throw new ApiError(errMsg, res.status);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? `export-${type}.pdf`;
  return { blob, filename };
}
