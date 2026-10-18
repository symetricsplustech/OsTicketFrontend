import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Check, Save, Search, Shield, ShieldCheck, X } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, ErrorState, Field, Input } from "@components/common/ui";
import { StatusBadge } from "@/screens/saas-admin/components/ui";
import { SectionCard } from "@/screens/saas-admin/components/resource/SectionCard";
import { DetailsGrid } from "@/screens/saas-admin/components/resource/DetailsGrid";
import { formatDate } from "@/screens/saas-admin/components/resource/helpers";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import {
  useGetStaffQuery,
  useListRolesQuery,
  useSetStaffRolesMutation,
  useUpdateStaffMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  jobTitle: string;
  timezone: string;
  locale: string;
}

interface RoleOption {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  isSystem: boolean;
}

const initialFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  displayName: "",
  phone: "",
  jobTitle: "",
  timezone: "",
  locale: "",
};

function mapRole(row: ApiRecord): RoleOption {
  return {
    id: String(row.id),
    name: String(row.name ?? row.key ?? "Untitled role"),
    description: typeof row.description === "string" ? row.description : "",
    permissionCount: Number(row.permissionCount ?? (Array.isArray(row.permissions) ? row.permissions.length : 0)),
    isSystem: Boolean(row.isSystem),
  };
}

