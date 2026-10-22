import { cn } from "@utils/cn";

export type StatusVariant =
  | "active"
  | "pending"
  | "suspended"
  | "archived"
  | "inactive"
  | "draft"
  | "published"
  | "disabled"
  | "enabled"
  | "default";

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-emerald-100 text-emerald-800",
  enabled: "bg-emerald-100 text-emerald-800",
  published: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-amber-100 text-amber-800",
  suspended: "bg-red-100 text-red-800",
  disabled: "bg-red-100 text-red-800",
  inactive: "bg-slate-100 text-slate-800",
  archived: "bg-slate-100 text-slate-800",
  default: "bg-slate-100 text-slate-800",
};

export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  className,
}: StatusBadgeProps) {
  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        size === "sm" && "px-1.5 py-0.5",
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}
