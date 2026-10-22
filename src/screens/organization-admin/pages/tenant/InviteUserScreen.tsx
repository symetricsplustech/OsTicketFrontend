import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button, Field, Input, Select } from "@components/common/ui";
import { toast } from "react-hot-toast";
import { useInviteUserMutation } from "@services/tenantadmin";
import { useListRolesQuery } from "@services/tenantadmin";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { apiErrorMessage } from "@services/http";

export function InviteUserScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    phone: "",
    roleKey: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trigger] = useInviteUserMutation();
  const { data: rolesData, isLoading: rolesLoading } = useListRolesQuery();

  const roles = rolesData?.data ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    const roleIds = form.roleKey ? [form.roleKey] : [];
    try {
      await trigger({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.jobTitle ? { jobTitle: form.jobTitle } : {}),
        ...(form.phone ? { phone: form.phone } : {}),
        roleIds,
      }).unwrap();
      toast.success("Invitation sent");
      navigate(
        "/organization/organization-users/user-management/all-users",
        { replace: true },
      );
    } catch (cause) {
      const msg = apiErrorMessage(
        (cause as { data?: unknown } | undefined)?.data,
      );
      setErrors({ submit: msg });
      toast.error(msg);
    }
  };

  if (rolesLoading) {
    return (
      <div className="p-6 text-slate-500">Loading roles…</div>
    );
  }

  return (
    <SaasAdminScreen
      title="Invite User"
      description="Send an invitation to join your organization."
      breadcrumbs={[
        { label: "Organization & Users", href: "/organization" },
        { label: "Invite User" },
      ]}
      backTo="/organization/organization-users/user-management/all-users"
      backLabel="Back to users"
      actions={
        <Button onClick={handleSubmit}>
          <UserPlus className="h-4 w-4 mr-1" />
          Send Invitation
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            required
            placeholder="user@company.com"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName">
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              required
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </Field>
        </div>
        <Field label="Job title" htmlFor="jobTitle">
          <Input
            id="jobTitle"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="e.g. Network Engineer"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 0100"
          />
        </Field>
        <Field label="Role (sidebar & permissions)" htmlFor="roleKey">
          <Select
            id="roleKey"
            value={form.roleKey}
            onChange={(e) =>
              setForm({ ...form, roleKey: e.target.value })
            }
            required
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.key}>
                {role.name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[10px] text-slate-400">
            The role determines which sidebar items and CRUD permissions this
            user receives in your organization.
          </p>
        </Field>
        {errors.submit && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </p>
        )}
      </form>
    </SaasAdminScreen>
  );
}
