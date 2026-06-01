import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const variants = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-muted text-muted-foreground",
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
