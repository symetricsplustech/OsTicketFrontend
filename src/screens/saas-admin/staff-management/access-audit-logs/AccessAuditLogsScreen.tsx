import { useMemo, useState } from "react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import {
  DataTable,
  SearchFilters,
  Pagination,
  StatusBadge,
} from "@/screens/saas-admin/components/ui";
import { ErrorState } from "@components/common/ui";
import { useListAuditEventsQuery } from "@services/saasadmin";
import type { ApiRecord, ListQuery } from "@services/saasadmin";

const outcomeOptions = ["SUCCESS", "FAILURE", "DENIED"] as const;

interface AuditRow {
  id: string;
  createdAt: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: "success" | "failure" | "denied";
  ipAddress: string;
  requestId: string;
}

function mapOutcome(raw: unknown): AuditRow["outcome"] {
  const value = String(raw ?? "").toUpperCase();
  if (value === "FAILURE") return "failure";
  if (value === "DENIED") return "denied";
  return "success";
}

function mapRow(row: ApiRecord): AuditRow {
  const actor = (row.actor ?? null) as ApiRecord | null;
  const actorName = actor
    ? [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
      String(actor.email ?? "")
    : "";
  return {
    id: String(row.id),
    createdAt: row.createdAt ? String(row.createdAt) : "",
    actorEmail: String(actor?.email ?? row.actorEmail ?? ""),
    actorName,
    action: String(row.action ?? ""),
    resourceType: String(row.resourceType ?? ""),
    resourceId: String(row.resourceId ?? ""),
    outcome: mapOutcome(row.outcome),
    ipAddress: String(row.ipAddress ?? ""),
    requestId: String(row.requestId ?? ""),
  };
}

export function AccessAuditLogsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = useMemo<ListQuery>(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
    }),
    [
      currentPage,
      itemsPerPage,
      sortBy,
      sortOrder,
      searchQuery,
      outcomeFilter,
      dateFrom,
      dateTo,
    ],
  );

  const { data, isLoading, isError } = useListAuditEventsQuery(params);

  const rows = ((data?.data ?? []) as ApiRecord[]).map(mapRow);
  const totalItems = Number(
    (data?.meta as { total?: number } | undefined)?.total ?? rows.length,
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const columns = [
    {
      key: "createdAt",
      header: "Timestamp",
      render: (r: AuditRow) => (
        <span className="text-sm font-mono">
          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
        </span>
      ),
      sortable: true,
    },
    {
      key: "actorEmail",
      header: "Actor",
      render: (r: AuditRow) => (
        <div>
          <p className="font-medium text-slate-900">
            {r.actorName || r.actorEmail || "system"}
          </p>
          {r.actorName && r.actorEmail ? (
            <p className="text-xs text-slate-500">{r.actorEmail}</p>
          ) : null}
        </div>
      ),
      sortable: false,
    },
    {
      key: "action",
      header: "Action",
      render: (r: AuditRow) => (
        <StatusBadge status={r.action || "—"} variant="default" size="sm" />
      ),
      sortable: false,
    },
    {
      key: "resourceType",
      header: "Resource",
      render: (r: AuditRow) => (
        <div>
          <p className="text-sm text-slate-700">{r.resourceType || "—"}</p>
          {r.resourceId ? (
            <p className="text-xs text-slate-400 font-mono truncate max-w-[16rem]">
              {r.resourceId}
            </p>
          ) : null}
        </div>
      ),
      sortable: false,
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (r: AuditRow) => (
        <StatusBadge
          status={r.outcome}
          variant={r.outcome === "success" ? "active" : "default"}
          size="sm"
        />
      ),
      sortable: false,
    },
    {
      key: "ipAddress",
      header: "Source IP",
      render: (r: AuditRow) => (
        <span className="font-mono text-sm">{r.ipAddress || "—"}</span>
      ),
      sortable: false,
    },
    {
      key: "requestId",
      header: "Request ID",
      render: (r: AuditRow) => (
        <span className="font-mono text-xs text-slate-500">
          {r.requestId || "—"}
        </span>
      ),
      sortable: false,
    },
  ];

  const handleSort = (key: string) => {
    if (sortBy === key)
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <SaasAdminScreen
      title="Access Audit Logs"
      description="View privileged action audit trail for staff accounts."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Access Audit Logs" },
      ]}
    >
      <SearchFilters
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        placeholder="Search by actor, action, resource, or request ID..."
        filters={[
          {
            key: "outcome",
            label: "Outcome",
            type: "select",
            options: outcomeOptions.map((o) => ({
              value: o,
              label: o.charAt(0) + o.slice(1).toLowerCase(),
            })),
          },
          { key: "dateFrom", label: "From Date", type: "date" },
          { key: "dateTo", label: "To Date", type: "date" },
        ]}
        filterValues={{ outcome: outcomeFilter, dateFrom, dateTo }}
        onFilterChange={(k, v) => {
          setCurrentPage(1);
          if (k === "outcome") setOutcomeFilter(v as string);
          else if (k === "dateFrom") setDateFrom(v as string);
          else if (k === "dateTo") setDateTo(v as string);
        }}
        onClearFilters={() => {
          setOutcomeFilter("");
          setDateFrom("");
          setDateTo("");
          setCurrentPage(1);
        }}
      />

      {isError ? (
        <ErrorState message="Could not load audit events." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyTitle="No audit events found"
            emptyDescription="Try adjusting your search or filters"
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </>
      )}
    </SaasAdminScreen>
  );
}
