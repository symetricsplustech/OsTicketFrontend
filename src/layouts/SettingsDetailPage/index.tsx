import type { ReactNode } from "react";
import { useState } from "react";
import { PageHeader } from "@components/common/PageHeader";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
} from "@components/common/ui";
import { Button } from "@components/common/ui";
import { Spinner } from "@components/common/ui";
import { EmptyState } from "@components/common/ui";
import {
  showSuccess,
  showError,
} from "@components/common/Toast/ToastContainer";
import { cn } from "@utils/cn";

interface SettingsSection {
  id: string;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    value?: string;
    onChange?: (name: string, value: string) => void;
    error?: string;
  }>;
}

interface SettingsDetailPageProps {
  title: ReactNode;
  subtitle?: ReactNode;
  sections: SettingsSection[];
  onSave?: (values: Record<string, unknown>) => Promise<void> | void;
  onReset?: () => void;
  loading?: boolean;
  dirty?: boolean;
  onDiscard?: () => void;
}

export function SettingsDetailPage({
  title,
  subtitle,
  sections,
  onSave,
  onReset,
  loading,
  dirty,
  onDiscard,
}: SettingsDetailPageProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(values);
      showSuccess("Settings saved");
    } catch (cause) {
      showError(
        "Save failed",
        cause instanceof Error ? cause.message : "Unknown error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {onReset ? (
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
            ) : null}
            <Button onClick={handleSave} loading={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      />
      {dirty && onDiscard ? (
        <button
          onClick={onDiscard}
          className="text-sm text-slate-500 underline"
        >
          Discard changes
        </button>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader title={section.title} />
            <CardBody>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.name}>
                    <Label>
                      {field.label}
                      {field.required ? " *" : ""}
                    </Label>
                    <Input
                      type={field.type ?? "text"}
                      value={String(field.value ?? "")}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full"
                    />
                    {field.error ? (
                      <p className="mt-1 text-xs text-red-600">{field.error}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
