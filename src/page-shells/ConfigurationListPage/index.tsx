import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Input } from "@shared/components/ui";
import { Card, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Pagination } from "@shared/components/Pagination";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";

interface ColumnSpec<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface ConfigurationListPageProps<T> {
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
  canCreate?: boolean;
  createLabel?: string;
  onCreate?: () => void;
  canDelete?: boolean;
  onDelete?: (row: T) => void;
  emptyDescription?: string;
}

export function ConfigurationListPage<T>({
  title, description, breadcrumbs, actions, searchValue, onSearchChange,
  searchPlaceholder = "Search…", columns, rows, rowKey, onRowClick,
  page, totalPages, totalItems, onPageChange, loading, canCreate,
  createLabel = "Create", onCreate, canDelete, onDelete, emptyDescription,
}: ConfigurationListPageProps<T>) {
  const permissions = useAppSelector(selectPermissions);

  return (
    <div>
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
          </div>
          {canCreate && permissions.includes(PERMISSIONS.tenantPermissionGrant) && onCreate ? <Button onClick={onCreate}>{createLabel}</Button> : null}
        </div>
        {loading ? <CardBody><Spinner className="h-6 w-6 mx-auto my-4" /><p className="text-center text-sm text-slate-500">Loading…</p></CardBody> : rows.length === 0 ? <CardBody><EmptyState title={title} description={emptyDescription ?? "No items found"} /></CardBody> : <CardBody><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr>{columns.map((col) => <th key={col.key} className={cn("px-4 py-3", col.headerClassName)}>{col.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={rowKey(row)} className="border-t hover:bg-slate-50">{columns.map((col) => <td key={col.key} className={cn("px-4 py-3", col.className)}>{col.render ? col.render(row) : String(row[col.key] ?? "—")}</td>)}</tr>)}</tbody></table></div></CardBody>}
        {totalPages > 1 ? <div className="flex justify-between items-center border-t px-4 py-3 text-sm text-slate-500"><span>{totalItems ?? rows.length} items</span><Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={onPageChange} /></div> : null}
      </Card>
    </div>
  );
}
