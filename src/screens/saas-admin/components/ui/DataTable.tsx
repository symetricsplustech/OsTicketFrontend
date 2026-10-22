import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  selection?: {
    selectedKeys: Set<string>;
    onChange: (keys: Set<string>) => void;
    getKey: (row: T) => string;
  };
  actions?: {
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void;
    variant?: "default" | "danger" | "ghost";
    show?: (row: T) => boolean;
  }[];
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle = "No records found",
  emptyDescription,
  loading,
  sortBy,
  sortOrder,
  onSort,
  selection,
  actions,
}: DataTableProps<T>) {
  const safeRows: T[] = Array.isArray(rows) ? rows : [];
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
    );
  }
  if (safeRows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mt-1 text-xs text-slate-500">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }
  const handleSort = (key: string) => {
    if (onSort) onSort(key);
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {selection && (
              <th scope="col" className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={safeRows.every((r) =>
                    r != null && selection.selectedKeys.has(selection.getKey(r)),
                  )}
                  onChange={() => {
                    if (
                      safeRows.every((r) =>
                        r != null && selection.selectedKeys.has(selection.getKey(r)),
                      )
                    ) {
                      selection.onChange(new Set());
                    } else {
                      selection.onChange(
                        new Set(
                          safeRows
                            .filter((r) => r != null)
                            .map(selection.getKey),
                        ),
                      );
                    }
                  }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                  col.sortable &&
                    "cursor-pointer hover:bg-slate-100 select-none",
                  col.headerClassName,
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th scope="col" className="px-4 py-3 text-right w-32">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {safeRows.map((row) => {
            if (row == null) return null;
            const key = rowKey(row);
            const isSelected = selection?.selectedKeys.has(
              selection.getKey(row),
            );
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-brand-50",
                  isSelected && "bg-brand-50",
                )}
              >
                {selection && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={isSelected}
                      onChange={(e) => {
                        const newKeys = new Set(selection.selectedKeys);
                        if (e.target.checked)
                          newKeys.add(selection.getKey(row));
                        else newKeys.delete(selection.getKey(row));
                        selection.onChange(newKeys);
                      }}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-sm text-slate-800",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions
                        .filter((a) => !a.show || a.show(row))
                        .map((action, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                              action.variant === "danger"
                                ? "text-red-600 hover:bg-red-50"
                                : action.variant === "ghost"
                                  ? "text-slate-600 hover:bg-slate-100"
                                  : "text-brand-600 hover:bg-brand-50",
                            )}
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
