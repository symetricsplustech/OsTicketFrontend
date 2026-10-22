import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Save, RotateCcw } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button } from "@components/common/ui";
import { apiErrorMessage } from "@services/http";
import {
  useListRolesQuery,
  useListTenantPermissionsQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
} from "@services/tenantadmin";
import type { TenantPermission } from "@services/tenantadmin";

const ROLES_BACK = "/organization/roles-access-control/roles/all-roles";

function sameCodes(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((code) => setB.has(code));
}

export function RolePermissionMatrixPage() {
  const rolesResult = useListRolesQuery();
  const catalogResult = useListTenantPermissionsQuery();
  const [roleId, setRoleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [setPerms] = useSetRolePermissionsMutation();

  const roles = useMemo(
    () => [...(rolesResult.data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [rolesResult.data],
  );

  useEffect(() => {
    if (!roleId && roles.length > 0) setRoleId(roles[0].id);
  }, [roles, roleId]);

  const grantedResult = useGetRolePermissionsQuery(roleId ?? "", {
    skip: !roleId,
  });
  const savedCodes = useMemo(
    () => grantedResult.data?.data ?? [],
    [grantedResult.data],
  );

  useEffect(() => {
    setDraft(null);
    setSearch("");
  }, [roleId]);

  const activeCodes = draft ?? savedCodes;
  const dirty = draft !== null && !sameCodes(draft, savedCodes);

  const catalog = useMemo(() => {
    const all = catalogResult.data?.data ?? [];
    const needle = search.trim().toLowerCase();
    const filtered = needle
      ? all.filter(
          (permission) =>
            permission.code.toLowerCase().includes(needle) ||
            permission.name.toLowerCase().includes(needle) ||
            (permission.group ?? "").toLowerCase().includes(needle),
        )
      : all;
    const groups = new Map<string, TenantPermission[]>();
    for (const permission of filtered) {
      const group = permission.group || "General";
      const bucket = groups.get(group) ?? [];
      bucket.push(permission);
      groups.set(group, bucket);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [catalogResult.data, search]);

  const toggle = (code: string) => {
    setDraft((prev) => {
      const base = prev ?? savedCodes;
      return base.includes(code)
        ? base.filter((entry) => entry !== code)
        : [...base, code];
    });
  };

  const save = async () => {
    if (!roleId || !draft) return;
    setSaving(true);
    try {
      await setPerms({
        roleId,
        body: { permissionCodes: draft },
      }).unwrap();
      toast.success("Role permissions saved");
      setDraft(null);
    } catch (cause) {
      toast.error(
        apiErrorMessage((cause as { data?: unknown }).data ?? cause),
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setDraft(null);

  const breadcrumbs = [
    { label: "SaaS Admin" },
    { label: "Roles & Access Control" },
    { label: "Role Permission Matrix" },
  ];

  const selectedRole = roles.find((role) => role.id === roleId);
  const firstError =
    rolesResult.error ?? catalogResult.error ?? grantedResult.error;

  return (
    <SaasAdminScreen
      title="Role Permission Matrix"
      description="Review and edit which permissions each role grants"
      breadcrumbs={breadcrumbs}
      backTo={ROLES_BACK}
      backLabel="All Roles"
      actions={
        roleId ? (
          <div className="flex items-center gap-2">
            {dirty ? (
              <Button variant="ghost" onClick={reset} disabled={saving}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            ) : null}
            <Button onClick={save} disabled={saving || !dirty}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving…" : "Save Permissions"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {firstError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiErrorMessage((firstError as { data?: unknown }).data)}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Roles</h2>
          {rolesResult.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-slate-500">No roles found.</p>
          ) : (
            <ul className="space-y-1">
              {roles.map((role) => (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => setRoleId(role.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      role.id === roleId
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block font-medium">{role.name}</span>
                    <span className="block text-xs text-slate-500">
                      {role.key}
                      {role._count?.roleAssignments !== undefined
                        ? ` · ${role._count.roleAssignments} member${
                            role._count.roleAssignments === 1 ? "" : "s"
                          }`
                        : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                {selectedRole ? `${selectedRole.name} permissions` : "Permissions"}
              </h2>
              <p className="text-xs text-slate-500">
                {activeCodes.length} of {catalogResult.data?.data?.length ?? 0}{" "}
                permissions granted
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search permissions…"
              className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {grantedResult.isLoading || catalogResult.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : catalog.length === 0 ? (
            <p className="text-sm text-slate-500">No permissions found.</p>
          ) : (
            <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
              {catalog.map(([group, permissions]) => (
                <section key={group}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group}
                  </h3>
                  <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {permissions.map((permission) => {
                      const checked = activeCodes.includes(permission.code);
                      return (
                        <li key={permission.code}>
                          <label
                            className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                              checked
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(permission.code)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="min-w-0">
                              <span className="block font-medium text-slate-800">
                                {permission.name}
                              </span>
                              <span className="block break-all text-xs text-slate-500">
                                {permission.code}
                                {permission.scope ? ` · ${permission.scope}` : ""}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </SaasAdminScreen>
  );
}
