import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { EntityListPage } from "@page-shells/EntityListPage";
import { StatusBadge } from "@shared/components/Badge";
import { Badge } from "@shared/components/Badge";
import { useDebounce } from "@shared/hooks/useDebounce";
import { formatDate } from "@shared/lib/format";
import type { DirectoryUser } from "@shared/types";

const PAGE_SIZE = 20;

export function UsersDirectoryPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError } = useDirectoryQuery(
    {
      instanceId: instanceId ?? "",
      search: debouncedSearch || undefined,
      page,
      limit: PAGE_SIZE,
    },
    { skip: !instanceId },
  );

  if (!instanceId) return null;

  return (
    <EntityListPage<DirectoryUser>
      title="Users Directory"
      description="Every member of this instance with their organization placement, reporting line and role summary."
      breadcrumbs={
        <Link to={`/instances/${instanceId}`} className="hover:text-brand-600">
          Instance
        </Link>
      }
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name or email…"
      loading={isLoading}
      emptyDescription={
        isError ? "Could not load the directory." : "No users match the current search."
      }
      columns={[
        {
          key: "user",
          header: "User",
          render: (row) => (
            <div>
              <p className="font-medium text-slate-900">{row.name}</p>
              <p className="text-xs text-slate-500">{row.email}</p>
            </div>
          ),
        },
        {
          key: "membership",
          header: "Membership",
          render: (row) => <StatusBadge status={row.membershipStatus} />,
        },
        {
          key: "company",
          header: "Company",
          render: (row) => row.company ?? "—",
        },
        {
          key: "unit",
          header: "Business Unit · Department",
          render: (row) => (
            <div className="text-xs">
              <p>{row.businessUnit ?? "—"}</p>
              <p className="text-slate-500">{row.department ?? "—"}</p>
            </div>
          ),
        },
        {
          key: "location",
          header: "Location",
          render: (row) => row.location ?? "—",
        },
        {
          key: "reporting",
          header: "Manager",
          render: (row) => (
            <div className="text-xs">
              <p>{row.managerName ?? "—"}</p>
              <p className="text-slate-500">{row.teamLeadName ? `TL: ${row.teamLeadName}` : ""}</p>
            </div>
          ),
        },
        {
          key: "groups",
          header: "Groups",
          render: (row) => <GroupPills groups={row.groups} />,
        },
        {
          key: "assignmentGroups",
          header: "Assignment Groups",
          render: (row) => <GroupPills groups={row.assignmentGroups} />,
        },
        {
          key: "roles",
          header: "Roles",
          render: (row) => (
            <div className="flex max-w-xs flex-wrap gap-1">
              {row.roleSummary.length === 0 ? (
                <span className="text-xs text-slate-400">—</span>
              ) : (
                row.roleSummary.map((role) => <Badge key={role.id}>{role.name}</Badge>)
              )}
            </div>
          ),
        },
        {
          key: "access",
          header: "Access",
          render: (row) => <StatusBadge status={row.accessStatus} />,
        },
        {
          key: "lastSignIn",
          header: "Last Sign-in",
          render: (row) => <span className="text-xs">{formatDate(row.lastSignIn)}</span>,
        },
      ]}
      rows={data?.items ?? []}
      rowKey={(row) => row._id}
      onRowClick={(row) =>
        window.location.assign(`/instances/${instanceId}/people/users/${row._id}/access`)
      }
      page={page}
      totalPages={data?.totalPages ?? 1}
      totalItems={data?.total}
      onPageChange={setPage}
      filterSlot={isFetching ? <span className="text-xs text-slate-400">Refreshing…</span> : undefined}
    />
  );
}

function GroupPills({ groups }: { groups: { id: string; name: string; role?: string }[] }) {
  if (groups.length === 0) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex max-w-xs flex-wrap gap-1">
      {groups.map((group) => (
        <Badge key={group.id} variant="info">
          {group.name}
        </Badge>
      ))}
    </div>
  );
}