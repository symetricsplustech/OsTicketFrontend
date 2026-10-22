import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-ring disabled:bg-brand-300",
  secondary:
    "bg-slate-200 text-slate-800 hover:bg-slate-300 focus-ring disabled:opacity-60",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-ring",
  ghost: "text-slate-600 hover:bg-slate-100 focus-ring",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-ring disabled:bg-red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        loading && "pointer-events-none opacity-70",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
