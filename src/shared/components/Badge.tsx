import type { HTMLAttributes } from "react";
import { cn } from "@shared/lib/cn";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  muted: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({ variant = "default", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = String(status ?? "unknown").toLowerCase();
  const variant: Variant =
    value === "active" || value === "enabled" || value === "resolved" || value === "done"
      ? "success"
      : value === "invited" || value === "pending" || value === "scheduled"
        ? "warning"
        : value === "suspended" || value === "revoked" || value === "disabled" || value === "cancelled" || value === "expired"
          ? "danger"
          : value === "closed"
            ? "info"
            : "muted";
  return <Badge variant={variant}>{status ?? "unknown"}</Badge>;
}