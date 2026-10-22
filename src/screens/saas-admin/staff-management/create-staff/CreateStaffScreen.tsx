import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Select } from "@components/common/ui";
import { useCreateStaffMutation, useListRolesQuery } from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface StaffFormData {
  firstName: string;
  lastName: string;
  businessEmail: string;
  jobTitle: string;
  roleId: string;
}

const initialFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  businessEmail: "",
  jobTitle: "",
  roleId: "",
};

export function CreateStaffScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StaffFormData, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { data: rolesData } = useListRolesQuery({ limit: 100 });
  const roles = (rolesData?.data ?? []) as ApiRecord[];

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.businessEmail.trim())
      newErrors.businessEmail = "Business email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail))
      newErrors.businessEmail = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    try {
      await createStaff({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.businessEmail.trim(),
        jobTitle: formData.jobTitle.trim() || undefined,
        roleIds: formData.roleId ? [formData.roleId] : [],
      }).unwrap();
      navigate("/saas-admin/staff-management/staff-accounts");
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  return (
    <SaasAdminScreen
      title="Create Staff Account"
      description="Add a new platform staff member with appropriate roles and permissions."
      backTo="/saas-admin/staff-management/staff-accounts"
      backLabel="Back to Staff Accounts"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Staff & Access" },
        {
          label: "Staff Accounts",
          href: "/saas-admin/staff-management/staff-accounts",
        },
        { label: "Create Staff" },
      ]}
      actions={
        <Button onClick={handleSubmit} loading={isLoading}>
          <Save className="h-4 w-4 mr-2" /> Create Account
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" htmlFor="firstName">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
                required
              />
              {errors.firstName ? (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              ) : null}
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Smith"
                required
              />
              {errors.lastName ? (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              ) : null}
            </Field>
            <Field label="Business Email" htmlFor="businessEmail">
              <Input
                id="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={(e) => handleChange("businessEmail", e.target.value)}
                placeholder="john@platform.com"
                required
              />
              {errors.businessEmail ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.businessEmail}
                </p>
              ) : null}
            </Field>
            <Field label="Job Title" htmlFor="jobTitle">
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="Senior Support Engineer"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Access & Permissions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assigned Role" htmlFor="roleId">
              <Select
                id="roleId"
                value={formData.roleId}
                onChange={(e) => handleChange("roleId", e.target.value)}
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={String(role.id)} value={String(role.id)}>
                    {String(role.name ?? role.key)}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Determines base permissions. Can be modified after creation.
              </p>
            </Field>
          </div>
        </section>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-medium text-amber-800">Security Notice</h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 list-disc list-inside">
            <li>
              Never allow ordinary staff to create another Main SaaS Admin
            </li>
            <li>
              Do not grant staff the ability to assign themselves additional
              privileges
            </li>
            <li>A secure invitation will be sent to the business email</li>
            <li>Avoid collecting or emailing permanent plaintext passwords</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              navigate("/saas-admin/staff-management/staff-accounts")
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            <Save className="h-4 w-4 mr-2" /> Create Staff Account
          </Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}
