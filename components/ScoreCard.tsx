"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchScore } from "@/lib/schemas";

type Props = {
  original?: MatchScore;
  tailored?: MatchScore;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ original, tailored }: Props) {
  if (!original && !tailored) return null;

  const showDelta =
    original && tailored && tailored.overallScore !== original.overallScore;
  const delta = tailored && original ? tailored.overallScore - original.overallScore : 0;

  const active = tailored ?? original!;

  const critical = active.criticalMissingRequirements;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match score</CardTitle>
        <CardDescription>
          Alignment estimate for this job — not an ATS guarantee.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {original && (
            <div>
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="text-3xl font-bold tabular-nums">{original.overallScore}</p>
            </div>
          )}
          {tailored && (
            <>
              <span className="text-2xl text-muted-foreground" aria-hidden>
                →
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Tailored</p>
                <p className="text-3xl font-bold tabular-nums text-primary">
                  {tailored.overallScore}
                </p>
              </div>
            </>
          )}
          {showDelta && (
            <Badge variant={delta >= 0 ? "success" : "warning"}>
              {delta >= 0 ? "+" : ""}
              {delta} points
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ScoreBar label="Skill coverage" value={active.skillCoverageScore} />
          <ScoreBar label="Responsibilities" value={active.responsibilityAlignmentScore} />
          <ScoreBar label="Keywords" value={active.keywordScore} />
          <ScoreBar label="Seniority" value={active.seniorityScore} />
        </div>

        <p className="text-sm leading-relaxed text-foreground">{active.explanation}</p>

        {critical.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Critical gaps affecting score
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {critical.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No critical missing requirements flagged.</p>
        )}
      </CardContent>
    </Card>
  );
}
