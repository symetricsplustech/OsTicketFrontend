import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { SaasAdminScreen } from "../SaasAdminScreen";
import { StatCard } from "../ui";
import { DataTable } from "../ui/DataTable";
import { SearchFilters } from "../ui/SearchFilters";
import { Pagination } from "../ui/Pagination";
import { StatusBadge } from "../ui/StatusBadge";
import { Modal } from "../ui/Modal";
import { Button } from "@components/common/ui";
import { apiErrorMessage } from "@services/saasadmin";
import type { ResourceListConfig, ResourceListState, ResourceRow, RevealPayload } from "./types";
import { extractRows, extractTotal, rowText, getField, comparable, matchFilter } from "./helpers";
import { FormGrid, validateRequiredFields } from "./FormFields";
import { MutationBridge } from "./MutationBridge";
import { RevealModal } from "./RevealModal";

interface ResourceListScreenProps {
  config: ResourceListConfig;
}

function useResourceListState(config: ResourceListConfig) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize ?? 10);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);

  const state: ResourceListState = { search, filters, page, pageSize, sortBy, sortOrder };

  const queryArgs =
    config.source.kind === "api" && config.source.buildParams ? config.source.buildParams(state) : undefined;
  const apiResult = config.source.kind === "api" ? config.source.useList(queryArgs) : undefined;

  const serverPagination = config.source.kind === "api" && config.source.serverPagination === true;

  const rawRows: ResourceRow[] = useMemo(() => {
    if (config.source.kind === "static") return config.source.rows;
    const payload = apiResult?.data;
    if (config.source.extractRows) return config.source.extractRows(payload);
    return extractRows(payload);
  }, [config.source, apiResult?.data]);

  const filterConfigs = config.filters ?? [];

  const visibleRows = useMemo(() => {
    if (serverPagination) return rawRows;
    let out = rawRows;
    const term = search.trim().toLowerCase();
    if (term) {
      out = out.filter((row) => {
        const hay = config.searchable ? config.searchable(row).toLowerCase() : rowText(row).toLowerCase();
        return hay.includes(term);
      });
    }
    for (const f of filterConfigs) {
      const expected = filters[f.key];
      if (expected === "" || expected === undefined) continue;
      out = out.filter((row) => matchFilter(row, f.key, f.type === "daterange" ? "date" : f.type, expected));
    }
    return out;
  }, [rawRows, search, filters, config, filterConfigs, serverPagination]);

  const sorted = useMemo(() => {
    if (serverPagination || !sortBy) return visibleRows;
    const direction = sortOrder === "asc" ? 1 : -1;
    return [...visibleRows].sort((a, b) => {
      const av = comparable(getField(a, sortBy));
      const bv = comparable(getField(b, sortBy));
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });
  }, [visibleRows, sortBy, sortOrder, serverPagination]);

  const serverTotal = serverPagination
    ? config.source.kind === "api" && config.source.extractTotal
      ? config.source.extractTotal(apiResult?.data)
      : extractTotal(apiResult?.data)
    : undefined;
  const total = serverTotal ?? sorted.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = serverPagination ? sorted : sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return {
    search,
    setSearch: handleSearchChange,
    filters,
    setFilters: handleFilterChange,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    rows: paged,
    total,
    totalPages,
    apiResult,
    createOpen,
    setCreateOpen,
    handleClearFilters,
  };
}

function resolveConfirm(confirm: string | ((row: ResourceRow) => string) | undefined, row: ResourceRow): boolean {
  if (!confirm) return true;
  const message = typeof confirm === "function" ? confirm(row) : confirm;
  return window.confirm(message);
}

export function ResourceListScreen({ config }: ResourceListScreenProps) {
  const structureKey = [
    config.path,
    config.source.kind,
    config.create ? "create" : "none",
    config.quickAction ? "quick" : "none",
  ].join(":");
  return <ResourceListContent key={structureKey} config={config} />;
}

