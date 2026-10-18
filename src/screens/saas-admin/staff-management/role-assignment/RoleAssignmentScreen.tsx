import { useEffect, useMemo, useState } from "react";
import { Check, Search, Shield, X } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState } from "@components/common/ui";
import { useUnsavedChanges } from "@hooks/useUnsavedChanges";
import {
  useListStaffQuery,
  useListRolesQuery,
  useSetStaffRolesMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffOption {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
}

interface RoleOption {
  id: string;
  name: string;
  description: string;
}

function mapStaff(row: ApiRecord): StaffOption {
  const name =
    (typeof row.displayName === "string" && row.displayName) ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    String(row.email ?? "Unknown");
  return {
    id: String(row.id),
    name,
    email: String(row.email ?? ""),
    roleIds: Array.isArray(row.roleIds) ? (row.roleIds as unknown[]).map(String) : [],
  };
}

function mapRole(row: ApiRecord): RoleOption {
  return {
    id: String(row.id),
    name: String(row.name ?? row.key ?? "Untitled role"),
    description: typeof row.description === "string" ? row.description : "",
  };
}

export function RoleAssignmentScreen() {
  const staffQuery = useListStaffQuery({ limit: 100 });
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const [setStaffRoles, { isLoading: saving }] = useSetStaffRolesMutation();

  const staff = useMemo(() => (staffQuery.data?.data ?? []).map(mapStaff), [staffQuery.data]);
  const roles = useMemo(() => (rolesQuery.data?.data ?? []).map(mapRole), [rolesQuery.data]);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [pendingRoleIds, setPendingRoleIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStaff = staff.find((member) => member.id === selectedStaffId) ?? null;

  useEffect(() => {
    if (!selectedStaffId && staff.length > 0) setSelectedStaffId(staff[0].id);
  }, [staff, selectedStaffId]);

  useEffect(() => {
    if (selectedStaff) setPendingRoleIds(selectedStaff.roleIds);
  }, [selectedStaff]);

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(staffSearch.toLowerCase()),
  );

  const currentRoles = roles.filter((role) => pendingRoleIds.includes(role.id));
  const availableRoles = roles.filter(
    (role) => !pendingRoleIds.includes(role.id) && role.name.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const dirty = selectedStaff
    ? [...pendingRoleIds].sort().join(",") !== [...selectedStaff.roleIds].sort().join(",")
    : false;

  useUnsavedChanges(dirty && !saving);

  const addRole = (roleId: string) => {
    setMessage(null);
    setPendingRoleIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
  };

  const removeRole = (roleId: string) => {
    setMessage(null);
    setPendingRoleIds((prev) => prev.filter((id) => id !== roleId));
  };

  const handleSave = async () => {
    if (!selectedStaff) return;
    setError(null);
    setMessage(null);
    try {
      await setStaffRoles({ staffId: selectedStaff.id, body: { roleIds: pendingRoleIds } }).unwrap();
      setMessage("Role assignments saved.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  if (staffQuery.isError || rolesQuery.isError) {
    return (
      <SaasAdminScreen
        title="Staff Role Assignment"
        description="Search and select a staff member to manage their role assignments."
        breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Role Assignment" }]}
      >
        <ErrorState message="Could not load staff or roles." />
      </SaasAdminScreen>
    );
  }

  return (
    <SaasAdminScreen
      title="Staff Role Assignment"
      description="Search and select a staff member to manage their role assignments."
      breadcrumbs={[{ label: "SaaS Admin" }, { label: "Staff & Access" }, { label: "Role Assignment" }]}
      actions={
        <Button onClick={handleSave} loading={saving} disabled={!dirty}>
          <Check className="h-4 w-4 mr-2" /> Save Assignments
        </Button>
      }
    >
      {message ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Staff Member</h3>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {staffQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading staff…</p>
            ) : filteredStaff.length === 0 ? (
              <p className="text-sm text-slate-500">No staff found.</p>
            ) : (
              filteredStaff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => { setSelectedStaffId(member.id); setMessage(null); setError(null); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${member.id === selectedStaffId ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Assigned Roles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {currentRoles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No roles assigned</p>
            ) : (
              currentRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">{role.name}</span>
                  <button onClick={() => removeRole(role.id)} className="text-red-600 hover:text-red-800" aria-label={`Remove ${role.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Roles</h3>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {rolesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading roles…</p>
            ) : availableRoles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No roles available</p>
            ) : (
              availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => addRole(role.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    {role.name}
                  </p>
                  {role.description ? <p className="text-xs text-slate-500 mt-1">{role.description}</p> : null}
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </SaasAdminScreen>
  );
}
