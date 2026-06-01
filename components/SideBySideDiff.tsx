"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TailoredResume } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const confidenceVariant = {
  high: "success" as const,
  medium: "medium" as const,
  low: "warning" as const,
};

interface SideBySideDiffProps {
  tailored: TailoredResume;
  userConfirmations?: Record<string, boolean>;
  onUpdateConfirmation?: (key: string, confirmed: boolean) => void;
}

export function SideBySideDiff({
  tailored,
  userConfirmations = {},
  onUpdateConfirmation,
}: SideBySideDiffProps) {
  return (
    <Card className="border border-slate-200 shadow-md">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">Side-by-Side Review</CardTitle>
        <CardDescription className="text-slate-500">
          Compare original and tailored bullets. Review risk flags and confirm bullet accuracy before exporting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {tailored.tailoredSummary && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 transition hover:bg-slate-50/50">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tailored Summary
            </p>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">{tailored.tailoredSummary}</p>
          </div>
        )}

        {tailored.tailoredExperience.map((role) => (
          <div key={`${role.company}-${role.title}`} className="space-y-4">
            <h4 className="font-semibold text-base text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              {role.title} <span className="text-slate-400 font-normal">at</span> {role.company}
            </h4>
            <div className="space-y-4">
              {role.bullets.map((bullet, idx) => {
                const bulletKey = `${role.company}-${role.title}-${idx}`;
                const confirmed = !!userConfirmations[bulletKey];
                return (
                  <BulletRow
                    key={idx}
                    bullet={bullet}
                    bulletKey={bulletKey}
                    confirmed={confirmed}
                    onConfirmChange={
                      onUpdateConfirmation
                        ? (val) => onUpdateConfirmation(bulletKey, val)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BulletRow({
  bullet,
  bulletKey,
  confirmed,
  onConfirmChange,
}: {
  bullet: TailoredResume["tailoredExperience"][0]["bullets"][0];
  bulletKey: string;
  confirmed: boolean;
  onConfirmChange?: (val: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const changed = bullet.original.trim() !== bullet.tailored.trim();

  // A checkbox is required if confidence is not high OR there is a risk flag
  const isCheckboxRequired =
    bullet.confidence === "low" ||
    bullet.confidence === "medium" ||
    !!bullet.riskFlag;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        confirmed
          ? "border-emerald-200 bg-emerald-50/20"
          : changed
          ? "border-teal-100 bg-teal-50/10"
          : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {changed ? (
            <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border border-teal-200 shadow-none font-medium text-[11px] px-2 py-0.5">
              Changed
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5">
              Unchanged
            </Badge>
          )}
          <Badge
            variant={confidenceVariant[bullet.confidence]}
            className="font-medium text-[11px] px-2 py-0.5"
          >
            {bullet.confidence} confidence
          </Badge>
          {bullet.riskFlag && (
            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-none font-medium text-[11px] px-2 py-0.5">
              Review Flag
            </Badge>
          )}
        </div>

        {isCheckboxRequired && confirmed && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/50 rounded-full px-2 py-0.5 border border-emerald-200/50 animate-fade-in">
            <svg
              className="h-3 w-3 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Verified Accurate
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50/50 p-3 border border-slate-100">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Original</p>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">{bullet.original}</p>
        </div>
        <div className={cn(
          "rounded-lg p-3 border",
          confirmed 
            ? "bg-emerald-50/10 border-emerald-100" 
            : changed 
            ? "bg-teal-50/10 border-teal-100" 
            : "bg-slate-50/50 border-slate-100"
        )}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Tailored</p>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">{bullet.tailored}</p>
        </div>
      </div>

      {isCheckboxRequired && onConfirmChange && (
        <div
          className={cn(
            "mt-4 flex items-start space-x-3 rounded-xl border p-3 transition-colors duration-200",
            confirmed
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-amber-200 bg-amber-50/30"
          )}
        >
          <input
            type="checkbox"
            id={bulletKey}
            checked={confirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className={cn(
              "mt-0.5 h-4.5 w-4.5 rounded border transition cursor-pointer",
              confirmed
                ? "border-emerald-400 text-emerald-600 focus:ring-emerald-400 focus:ring-offset-emerald-50"
                : "border-amber-400 text-amber-600 focus:ring-amber-400 focus:ring-offset-amber-50"
            )}
          />
          <div className="space-y-0.5 select-none cursor-pointer" onClick={() => onConfirmChange(!confirmed)}>
            <label
              htmlFor={bulletKey}
              className={cn(
                "text-xs font-semibold leading-none cursor-pointer",
                confirmed ? "text-emerald-800" : "text-amber-800"
              )}
            >
              Verify Experience Bullet
            </label>
            <p
              className={cn(
                "text-[11px] leading-normal",
                confirmed ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {confirmed
                ? "You have confirmed that this bullet accurately reflects your true background."
                : "This bullet has a lower confidence score or a risk warning. Please verify that this is 100% accurate."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition hover:underline"
          aria-expanded={open}
        >
          {open ? "Hide details" : "Show change details"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3.5 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Change Rationale: </span>
            <span className="text-slate-600">{bullet.changeReason}</span>
          </div>
          {bullet.keywordsAddressed.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-800">Keywords Addressed: </span>
              {bullet.keywordsAddressed.map((k) => (
                <Badge key={k} variant="secondary" className="bg-slate-100 text-slate-600 font-medium border-slate-200">
                  {k}
                </Badge>
              ))}
            </div>
          )}
          {bullet.riskFlag && (
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-amber-800 font-medium flex items-start gap-2">
              <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-semibold">Guardrail Warning:</span> {bullet.riskFlag}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
