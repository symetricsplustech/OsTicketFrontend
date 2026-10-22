import type { ReactNode } from "react";
import { cn } from "@utils/cn";
import { Link } from "react-router-dom";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    label: string;
    up?: boolean;
  };
  link?: string;
  linkLabel?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  link,
  linkLabel,
  color = "default",
  className,
}: StatCardProps) {
  const colorClasses = {
    default: "bg-white border-slate-200",
    success: "bg-emerald-50 border-emerald-100",
    warning: "bg-amber-50 border-amber-100",
    danger: "bg-red-50 border-red-100",
    info: "bg-brand-50 border-brand-100",
  };

  const valueColorClasses = {
    default: "text-slate-900",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-brand-600",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-colors",
        colorClasses[color],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p
            className={cn("mt-2 text-3xl font-bold", valueColorClasses[color])}
          >
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span
                className={cn(
                  "font-medium",
                  trend.up ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend.value}
              </span>
              <span className="text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className="ml-4 text-slate-300">{icon}</div>}
      </div>
      {link && linkLabel && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            to={link}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {linkLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
