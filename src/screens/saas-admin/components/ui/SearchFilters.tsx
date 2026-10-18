import type { ReactNode, ChangeEvent } from "react";
import { cn } from "@utils/cn";
import { Search, Filter, X } from "lucide-react";

export interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
  filters?: FilterConfig[];
  filterValues: Record<string, string | number | boolean>;
  onFilterChange: (key: string, value: string | number | boolean) => void;
  onClearFilters?: () => void;
  className?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "daterange" | "boolean" | "text";
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

export function SearchFilters({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search...",
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  className,
}: SearchFiltersProps) {
  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v !== "" && v !== false && v !== null && v !== undefined,
  );

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-4", className)}>
      <div className="relative flex-1 min-w-[200px]">
        <label htmlFor="global-search" className="sr-only">
          {placeholder}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="global-search"
            type="search"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none"
          />
        </div>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[180px]">
          <label htmlFor={`filter-${filter.key}`} className="sr-only">
            {filter.label}
          </label>
          {filter.type === "select" && (
            <select
              id={`filter-${filter.key}`}
              value={filterValues[filter.key] as string}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {filter.type === "date" && (
            <input
              id={`filter-${filter.key}`}
              type="date"
              value={filterValues[filter.key] as string}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none"
            />
          )}
          {filter.type === "boolean" && (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                id={`filter-${filter.key}`}
                type="checkbox"
                checked={filterValues[filter.key] as boolean}
                onChange={(e) => onFilterChange(filter.key, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">{filter.label}</span>
            </label>
          )}
        </div>
      ))}

      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}