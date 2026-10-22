import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { Button } from "@components/common/ui";
import {
  FormGrid,
  validateRequiredFields,
} from "@/screens/saas-admin/components/resource/FormFields";
import { MutationBridge } from "@/screens/saas-admin/components/resource/MutationBridge";
import { apiErrorMessage } from "@services/http";
import type { ResourceCreateConfig } from "@/screens/saas-admin/components/resource/types";

interface ResourceCreateScreenProps {
  title: string;
  sectionLabel: string;
  backHref: string;
  create?: ResourceCreateConfig;
}

export function ResourceCreateScreen({
  title,
  sectionLabel,
  backHref,
  create,
}: ResourceCreateScreenProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [trigger, setTrigger] = useState<
    ((body?: unknown) => Promise<unknown>) | null
  >(null);

  const breadcrumbs = [
    { label: "SaaS Admin" },
    { label: sectionLabel },
    { label: title },
  ];

  const save = async () => {
    if (!create || !trigger) return;
    const fieldErrors = validateRequiredFields(create.fields, form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    setSaving(true);
    try {
      const body = create.buildBody ? create.buildBody(form) : form;
      await trigger(body);
      toast.success(create.successMessage ?? `${title} completed.`);
      navigate(backHref);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setSaving(false);
    }
  };

  if (!create) {
    return (
      <SaasAdminScreen
        title={title}
        breadcrumbs={breadcrumbs}
        backTo={backHref}
        backLabel="Back"
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This form isn't connected yet for this deployment.
        </div>
      </SaasAdminScreen>
    );
  }

  return (
    <SaasAdminScreen
      title={title}
      description={create.description}
      breadcrumbs={breadcrumbs}
      backTo={backHref}
      backLabel="Back"
      actions={
        <Button onClick={save} disabled={saving}>
          <Plus className="h-4 w-4 mr-1" />
          {saving ? "Saving…" : (create.buttonLabel ?? "Create")}
        </Button>
      }
    >
      <MutationBridge hook={create.useCreate} onReady={setTrigger} />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <FormGrid
          fields={create.fields}
          values={form}
          errors={errors}
          onChange={(key, v) => {
            setForm((prev) => ({ ...prev, [key]: v }));
            setErrors((prev) => {
              if (!prev[key]) return prev;
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }}
        />
      </div>
    </SaasAdminScreen>
  );
}
