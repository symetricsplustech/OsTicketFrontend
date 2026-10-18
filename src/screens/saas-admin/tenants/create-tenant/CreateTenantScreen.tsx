import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button, Field, Input, Select, Textarea } from "@components/common/ui";
import { useCreateTenantMutation } from "@services/saasadmin";
import { apiErrorMessage } from "@services/http";

interface TenantFormData {
  name: string;
  slug: string;
  primaryContactName: string;
  primaryContactEmail: string;
  timezone: string;
  locale: string;
  industry: string;
  website: string;
  notes: string;
}

const initialFormData: TenantFormData = {
  name: "",
  slug: "",
  primaryContactName: "",
  primaryContactEmail: "",
  timezone: "UTC",
  locale: "en-US",
  industry: "",
  website: "",
  notes: "",
};

const timezones = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];
const locales = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES", "ja-JP", "zh-CN", "pt-BR"];

export function CreateTenantScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createTenant, { isLoading }] = useCreateTenantMutation();

  const handleChange = (field: keyof TenantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TenantFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Tenant name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Tenant name must be at least 2 characters";
    if (formData.slug && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(formData.slug)) {
      newErrors.slug = "Only lowercase letters, numbers and hyphens allowed";
    }
    if (formData.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    try {
      await createTenant({
        name: formData.name.trim(),
        ...(formData.slug.trim() ? { slug: formData.slug.trim() } : {}),
        ...(formData.primaryContactName.trim() ? { primaryContactName: formData.primaryContactName.trim() } : {}),
        ...(formData.primaryContactEmail.trim() ? { primaryContactEmail: formData.primaryContactEmail.trim() } : {}),
        timezone: formData.timezone,
        locale: formData.locale,
        ...(formData.industry.trim() ? { industry: formData.industry.trim() } : {}),
        ...(formData.website.trim() ? { website: formData.website.trim() } : {}),
        ...(formData.notes.trim() ? { notes: formData.notes.trim() } : {}),
      }).unwrap();
      navigate("/saas-admin/tenants/all-tenants");
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  };

  return (
    <SaasAdminScreen
      title="Create Tenant"
      description="Register a new organization on the platform."
      backTo="/saas-admin/tenants/all-tenants"
      backLabel="Back to All Tenants"
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "Tenant Management", href: "/saas-admin/tenants/all-tenants" },
        { label: "Create Tenant" },
      ]}
      actions={
        <Button onClick={handleSubmit} loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Tenant</Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6" noValidate>
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tenant Name" htmlFor="name">
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Acme Corporation" required />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </Field>
            <Field label="Slug (optional)" htmlFor="slug">
              <Input id="slug" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value.toLowerCase())} placeholder="acme-corp" />
              <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens. Derived from the name if omitted.</p>
              {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug}</p> : null}
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input id="industry" value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Technology" />
            </Field>
            <Field label="Website" htmlFor="website">
              <Input id="website" type="url" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://acme.com" />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact Name" htmlFor="primaryContactName">
              <Input id="primaryContactName" value={formData.primaryContactName} onChange={(e) => handleChange("primaryContactName", e.target.value)} placeholder="John Smith" />
            </Field>
            <Field label="Contact Email" htmlFor="primaryContactEmail">
              <Input id="primaryContactEmail" type="email" value={formData.primaryContactEmail} onChange={(e) => handleChange("primaryContactEmail", e.target.value)} placeholder="contact@acme.com" />
              {errors.primaryContactEmail ? <p className="mt-1 text-xs text-red-600">{errors.primaryContactEmail}</p> : null}
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Regional</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Timezone" htmlFor="timezone">
              <Select id="timezone" value={formData.timezone} onChange={(e) => handleChange("timezone", e.target.value)}>
                {timezones.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Locale" htmlFor="locale">
              <Select id="locale" value={formData.locale} onChange={(e) => handleChange("locale", e.target.value)}>
                {locales.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notes" htmlFor="notes">
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} placeholder="Internal notes about this tenant" />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate("/saas-admin/tenants/all-tenants")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}><Save className="h-4 w-4 mr-2" /> Create Tenant</Button>
        </div>
      </form>
    </SaasAdminScreen>
  );
}
