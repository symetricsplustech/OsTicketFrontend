import { cn } from "@shared/lib/cn";
import { Button } from "@shared/components/Button";
import { plural } from "@shared/lib/format";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    if (totalItems === undefined) return null;
    return (
      <div className="px-4 py-2 text-xs text-slate-500">
        {plural(totalItems, "record", "records")}
      </div>
    );
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-2.5">
      <span className="text-xs text-slate-500">
        Page {page} of {totalPages}
        {totalItems !== undefined ? ` · ${plural(totalItems, "record", "records")}` : ""}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1 px-1">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "h-7 min-w-7 rounded-md px-2 text-xs font-medium",
                p === page
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}