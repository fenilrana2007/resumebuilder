"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GapAnalysis as GapAnalysisType } from "@/lib/schemas";

const importanceVariant = {
  high: "high" as const,
  medium: "medium" as const,
  low: "low" as const,
};

export function GapAnalysis({ analysis }: { analysis: GapAnalysisType }) {
  const { gaps } = analysis;

  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gap analysis</CardTitle>
          <CardDescription>No gaps identified in this mock run.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sorted = [...gaps].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.importance] - order[b.importance];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gap analysis</CardTitle>
        <CardDescription>
          Honest gaps after comparing your resume to the job requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((gap) => (
          <div
            key={gap.name}
            className="rounded-md border border-border p-4 space-y-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{gap.name}</span>
              <Badge variant={importanceVariant[gap.importance]}>
                {gap.importance}
              </Badge>
              {!gap.canSafelyAdd && (
                <Badge variant="warning">Do not invent</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">JD: </span>
              {gap.jdEvidence}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Resume: </span>
              {gap.resumeEvidence || "Not mentioned"}
            </p>
            <p className="text-sm">
              <span className="font-medium">Suggested action: </span>
              {gap.suggestedAction}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
