import type { TailoringRun } from "@/lib/schemas";

// Use a global variable to persist the runs Map across Next.js Hot Module Replacement (HMR) reloads in dev mode
const globalForRuns = global as unknown as {
  runs: Map<string, TailoringRun> | undefined;
};

const runs = globalForRuns.runs ?? new Map<string, TailoringRun>();

if (process.env.NODE_ENV !== "production") {
  globalForRuns.runs = runs;
}

export function saveServerRun(run: TailoringRun): void {
  runs.set(run.id, run);
}

export function getServerRun(id: string): TailoringRun | undefined {
  return runs.get(id);
}

export function deleteServerRun(id: string): void {
  runs.delete(id);
}
