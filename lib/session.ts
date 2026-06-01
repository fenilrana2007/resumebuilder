import type { TailoringRun } from "@/lib/schemas";
import { tailoringRunSchema } from "@/lib/schemas";

const RUN_KEY = "resume-shapeshifter-run";
const DRAFT_KEY = "resume-shapeshifter-draft";

export type DraftInput = {
  resumeText: string;
  jdText: string;
};

export function saveDraft(draft: DraftInput): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftInput | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftInput;
  } catch {
    return null;
  }
}

export function saveRun(run: TailoringRun): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function loadRun(): TailoringRun | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RUN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return tailoringRunSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function clearRun(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RUN_KEY);
}

export function saveRunMockFlag(runId: string, usedMock: boolean): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`run-mock-${runId}`, usedMock ? "1" : "0");
}

export function loadRunMockFlag(runId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`run-mock-${runId}`) === "1";
}
