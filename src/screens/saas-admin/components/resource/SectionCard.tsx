import type { ReactNode } from "react";

export interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Standard white card section used across SaaS Admin screens. Keeps spacing,
 * border and heading styles consistent without repeating utility classes.
 */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={["rounded-xl border border-slate-200 bg-white p-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title ? (
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            ) : null}
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
