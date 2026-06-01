"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function JDInput({ value, onChange, error }: Props) {
  const charCount = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="jd">Job description</Label>
        <span className="text-xs text-muted-foreground">{charCount} characters</span>
      </div>
      <Textarea
        id="jd"
        placeholder="Paste the full job listing here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[220px] font-mono text-xs sm:text-sm"
        aria-invalid={!!error}
        aria-describedby={error ? "jd-error" : undefined}
      />
      {error && (
        <p id="jd-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
