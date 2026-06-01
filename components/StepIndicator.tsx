"use client";

import { cn } from "@/lib/utils";

const steps = [
  { id: "input", label: "Resume & JD" },
  { id: "analyze", label: "Analyze" },
  { id: "tailor", label: "Tailor" },
  { id: "review", label: "Review" },
  { id: "export", label: "Export" },
] as const;

export type StepId = (typeof steps)[number]["id"];

export function StepIndicator({ current }: { current: StepId }) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex flex-wrap gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="hidden sm:inline text-muted-foreground">→</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
