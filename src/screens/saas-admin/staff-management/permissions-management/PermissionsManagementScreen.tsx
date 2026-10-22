import { useEffect, useMemo, useState } from "react";
import { Save, Shield, Search } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Select, ErrorState } from "@components/common/ui";
import { useUnsavedChanges } from "@hooks/useUnsavedChanges";
import {
  useListRolesQuery,
  usePermissionGroupsQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface PermissionItem {
  code: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  items: PermissionItem[];
}

export function PermissionsManagementScreen() {
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const groupsQuery = usePermissionGroupsQuery();

  const roles = (rolesQuery.data?.data ?? []) as ApiRecord[];
  const groups: PermissionGroup[] = useMemo(
    () =>
      ((groupsQuery.data?.data ?? []) as ApiRecord[]).map((group) => ({
        module: String(group.module ?? "Other"),
        items: ((group.items ?? []) as ApiRecord[]).map((item) => ({
          code: String(item.code ?? item.id),
          name: String(item.name ?? item.code ?? ""),
          description:
            typeof item.description === "string" ? item.description : "",
        })),
      })),
    [groupsQuery.data],
  );

  const [roleId, setRoleId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionsQuery = useGetRolePermissionsQuery(roleId, {
    skip: !roleId,
  });
  const [setRolePermissions, { isLoading: saving }] =
    useSetRolePermissionsMutation();

  useEffect(() => {
    if (!roleId && roles.length > 0) setRoleId(String(roles[0].id));
  }, [roles, roleId]);

  const originalCodes = useMemo<string[]>(() => {
    const payload = permissionsQuery.data?.data as ApiRecord | undefined;
    return (payload?.permissionCodes as string[] | undefined) ?? [];
  }, [permissionsQuery.data]);

  useEffect(() => {
    setSelected(new Set(originalCodes));
  }, [originalCodes]);

  const dirty = useMemo(() => {
    if (originalCodes.length !== selected.size) return roleId !== "";
    return originalCodes.some((code) => !selected.has(code));
  }, [originalCodes, selected, roleId]);

  useUnsavedChanges(dirty && !saving);

  const toggle = (code: string) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (module: PermissionGroup, value: boolean) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      module.items.forEach((item) =>
        value ? next.add(item.code) : next.delete(item.code),
      );
      return next;
    });
  };

  const handleSave = async () => {
    if (!roleId) return;
    setError(null);
    setMessage(null);
    try {
      await setRolePermissions({
        roleId,
        body: { permissionCodes: Array.from(selected) },
      }).unwrap();
      setMessage("Role permissions updated.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  if (rolesQuery.isError || groupsQuery.isError) {
    return (
      <SaasAdminScreen
        title="Permissions Management"
        description="Configure the permission grants for a platform role."
        breadcrumbs={[
          { label: "SaaS Admin" },
          { label: "Staff & Access" },
          { label: "Permissions" },
        ]}
      >
        <ErrorState message="Could not load the permission catalog." />
      </SaasAdminScreen>
    );
  }

  const term = search.toLowerCase();
  const visibleGroups = groups
    .map((group) => {
      if (!term) return group;
      if (group.module.toLowerCase().includes(term)) return group;
      return {
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.code.toLowerCase().includes(term),
        ),
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <SaasAdminScreen
      title="Permissions Management"
      description="Configure the permission grants for a platform role."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Permissions" },
      ]}
      actions={
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || !roleId}
        >
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      }
    >
      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Role</span>
          <Select
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setMessage(null);
              setError(null);
            }}
            className="min-w-64"
          >
            <option value="">Select a role…</option>
            {roles.map((role) => (
              <option key={String(role.id)} value={String(role.id)}>
                {String(role.name ?? role.key)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Filter</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </label>
        <span className="ml-auto text-sm text-slate-500">
          {selected.size} permission{selected.size === 1 ? "" : "s"} selected
        </span>
      </div>

      {!roleId ? (
        <p className="text-sm text-slate-500">
          Select a role to view and edit its permissions.
        </p>
      ) : permissionsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading permissions…</p>
      ) : (
        <div className="space-y-6">
          {visibleGroups.map((group) => {
            const allSelected = group.items.every((item) =>
              selected.has(item.code),
            );
            return (
              <section
                key={group.module}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    {group.module}
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={allSelected}
                      onChange={(e) => toggleModule(group, e.target.checked)}
                    />
                    Select all
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <label
                      key={item.code}
                      className="flex items-start gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={selected.has(item.code)}
                        onChange={() => toggle(item.code)}
                      />
                      <span className="text-sm">
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        <span className="block font-mono text-xs text-slate-400">
                          {item.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-700">
        <Shield className="h-4 w-4 inline mr-2" />
        <strong>Note:</strong> Permissions are enforced by the backend on every
        protected operation. Editing a system role may require additional
        privileges.
      </div>
    </SaasAdminScreen>
  );
}