function ResourceListContent({ config }: ResourceListScreenProps) {
  const {
    search,
    setSearch,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    rows,
    total,
    totalPages,
    apiResult,
    createOpen,
    setCreateOpen,
    handleClearFilters,
  } = useResourceListState(config);

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quickBusy, setQuickBusy] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [reveal, setReveal] = useState<RevealPayload | null>(null);

  const create = config.create;
  const quick = config.quickAction;
  const actions = config.actions ?? [];

  const createTriggerRef = useRef<((body?: unknown) => Promise<unknown>) | null>(null);
  const quickTriggerRef = useRef<((body?: unknown) => Promise<unknown>) | null>(null);
  const actionTriggerRefs = useRef<Record<string, (body?: unknown) => Promise<unknown>>>({});

  const runQuickAction = async (row: ResourceRow) => {
    const trigger = quickTriggerRef.current;
    if (!quick || !trigger) return;
    if (!resolveConfirm(quick.confirm, row)) return;
    setQuickBusy(String(row[config.rowId] ?? "row"));
    try {
      await trigger(quick.buildArg(row));
      toast.success(quick.successMessage ? quick.successMessage(row) : `${quick.label} saved.`);
      apiResult?.refetch?.();
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setQuickBusy(null);
    }
  };

  const runRowAction = async (action: NonNullable<ResourceListConfig["actions"]>[number], row: ResourceRow) => {
    if (!resolveConfirm(action.confirm, row)) return;
    if (!action.useAction) {
      action.onClick?.(row);
      return;
    }
    const trigger = actionTriggerRefs.current[action.label];
    if (!trigger) return;
    let input: string | undefined;
    if (action.promptFor) {
      const value = window.prompt(action.promptFor.label, action.promptFor.default ?? "");
      if (value === null) return;
      if (action.promptFor.required && value.trim().length === 0) {
        toast.error(action.promptFor.label);
        return;
      }
      input = value;
    }
    setActionBusy(action.label);
    try {
      const result = await trigger(action.buildArg ? action.buildArg(row, input) : row);
      const message = typeof action.successMessage === "function"
        ? action.successMessage(row)
        : action.successMessage ?? `${action.label} completed.`;
      toast.success(message);
      if (action.reveal) setReveal(action.reveal(result));
      apiResult?.refetch?.();
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setActionBusy(null);
    }
  };

  const openCreate = () => {
    const initial: Record<string, unknown> = {};
    for (const field of create?.fields ?? []) {
      initial[field.key] = field.type === "boolean" ? false : "";
    }
    setForm(initial);
    setFormErrors({});
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!create) return;
    const errors = validateRequiredFields(create.fields, form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const body = create.buildBody ? create.buildBody(form) : form;
      const result = await createTriggerRef.current?.(body);
      toast.success(create.successMessage ?? "Created successfully.");
      setCreateOpen(false);
      setFormErrors({});
      if (create.reveal) setReveal(create.reveal(result));
      apiResult?.refetch?.();
      setPage(1);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [{ label: "SaaS Admin" }, { label: config.sectionLabel }, { label: config.title }];

  const statsNodes = config.stats?.map((stat) => (
    <StatCard key={stat.key} label={stat.label} value={stat.compute(rows)} color={stat.color} icon={stat.icon} />
  ));

  const renderCell = (row: ResourceRow, key: string) => {
    const value = getField(row, key);
    if (key === "status" || key.endsWith(".status")) {
      return (
        <StatusBadge
          status={String(value ?? "—")}
          variant={config.statusVariant ? config.statusVariant(row) : undefined}
        />
      );
    }
    return <>{formatCell(value)}</>;
  };

  return (
    <SaasAdminScreen
      title={config.title}
      description={config.description}
      breadcrumbs={breadcrumbs}
      backTo={config.backTo}
      backLabel={config.backLabel}
      actions={
        create ? (
          <Button onClick={openCreate}>
            <span className="mr-1">+</span>
            {create.buttonLabel ?? `Create ${config.title.replace(/\s*s$/, "")}`}
          </Button>
        ) : undefined
      }
    >
      {create ? <MutationBridge hook={create.useCreate} onReady={(t) => (createTriggerRef.current = t)} /> : null}
      {quick ? <MutationBridge hook={quick.useAction} onReady={(t) => (quickTriggerRef.current = t)} /> : null}
      {actions.map((action) =>
        action.useAction ? (
          <MutationBridge
            key={action.label}
            hook={action.useAction}
            onReady={(t) => {
              if (t) actionTriggerRefs.current[action.label] = t;
              else delete actionTriggerRefs.current[action.label];
            }}
          />
        ) : null,
      )}

      {statsNodes && statsNodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{statsNodes}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 pb-0">
          <SearchFilters
            searchValue={search}
            onSearchChange={setSearch}
            placeholder={`Search ${config.title.toLowerCase()}…`}
            filters={config.filters}
            filterValues={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {Boolean(apiResult?.error) && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Failed to load {config.title.toLowerCase()}: {apiErrorMessage(((apiResult?.error as { data?: unknown } | undefined)?.data))}
            </span>
          </div>
        )}

        <DataTable
          columns={config.columns.map((col) => ({
            ...col,
            render: col.render ?? ((row: ResourceRow) => renderCell(row, col.key)),
          }))}
          rows={rows}
          rowKey={(row) => String(row[config.rowId] ?? rowText(row))}
          loading={apiResult?.isLoading}
          emptyTitle={config.emptyTitle ?? "No records found"}
          emptyDescription={config.emptyDescription}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          actions={[
            ...actions.map((action) => ({
              ...action,
              label: actionBusy === action.label ? "Working…" : action.label,
              onClick: (row: ResourceRow) => void runRowAction(action, row),
              show: action.show
                ? (row: ResourceRow) => actionBusy !== action.label && action.show!(row)
                : () => actionBusy !== action.label,
            })),
            ...(quick
              ? [
                  {
                    label: quickBusy ? "Working…" : quick.label,
                    icon: quick.icon,
                    variant: "ghost" as const,
                    onClick: (row: ResourceRow) => runQuickAction(row),
                    show: (row: ResourceRow) => quickBusy !== String(row[config.rowId] ?? "row"),
                  },
                ]
              : []),
          ]}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {create && (
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title={create.title}
          description={create.description}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={submitCreate} disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </>
          }
        >
          <FormGrid
            fields={create.fields}
            values={form}
            errors={formErrors}
            onChange={(key, value) => {
              setForm((prev) => ({ ...prev, [key]: value }));
              setFormErrors((prev) => {
                if (!prev[key]) return prev;
                const next = { ...prev };
                delete next[key];
                return next;
              });
            }}
          />
        </Modal>
      )}

      <RevealModal payload={reveal} onClose={() => setReveal(null)} />
    </SaasAdminScreen>
  );
}

function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record.name ?? record.key ?? record.label ?? record.email;
    if (name !== undefined) return String(name);
    const keys = Object.keys(record);
    return keys.length === 0 ? "—" : `{${keys.length} props}`;
  }
  return String(value);
}