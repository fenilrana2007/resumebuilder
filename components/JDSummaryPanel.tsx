"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobDescriptionProfile } from "@/lib/schemas";

export function JDSummaryPanel({ jd }: { jd: JobDescriptionProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {jd.jobTitle}
          {jd.company ? ` @ ${jd.company}` : ""}
        </CardTitle>
        <CardDescription>
          Seniority: {jd.seniorityLevel || "Not specified"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Section title="Required skills" items={jd.requiredSkills} />
        <Section title="Preferred skills" items={jd.preferredSkills} />
        <Section title="Tools & technologies" items={jd.tools} />
        <Section title="Responsibilities" items={jd.responsibilities} limit={5} />
        <Section title="Domain signals" items={jd.domainSignals} />
        {jd.keywords.length > 0 && (
          <div>
            <p className="mb-2 font-medium">Keywords</p>
            <div className="flex flex-wrap gap-1">
              {jd.keywords.slice(0, 12).map((k) => (
                <Badge key={k} variant="secondary">
                  {k}
                </Badge>
              ))}
              {jd.keywords.length > 12 && (
                <Badge variant="secondary">+{jd.keywords.length - 12} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
  limit,
}: {
  title: string;
  items: string[];
  limit?: number;
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">None listed</p>
      </div>
    );
  }
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <div>
      <p className="mb-1 font-medium">{title}</p>
      <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {limit && items.length > limit && (
        <p className="mt-1 text-xs text-muted-foreground">
          +{items.length - limit} more
        </p>
      )}
    </div>
  );
}
