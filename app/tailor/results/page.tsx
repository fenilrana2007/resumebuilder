"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { GapAnalysis } from "@/components/GapAnalysis";
import { JDSummaryPanel } from "@/components/JDSummaryPanel";
import { MockModeBanner } from "@/components/MockModeBanner";
import { PDFExportButton } from "@/components/PDFExportButton";
import { ScoreCard } from "@/components/ScoreCard";
import { SideBySideDiff } from "@/components/SideBySideDiff";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { apiGetRun, apiTailor, ApiError } from "@/lib/api-client";
import type { TailoringRun } from "@/lib/schemas";
import {
  loadRun,
  loadRunMockFlag,
  saveRun,
  saveRunMockFlag,
} from "@/lib/session";

export default function ResultsPage() {
  const router = useRouter();
  const [run, setRun] = useState<TailoringRun | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [apiError, setApiError] = useState<string>();
  const [showMockBanner, setShowMockBanner] = useState(false);

  useEffect(() => {
    async function hydrate() {
      const stored = loadRun();
      if (!stored || stored.status === "draft") {
        router.replace("/tailor");
        return;
      }

      setShowMockBanner(loadRunMockFlag(stored.id));

      try {
        const { run: serverRun } = await apiGetRun(stored.id);
        setRun(serverRun);
        saveRun(serverRun);
      } catch {
        setRun(stored);
      }
    }
    void hydrate();
  }, [router]);

  const handleTailor = async () => {
    if (!run || run.status === "tailored") return;
    setApiError(undefined);
    setTailoring(true);

    try {
      // Pass run as runData so the server can restore state in stateless/serverless environments
      const { run: updated, usedMock } = await apiTailor(run.id, run);
      saveRun(updated);
      saveRunMockFlag(updated.id, usedMock);
      setShowMockBanner(usedMock);
      setRun(updated);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Tailoring failed. Please try again.";
      setApiError(message);
    } finally {
      setTailoring(false);
    }
  };

  const handleUpdateConfirmation = (key: string, confirmed: boolean) => {
    if (!run) return;
    const updatedConfirmations = {
      ...(run.userConfirmations || {}),
      [key]: confirmed,
    };
    const updatedRun = {
      ...run,
      userConfirmations: updatedConfirmations,
    };
    setRun(updatedRun);
    saveRun(updatedRun);
  };

  if (!run) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-100" />
        </div>
        <div className="h-12 w-full rounded bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[200px] rounded-xl bg-slate-100" />
          <div className="h-[200px] rounded-xl bg-slate-100" />
        </div>
        <div className="h-[250px] rounded-xl bg-slate-100" />
      </div>
    );
  }

  const step =
    run.status === "tailored" || run.status === "exported" ? "review" : "analyze";
  const showSideBySide = run.status === "tailored" && run.tailoredResume;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analysis results</h1>
          <p className="text-muted-foreground">
            Review fit, gaps, and tailored bullets before export.
          </p>
        </div>
        <Link href="/tailor">
          <Button variant="outline" size="sm">
            Edit inputs
          </Button>
        </Link>
      </div>

      <StepIndicator current={run.status === "tailored" ? "export" : step} />

      {showMockBanner && <MockModeBanner />}

      {apiError && (
        <ErrorBanner message={apiError} onDismiss={() => setApiError(undefined)} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {run.jobDescription && <JDSummaryPanel jd={run.jobDescription} />}
        <ScoreCard original={run.originalMatch} tailored={run.tailoredMatch} />
      </div>

      {run.gapAnalysis && <GapAnalysis analysis={run.gapAnalysis} />}

      {run.status === "analyzed" && !tailoring && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Analysis complete. Generate tailored bullets to compare side by side.
          </p>
          <Button type="button" size="lg" onClick={handleTailor} disabled={tailoring}>
            Generate tailored resume
          </Button>
        </div>
      )}

      {tailoring && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 space-y-6 animate-pulse">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-32 rounded bg-slate-200" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-16 rounded bg-slate-100" />
                  <div className="h-16 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSideBySide && !tailoring && (
        <SideBySideDiff
          tailored={run.tailoredResume!}
          userConfirmations={run.userConfirmations || {}}
          onUpdateConfirmation={handleUpdateConfirmation}
        />
      )}


      <section className="rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Export</h2>
        <PDFExportButton run={run} />
      </section>
    </div>
  );
}