export function StaffEditScreen() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const staffQuery = useGetStaffQuery(staffId ?? "", { skip: !staffId });
  const rolesQuery = useListRolesQuery({ limit: 100 });
  const [updateStaff, { isLoading: savingProfile }] = useUpdateStaffMutation();
  const [setStaffRoles, { isLoading: savingRoles }] = useSetStaffRolesMutation();

  const staff = staffQuery.data?.data as ApiRecord | undefined;
  const allRoles = useMemo(() => ((rolesQuery.data?.data ?? []) as ApiRecord[]).map(mapRole), [rolesQuery.data]);

  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [initialForm, setInitialForm] = useState<StaffFormData>(initialFormData);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !staff) return;
    const next: StaffFormData = {
      firstName: String(staff.firstName ?? ""),
      lastName: String(staff.lastName ?? ""),
      displayName: String(staff.displayName ?? ""),
      phone: String(staff.phone ?? ""),
      jobTitle: String(staff.jobTitle ?? ""),
      timezone: String(staff.timezone ?? ""),
      locale: String(staff.locale ?? ""),
    };
    const roleIds = Array.isArray(staff.roleIds)
      ? (staff.roleIds as unknown[]).map(String)
      : ((staff.roles as ApiRecord[] | undefined) ?? []).map((role) => String(role.id));
    setFormData(next);
    setInitialForm(next);
    setSelectedRoleIds(roleIds);
    setInitialRoleIds(roleIds);
    setInitialized(true);
  }, [staff, initialized]);

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const profileDirty = useMemo(
    () => (Object.keys(initialForm) as (keyof StaffFormData)[]).some((key) => formData[key] !== initialForm[key]),
    [formData, initialForm],
  );

  const rolesDirty = useMemo(
    () => [...selectedRoleIds].sort().join(",") !== [...initialRoleIds].sort().join(","),
    [selectedRoleIds, initialRoleIds],
  );

  const dirty = profileDirty || rolesDirty;
  const saving = savingProfile || savingRoles;

  const selectedRoles = allRoles.filter((role) => selectedRoleIds.includes(role.id));
  const availableRoles = allRoles.filter(
    (role) => !selectedRoleIds.includes(role.id) && role.name.toLowerCase().includes(roleSearch.toLowerCase()),
  );
  const totalPermissions = selectedRoles.reduce((sum, role) => sum + role.permissionCount, 0);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof StaffFormData, string>> = {};
    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setSubmitError(null);
    if (!staffId || !validate()) return;
    try {
      if (profileDirty) {
        await updateStaff({
          staffId,
          body: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            displayName: formData.displayName.trim() || null,
            phone: formData.phone.trim() || null,
            jobTitle: formData.jobTitle.trim() || null,
            timezone: formData.timezone.trim() || undefined,
            locale: formData.locale.trim() || undefined,
          },
        }).unwrap();
      }
      if (rolesDirty) {
        await setStaffRoles({ staffId, body: { roleIds: selectedRoleIds } }).unwrap();
      }
      toast.success("Staff member updated.");
      navigate(SAAS_ADMIN_PATHS.staff.account(staffId));
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  const breadcrumbs = [
    { label: "SaaS Admin" },
    { label: "Staff & Access" },
    { label: "Staff Accounts", href: SAAS_ADMIN_PATHS.staff.accounts },
    { label: "Edit Staff" },
  ];

  if (staffQuery.isLoading || (!initialized && !staffQuery.isError)) {
    return (
      <SaasAdminScreen
        title="Edit Staff Member"
        description="Loading staff member…"
        backTo={staffId ? SAAS_ADMIN_PATHS.staff.account(staffId) : SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Member"
        breadcrumbs={breadcrumbs}
      >
        <p className="text-sm text-slate-500">Loading staff member…</p>
      </SaasAdminScreen>
    );
  }

  if (staffQuery.isError || !staff) {
    return (
      <SaasAdminScreen
        title="Edit Staff Member"
        description="Update staff profile, roles and permissions."
        backTo={SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Accounts"
        breadcrumbs={breadcrumbs}
      >
        <ErrorState message="Could not load this staff member." />
      </SaasAdminScreen>
    );
  }

  const target = SAAS_ADMIN_PATHS.staff.account(staffId ?? "");
  const status = String(staff.status ?? "").toUpperCase();

  return (
    <SaasAdminScreen
      title="Edit Staff Member"
      description={`Profile, account details, roles and permissions for ${String(staff.email ?? "this account")}.`}
      backTo={target}
      backLabel="Back to Staff Member"
      breadcrumbs={breadcrumbs}
      actions={
        <Button onClick={handleSubmit} loading={saving} disabled={!dirty && !saving}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        ) : null}

        <SectionCard title="Personal Information">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="First Name" htmlFor="firstName">
              <Input id="firstName" value={formData.firstName} onChange={(event) => handleChange("firstName", event.target.value)} required />
              {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <Input id="lastName" value={formData.lastName} onChange={(event) => handleChange("lastName", event.target.value)} required />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
            </Field>
            <Field label="Display Name" htmlFor="displayName">
              <Input id="displayName" value={formData.displayName} onChange={(event) => handleChange("displayName", event.target.value)} placeholder="Shown across the console" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" value={formData.phone} onChange={(event) => handleChange("phone", event.target.value)} placeholder="+1 555 0100" />
            </Field>
            <Field label="Job Title" htmlFor="jobTitle">
              <Input id="jobTitle" value={formData.jobTitle} onChange={(event) => handleChange("jobTitle", event.target.value)} placeholder="Senior Support Engineer" />
            </Field>
            <Field label="Timezone" htmlFor="timezone">
              <Input id="timezone" value={formData.timezone} onChange={(event) => handleChange("timezone", event.target.value)} placeholder="Asia/Kolkata" />
            </Field>
            <Field label="Locale" htmlFor="locale">
              <Input id="locale" value={formData.locale} onChange={(event) => handleChange("locale", event.target.value)} placeholder="en-IN" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Account Overview">
          <DetailsGrid
            items={[
              { label: "Email", value: String(staff.email ?? "—") },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    status={status.toLowerCase() || "—"}
                    variant={status === "ACTIVE" ? "active" : status === "INVITED" ? "pending" : "suspended"}
                    size="sm"
                  />
                ),
              },
              { label: "MFA", value: <StatusBadge status={staff.mfaEnabled ? "enabled" : "disabled"} variant={staff.mfaEnabled ? "active" : "suspended"} size="sm" /> },
              { label: "Email Verified", value: staff.emailVerifiedAt ? formatDate(staff.emailVerifiedAt) : "Pending" },
              { label: "Last Login", value: staff.lastLoginAt ? formatDate(staff.lastLoginAt) : "Never" },
              { label: "Active Sessions", value: Number(staff.activeSessions ?? 0) },
              { label: "Created", value: formatDate(staff.createdAt) },
              { label: "Updated", value: formatDate(staff.updatedAt) },
              ...(staff.lockedUntil ? [{ label: "Locked Until", value: <span className="text-red-600">{formatDate(staff.lockedUntil)}</span> }] : []),
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Email address, account status and password are managed through the staff member&apos;s detail page so
            privileged changes stay on the audited flows.
          </p>
        </SectionCard>

        <SectionCard
          title="Roles & Permissions"
          description={`${selectedRoles.length} role${selectedRoles.length === 1 ? "" : "s"} selected · ${totalPermissions} permission${totalPermissions === 1 ? "" : "s"} granted`}
          actions={<Shield className="h-5 w-5 text-slate-400" />}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Assigned</h4>
              {selectedRoles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No roles assigned. Add a role from the right to grant access.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedRoles.map((role) => (
                    <li key={role.id} className="flex items-start justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-slate-900">
                          <ShieldCheck className="h-4 w-4 text-brand-600" />
                          {role.name}
                        </p>
                        {role.description ? <p className="mt-0.5 text-xs text-slate-500">{role.description}</p> : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {role.permissionCount} permission{role.permissionCount === 1 ? "" : "s"}
                          {role.isSystem ? " · system role" : " · custom role"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleIds((prev) => prev.filter((id) => id !== role.id))}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${role.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Available</h4>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles…"
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
                />
              </div>
              {rolesQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading roles…</p>
              ) : availableRoles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No more roles available.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {availableRoles.map((role) => (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleIds((prev) => (prev.includes(role.id) ? prev : [...prev, role.id]))}
                        className="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        <p className="flex items-center gap-2 font-medium text-slate-900">
                          <Check className="h-4 w-4 text-slate-400" />
                          {role.name}
                        </p>
                        {role.description ? <p className="mt-0.5 text-xs text-slate-500">{role.description}</p> : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {role.permissionCount} permission{role.permissionCount === 1 ? "" : "s"}
                          {role.isSystem ? " · system role" : " · custom role"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(target)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty && !saving}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}
