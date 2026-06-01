"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiExport, ApiError } from "@/lib/api-client";
import type { TailoringRun } from "@/lib/schemas";
import { ErrorBanner } from "@/components/ErrorBanner";

type Props = {
  run: TailoringRun | null;
};

export function PDFExportButton({ run }: Props) {
  const [exporting, setExporting] = useState<"comparison" | "tailored" | null>(null);
  const [error, setError] = useState<string>();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const canExport = run?.status === "tailored" || run?.status === "exported";
  
  // Calculate unconfirmed bullets
  const getUnconfirmedBullets = () => {
    if (!run || !run.tailoredResume) return [];
    const unconfirmedList: { company: string; title: string; index: number; text: string }[] = [];

    run.tailoredResume.tailoredExperience.forEach((role) => {
      role.bullets.forEach((bullet, idx) => {
        const isLowOrMed = bullet.confidence === "low" || bullet.confidence === "medium";
        const hasRisk = !!bullet.riskFlag;
        if (isLowOrMed || hasRisk) {
          const key = `${role.company}-${role.title}-${idx}`;
          const confirmed = !!run.userConfirmations?.[key];
          if (!confirmed) {
            unconfirmedList.push({
              company: role.company,
              title: role.title,
              index: idx + 1,
              text: bullet.tailored,
            });
          }
        }
      });
    });

    return unconfirmedList;
  };

  const unconfirmedBullets = getUnconfirmedBullets();
  const hasUnconfirmedBullets = unconfirmedBullets.length > 0;
  const disabled = !canExport || hasUnconfirmedBullets;

  const handleExport = async (type: "comparison" | "tailored") => {
    if (!run || !canExport) return;
    
    if (hasUnconfirmedBullets) {
      setError("Please confirm the accuracy of all low-confidence/flagged bullets before exporting.");
      return;
    }

    if (!isConfirmed) {
      setError("Please confirm the truthfulness disclaimer before exporting.");
      return;
    }

    setExporting(type);
    setError(undefined);

    try {
      const { blob, filename } = await apiExport(run.id, type, run.userConfirmations);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Export failed. Please try again.";
      setError(message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(undefined)} />
      )}

      {/* Flagged/Low-confidence Bullets Alert (EC-P4-51) */}
      {canExport && hasUnconfirmedBullets && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Review Gate: {unconfirmedBullets.length} Unconfirmed Bullet{unconfirmedBullets.length > 1 ? "s" : ""}
          </div>
          <p className="text-xs text-amber-700">
            You must review and manually check the confirmation boxes on these tailored bullets in the review section above before exporting:
          </p>
          <ul className="list-disc pl-5 text-xs text-amber-600 space-y-1">
            {unconfirmedBullets.map((b, idx) => (
              <li key={idx}>
                <strong>{b.title} at {b.company}</strong> (Bullet #{b.index}): <span className="italic">"{b.text.slice(0, 80)}..."</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verification Checkbox (Phase 4 handoff hook) */}
      <div className="flex items-start space-x-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition duration-150">
        <input
          id="disclaimer-confirm"
          type="checkbox"
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          className="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          disabled={!canExport}
        />
        <div className="space-y-0.5 select-none cursor-pointer" onClick={() => canExport && setIsConfirmed(!isConfirmed)}>
          <label
            htmlFor="disclaimer-confirm"
            className="text-xs font-bold text-slate-800 leading-none cursor-pointer"
          >
            Truthfulness Acknowledgment
          </label>
          <p className="text-[11px] text-slate-600 leading-normal">
            I verify that all tailored information in this resume is a truthful representation of my actual experience. I acknowledge that I must review all changes before submitting to an employer.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button
          type="button"
          disabled={disabled || !isConfirmed || exporting !== null}
          onClick={() => handleExport("comparison")}
          title={getTooltip(canExport, isConfirmed, hasUnconfirmedBullets)}
          className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition-all"
        >
          {exporting === "comparison" ? "Generating report..." : "Export comparison PDF"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !isConfirmed || exporting !== null}
          onClick={() => handleExport("tailored")}
          title={getTooltip(canExport, isConfirmed, hasUnconfirmedBullets)}
          className="border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 active:bg-slate-100 px-5 py-2 rounded-lg transition-all"
        >
          {exporting === "tailored" ? "Generating resume..." : "Export tailored resume PDF"}
        </Button>
      </div>

      {!canExport && (
        <p className="text-xs text-amber-600 italic bg-amber-50 border border-amber-100 rounded px-2.5 py-1.5" role="status">
          Complete JD analysis and resume tailoring to enable PDF export controls.
        </p>
      )}
    </div>
  );
}

function getTooltip(canExport: boolean, isConfirmed: boolean, hasUnconfirmed: boolean) {
  if (!canExport) return "Complete tailoring first";
  if (hasUnconfirmed) return "Please confirm all pending bullets in the review section above first";
  if (!isConfirmed) return "Please accept the truthfulness acknowledgment first";
  return "Export PDF";
}
