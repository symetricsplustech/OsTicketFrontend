import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Shield, Search } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Textarea, ErrorState } from "@components/common/ui";
import { useUnsavedChanges } from "@hooks/useUnsavedChanges";
import { apiErrorMessage } from "@services/http";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  usePermissionGroupsQuery,
} from "@services/saasadmin";
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

const KEY_PATTERN = /^[a-z0-9](-?[a-z0-9])*$/;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function RoleFormScreen() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(roleId);

  const roleQuery = useGetRoleQuery(roleId ?? "", { skip: !isEdit });
  const permissionsQuery = useGetRolePermissionsQuery(roleId ?? "", { skip: !isEdit });
  const groupsQuery = usePermissionGroupsQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [setRolePermissions, { isLoading: settingPerms }] = useSetRolePermissionsMutation();

  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [originalCodes, setOriginalCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const role = roleQuery.data?.data as ApiRecord | undefined;
  const isSystem = Boolean(role?.isSystem);

  useEffect(() => {
    if (!isEdit || loaded || !role) return;
    setKey(String(role.key ?? ""));
    setKeyTouched(true);
    setName(String(role.name ?? ""));
    setDescription(String(role.description ?? ""));
    setLoaded(true);
  }, [isEdit, loaded, role]);

  useEffect(() => {
    const payload = permissionsQuery.data?.data as ApiRecord | undefined;
    if (!isEdit || !payload) return;
    const codes = (payload.permissionCodes as string[] | undefined) ?? [];
    setOriginalCodes(codes);
    setSelected(new Set(codes));
  }, [isEdit, permissionsQuery.data]);

  const groups: PermissionGroup[] = useMemo(
    () =>
      ((groupsQuery.data?.data ?? []) as ApiRecord[]).map((group) => ({
        module: String(group.module ?? "Other"),
        items: ((group.items ?? []) as ApiRecord[]).map((item) => ({
          code: String(item.code ?? item.id),
          name: String(item.name ?? item.code ?? ""),
          description: typeof item.description === "string" ? item.description : "",
        })),
      })),
    [groupsQuery.data],
  );

  const permissionsDirty = useMemo(() => {
    if (!isEdit) return selected.size > 0;
    if (originalCodes.length !== selected.size) return true;
    return originalCodes.some((code) => !selected.has(code));
  }, [isEdit, originalCodes, selected]);

  const saving = creating || updating || settingPerms;

  const formDirty = isEdit
    ? name.trim() !== String(role?.name ?? "") ||
      description.trim() !== String(role?.description ?? "") ||
      (!isSystem && key.trim() !== String(role?.key ?? "")) ||
      permissionsDirty
    : Boolean(name.trim() || description.trim() || selected.size > 0);
  useUnsavedChanges(formDirty && !saving);

  const term = search.toLowerCase();
  const visibleGroups = groups
    .map((group) => {
      if (!term) return group;
      if (group.module.toLowerCase().includes(term)) return group;
      return { ...group, items: group.items.filter((item) => item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term)) };
    })
    .filter((group) => group.items.length > 0);

  const toggle = (code: string) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (group: PermissionGroup, value: boolean) => {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      group.items.forEach((item) => (value ? next.add(item.code) : next.delete(item.code)));
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && !keyTouched) setKey(slugify(value));
    setErrors((prev) => ({ ...prev, name: "" }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Role name is required";
    else if (name.trim().length < 2) next.name = "Role name must be at least 2 characters";
    if (!isEdit && !key.trim()) next.key = "Role key is required";
    else if (!isEdit && !KEY_PATTERN.test(key.trim())) next.key = "Key must be a lowercase slug (letters, numbers, single hyphens)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaveError(null);
    if (!validate()) return;
    try {
      if (!isEdit) {
        await createRole({
          key: key.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          permissionCodes: Array.from(selected),
        }).unwrap();
        navigate("/saas-admin/staff-management/roles");
        return;
      }
      if (!roleId) return;
      const body: ApiRecord = { name: name.trim(), description: description.trim() || null };
      if (!isSystem && key.trim() !== String(role?.key ?? "")) body.key = key.trim();
      await updateRole({ roleId, body }).unwrap();
      if (permissionsDirty) {
        await setRolePermissions({ roleId, body: { permissionCodes: Array.from(selected) } }).unwrap();
      }
      setMessage("Role saved.");
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    }
  };

  if (isEdit && roleQuery.isLoading) {
    return (
      <SaasAdminScreen title="Edit Role" description="Loading role…" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: "Edit" }]}>
        <p className="text-sm text-slate-500">Loading role…</p>
      </SaasAdminScreen>
    );
  }

  if (isEdit && (roleQuery.isError || !role)) {
    return (
      <SaasAdminScreen title="Edit Role" description="Role details" backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: "Edit" }]}>
        <ErrorState message="Could not load this role." />
      </SaasAdminScreen>
    );
  }

  if (groupsQuery.isError) {
    return (
      <SaasAdminScreen title={isEdit ? "Edit Role" : "Create Role"} description="Configure the role and its permissions." backTo="/saas-admin/staff-management/roles" backLabel="Back to Roles" breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Roles Management", href: "/saas-admin/staff-management/roles" }, { label: isEdit ? "Edit" : "Create" }]}>
        <ErrorState message="Could not load the permission catalog." />
      </SaasAdminScreen>
    );
  }

  return (
    <SaasAdminScreen
      title={isEdit ? `Edit ${name || "Role"}` : "Create Role"}
      description="Configure the role and its permission grants."
      backTo="/saas-admin/staff-management/roles"
      backLabel="Back to Roles"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        { label: "Roles Management", href: "/saas-admin/staff-management/roles" },
        { label: isEdit ? "Edit" : "Create" },
      ]}
      actions={
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Role"}
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
        {saveError ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div> : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Role</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role Name" htmlFor="role-name">
              <Input id="role-name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </Field>
            <Field label="Role Key" htmlFor="role-key">
              <Input id="role-key" value={key} onChange={(e) => { setKey(e.target.value.toLowerCase()); setKeyTouched(true); setErrors((prev) => ({ ...prev, key: "" })); }} disabled={isSystem} className={isSystem ? "bg-slate-100" : undefined} />
              {errors.key ? <p className="mt-1 text-xs text-red-600">{errors.key}</p> : null}
              {isSystem ? <p className="mt-1 text-xs text-slate-400">System role keys cannot be changed.</p> : null}
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description" htmlFor="role-description">
              <Textarea id="role-description" value={description} onChange={(e) => { setDescription(e.target.value); setMessage(null); }} rows={3} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Permissions ({selected.size})</h3>
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
          </div>

          {groupsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading permission catalog…</p>
          ) : (
            <div className="space-y-6">
              {visibleGroups.map((group) => {
                const allSelected = group.items.every((item) => selected.has(item.code));
                return (
                  <div key={group.module}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-800 capitalize">{group.module}</h4>
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4" checked={allSelected} onChange={(e) => toggleModule(group, e.target.checked)} />
                        Select all
                      </label>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => (
                        <label key={item.code} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={selected.has(item.code)} onChange={() => toggle(item.code)} />
                          <span className="text-sm">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            <span className="block font-mono text-xs text-slate-400">{item.code}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500"><Shield className="h-4 w-4 inline mr-1" /> Permissions are enforced by the backend on every protected operation.</p>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/staff-management/roles")}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Role"}</Button>
          </div>
        </div>
      </form>
    </SaasAdminScreen>
  );
}
