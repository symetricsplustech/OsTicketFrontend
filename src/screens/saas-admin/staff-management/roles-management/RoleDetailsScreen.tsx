import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Key, Users, Trash2, Shield } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState } from "@components/common/ui";
import { StatusBadge, StatCard, DataTable, ConfirmDialog } from "@/screens/saas-admin/components/ui";
import { apiErrorMessage } from "@services/http";
import {
  useGetRoleQuery,
  useGetRolePermissionsQuery,
  useGetRoleMembersQuery,
  useDeleteRoleMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const BREADCRUMBS = [
  { label: "SaaS Admin" },
  { label: "Staff & Access" },
  { label: "Roles Management", href: "/saas-admin/staff-management/roles" },
  { label: "Role" },
];

function fmt(value: unknown): string {
  return value ? new Date(String(value)).toLocaleString() : "—";
}

export function RoleDetailsScreen() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleQuery = useGetRoleQuery(roleId ?? "", { skip: !roleId });
  const permissionsQuery = useGetRolePermissionsQuery(roleId ?? "", { skip: !roleId });
  const membersQuery = useGetRoleMembersQuery({ roleId: roleId ?? "", limit: 100 }, { skip: !roleId });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const role = roleQuery.data?.data as ApiRecord | undefined;
  const permissionsPayload = permissionsQuery.data?.data as ApiRecord | undefined;
  const permissionItems = (permissionsPayload?.permissions ?? []) as ApiRecord[];
  const members = ((membersQuery.data?.data ?? []) as ApiRecord[]).map((row) => ({
    id: String(row.id ?? row.assignmentId),
    name: String(row.displayName ?? ([row.firstName, row.lastName].filter(Boolean).join(" ") || row.email || "—")),
    email: String(row.email ?? ""),
    jobTitle: String(row.jobTitle ?? ""),
    status: String(row.status ?? ""),
    assignedAt: row.assignedAt ? String(row.assignedAt) : "",
  }));

  const grouped = permissionItems.reduce<Record<string, ApiRecord[]>>((acc, item) => {
    const module = String(item.module ?? "other");
    (acc[module] ??= []).push(item);
    return acc;
  }, {});

  if (roleQuery.isLoading) {
    return (
      <SaasAdminScreen title="Role" description="Loading role…" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={BREADCRUMBS}>
        <p className="text-sm text-slate-500">Loading role…</p>
      </SaasAdminScreen>
    );
  }

  if (roleQuery.isError || !role) {
    return (
      <SaasAdminScreen title="Role" description="Role details" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={BREADCRUMBS}>
        <ErrorState message="Could not load this role." />
      </SaasAdminScreen>
    );
  }

  const name = String(role.name ?? role.key ?? "Role");
  const isSystem = Boolean(role.isSystem);
  const memberCount = Number(role.memberCount ?? members.length);

  const handleDelete = async () => {
    if (!roleId) return;
    setError(null);
    try {
      await deleteRole(roleId).unwrap();
      navigate("/saas-admin/staff-management/roles");
    } catch (err) {
      setError(apiErrorMessage(err));
      setConfirmDelete(false);
    }
  };

  const memberColumns = [
    { key: "name", header: "Name", render: (m: typeof members[number]) => <span className="font-medium text-slate-900">{m.name}</span> },
    { key: "email", header: "Email", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.email}</span> },
    { key: "jobTitle", header: "Job Title", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.jobTitle || "—"}</span> },
    { key: "status", header: "Status", render: (m: typeof members[number]) => <StatusBadge status={m.status.toLowerCase()} variant={m.status.toUpperCase() === "ACTIVE" ? "active" : "pending"} size="sm" /> },
    { key: "assignedAt", header: "Assigned", render: (m: typeof members[number]) => <span className="text-sm text-slate-700">{m.assignedAt ? new Date(m.assignedAt).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <SaasAdminScreen
      title={name}
      description={String(role.description || "Platform role")}
      backTo="/saas-admin/staff-management/roles"
      backLabel="Back to Roles"
      breadcrumbs={BREADCRUMBS}
      actions={
        <div className="flex gap-2">
          <Link to={`/saas-admin/staff-management/roles/edit/${roleId}`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          </Link>
          <Link to={`/saas-admin/staff-management/roles/edit/${roleId}`}>
            <Button variant="outline"><Key className="h-4 w-4 mr-2" /> Manage Permissions</Button>
          </Link>
          {!isSystem && memberCount === 0 ? (
            <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          ) : null}
        </div>
      }
    >
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Type" value={isSystem ? "System" : "Custom"} color={isSystem ? "default" : "warning"} icon={<Shield className="h-6 w-6" />} />
        <StatCard label="Members" value={memberCount} color="info" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Permissions" value={permissionItems.length} color="success" icon={<Key className="h-6 w-6" />} />
        <StatCard label="Updated" value={role.updatedAt ? new Date(String(role.updatedAt)).toLocaleDateString() : "—"} color="default" icon={<Edit className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Key</dt><dd className="font-mono text-right break-all">{String(role.key ?? "—")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd><StatusBadge status={isSystem ? "system" : "custom"} variant={isSystem ? "default" : "pending"} size="sm" /></dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="font-medium">{fmt(role.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd className="font-medium">{fmt(role.updatedAt)}</dd></div>
          </dl>
          {role.description ? <p className="mt-4 text-sm text-slate-600">{String(role.description)}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Permissions ({permissionItems.length})</h3>
          {permissionsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading permissions…</p>
          ) : permissionItems.length === 0 ? (
            <p className="text-sm text-slate-500">This role has no permissions granted.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([module, items]) => (
                <div key={module}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{module}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span key={String(item.code)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700" title={String(item.description ?? "")}>
                        {String(item.name ?? item.code)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Members ({memberCount})</h3>
        {membersQuery.isError ? (
          <ErrorState message="Could not load role members." />
        ) : (
          <DataTable columns={memberColumns} rows={members} rowKey={(m) => m.id} loading={membersQuery.isLoading} emptyTitle="No members" emptyDescription="No staff are assigned to this role." />
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </SaasAdminScreen>
  );
}
