import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, RotateCcw } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  ErrorState,
} from "@components/common/ui";
import {
  useGetTenantQuery,
  useUpdateTenantMutation,
} from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";
import type { ApiRecord } from "@services/saasadmin";

interface ConfigForm {
  name: string;
  industry: string;
  website: string;
  notes: string;
  primaryContactName: string;
  primaryContactEmail: string;
  timezone: string;
  locale: string;
}

const emptyForm: ConfigForm = {
  name: "",
  industry: "",
  website: "",
  notes: "",
  primaryContactName: "",
  primaryContactEmail: "",
  timezone: "UTC",
  locale: "en-US",
};

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];
const locales = [
  "en-US",
  "en-GB",
  "fr-FR",
  "de-DE",
  "es-ES",
  "ja-JP",
  "zh-CN",
  "pt-BR",
];

function toForm(tenant: ApiRecord): ConfigForm {
  return {
    name: String(tenant.name ?? ""),
    industry: String(tenant.industry ?? ""),
    website: String(tenant.website ?? ""),
    notes: String(tenant.notes ?? ""),
    primaryContactName: String(tenant.primaryContactName ?? ""),
    primaryContactEmail: String(tenant.primaryContactEmail ?? ""),
    timezone: String(tenant.timezone ?? "UTC"),
    locale: String(tenant.locale ?? "en-US"),
  };
}

export function TenantConfigurationScreen() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const tenantQuery = useGetTenantQuery(tenantId ?? "", { skip: !tenantId });
  const [updateTenant, { isLoading: saving }] = useUpdateTenantMutation();

  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ConfigForm, string>>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const tenant = tenantQuery.data?.data as ApiRecord | undefined;

  useEffect(() => {
    if (tenant) setForm(toForm(tenant));
  }, [tenant]);

  const handleChange = (field: keyof ConfigForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof ConfigForm, string>> = {};
    if (!form.name.trim()) next.name = "Tenant name is required";
    else if (form.name.trim().length < 2)
      next.name = "Tenant name must be at least 2 characters";
    if (
      form.primaryContactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContactEmail)
    ) {
      next.primaryContactEmail = "Invalid email format";
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      next.website = "Website must be a valid URL (http:// or https://)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaveError(null);
    if (!tenantId || !validate()) return;
    try {
      await updateTenant({
        tenantId,
        body: {
          name: form.name.trim(),
          industry: form.industry.trim() || null,
          website: form.website.trim() || null,
          notes: form.notes.trim() || null,
          primaryContactName: form.primaryContactName.trim() || null,
          primaryContactEmail: form.primaryContactEmail.trim() || null,
          timezone: form.timezone,
          locale: form.locale,
        },
      }).unwrap();
      setMessage("Tenant configuration saved.");
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    }
  };

  const title = tenant ? String(tenant.name) : "Tenant Configuration";

  return (
    <SaasAdminScreen
      title={title}
      description="Update the tenant's organization and regional settings."
      backTo="/saas-admin/tenants/all-tenants"
      backLabel="Back to All Tenants"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management" },
        { label: "All Tenants", href: "/saas-admin/tenants/all-tenants" },
        { label: "Configuration" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => tenant && setForm(toForm(tenant))}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      }
    >
      {tenantQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading tenant…</p>
      ) : tenantQuery.isError || !tenant ? (
        <ErrorState message="Could not load this tenant." />
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6" noValidate>
          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          {saveError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Organization
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tenant Name" htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                ) : null}
              </Field>
              <Field label="Industry" htmlFor="industry">
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="Technology"
                />
              </Field>
              <Field label="Website" htmlFor="website">
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://acme.com"
                />
                {errors.website ? (
                  <p className="mt-1 text-xs text-red-600">{errors.website}</p>
                ) : null}
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Notes" htmlFor="notes">
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Primary Contact
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact Name" htmlFor="primaryContactName">
                <Input
                  id="primaryContactName"
                  value={form.primaryContactName}
                  onChange={(e) =>
                    handleChange("primaryContactName", e.target.value)
                  }
                />
              </Field>
              <Field label="Contact Email" htmlFor="primaryContactEmail">
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={form.primaryContactEmail}
                  onChange={(e) =>
                    handleChange("primaryContactEmail", e.target.value)
                  }
                />
                {errors.primaryContactEmail ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.primaryContactEmail}
                  </p>
                ) : null}
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Regional
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Timezone" htmlFor="timezone">
                <Select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                >
                  {timezones.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Locale" htmlFor="locale">
                <Select
                  id="locale"
                  value={form.locale}
                  onChange={(e) => handleChange("locale", e.target.value)}
                >
                  {locales.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/saas-admin/tenants/all-tenants")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      )}
    </SaasAdminScreen>
  );
}
