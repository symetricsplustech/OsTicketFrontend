import type { ReactNode } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@components/common/ui";
import { DynamicFormRenderer } from "@components/common/DynamicFormRenderer";
import { DynamicFormRenderer as DF } from "@components/common/DynamicFormRenderer";
import type { FieldConfig } from "@components/common/DynamicFormRenderer";
import { showSuccess, showError } from "@components/common/Toast/ToastContainer";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface RecordCreatePageProps {
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  fields: FieldConfig[];
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
}

export function RecordCreatePage({ title, description, fields, onSubmit, onCancel, initialValues, loading }: RecordCreatePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(values);
      showSuccess(`${title} created successfully`);
      const back = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(back);
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Creation failed";
      setErrors({ submit: msg });
      showError("Creation failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5 text-slate-500" /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description ? <p className="text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
      <DynamicFormRenderer fields={fields} values={values} onChange={handleChange} errors={errors} disabled={submitting} onSubmit={handleSubmit} submitLabel="Create" cancelLabel="Cancel" onCancel={onCancel} />
      {errors.submit ? <p className="text-sm text-red-600">{errors.submit}</p> : null}
    </div>
  );
}
