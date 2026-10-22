import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
  /** Span the full row (e.g. long values such as descriptions). */
  full?: boolean;
}

export interface DetailsGridProps {
  items: DetailItem[];
  columns?: 2 | 3;
}

/**
 * Read-only label/value grid shared by detail and editor screens.
 */
export function DetailsGrid({ items, columns = 3 }: DetailsGridProps) {
  const gridClass =
    columns === 3
      ? "grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3"
      : "grid gap-3 text-sm sm:grid-cols-2";
  const fullClass =
    columns === 3 ? "sm:col-span-2 xl:col-span-3" : "sm:col-span-2";
  return (
    <dl className={gridClass}>
      {items.map((item) => (
        <div key={item.label} className={item.full ? fullClass : undefined}>
          <dt className="text-slate-500">{item.label}</dt>
          <dd className="font-medium break-words text-slate-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
