import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@components/common/PageHeader";
import { Input } from "@components/common/ui";
import { Card } from "@components/common/ui";
import { Pagination } from "@components/common/Pagination";
import { DataTable } from "@components/common/DataTable";

interface ColumnSpec<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface EntityListPageProps<T> {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  columns: ColumnSpec<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  useSearchPlaceholderLabel?: boolean;
  filterSlot?: ReactNode;
  emptyDescription?: string;
}

/**
 * Generic searchable, paginated entity list page used by directory screens.
 * Keeps loading/empty/error states and layout consistent across features.
 */
export function EntityListPage<T>({
  title,
  description,
  breadcrumbs,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  columns,
  rows,
  rowKey,
  onRowClick,
  page,
  totalPages,
  totalItems,
  onPageChange,
  loading,
  filterSlot,
  emptyDescription,
}: EntityListPageProps<T>) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm"
            />
          </div>
          {filterSlot}
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          onRowClick={onRowClick}
          loading={loading}
          emptyDescription={emptyDescription}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </Card>
    </div>
  );
}
