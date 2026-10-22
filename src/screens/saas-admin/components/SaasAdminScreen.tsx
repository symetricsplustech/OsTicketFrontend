import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@utils/cn";

export interface SaasAdminScreenProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  /** When set, renders a back link above the title pointing at this path. */
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
}

export function SaasAdminScreen({
  title,
  description,
  breadcrumbs = [],
  actions,
  backTo,
  backLabel = "Back",
  children,
  className,
}: SaasAdminScreenProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header>
        {backTo ? (
          <Link
            to={backTo}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        ) : null}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500"
        >
          <ol className="flex items-center gap-1.5">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">/</span>}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="truncate hover:text-slate-700 hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-slate-800">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
