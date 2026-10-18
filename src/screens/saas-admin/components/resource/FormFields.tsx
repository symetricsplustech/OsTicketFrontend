import type { FormField } from "./types";
import { displayValue } from "./helpers";
import { useListTenantsQuery } from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

interface FieldInputProps {
  field: FormField;
  value: unknown;
  onChange: (key: string, value: string | number | boolean) => void;
  error?: string;
}

const baseClass =
  "block w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none";

const fieldLabel = (field: FormField) => (
  <label htmlFor={`field-${field.key}`} className="mb-1 block text-sm font-medium text-slate-700">
    {field.label}
    {field.required && <span className="text-red-500"> *</span>}
  </label>
);

/**
 * Tenant picker backed by the shared tenant list endpoint. Kept as its own
 * component so it can be composed into any form via `optionsSource: "tenants"`.
 */
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error}</p>;
}

function TenantOptionsSelect({ field, value, onChange, error }: FieldInputProps) {
  const { data, isLoading } = useListTenantsQuery({ limit: 200 });
  const tenants = (data?.data ?? []) as ApiRecord[];

  return (
    <div>
      {fieldLabel(field)}
      <select
        id={`field-${field.key}`}
        value={String((value as string) ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={baseClass}
      >
        <option value="">{isLoading ? "Loading tenants…" : "Select tenant…"}</option>
        {tenants.map((tenant) => (
          <option key={String(tenant.id)} value={String(tenant.id)}>
            {String(tenant.name ?? tenant.slug ?? tenant.id)}
          </option>
        ))}
      </select>
      {field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>}
      <FieldError error={error} />
    </div>
  );
}

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  const handle = (next: string | number | boolean) => onChange(field.key, next);
  const current = field.type === "boolean" ? Boolean(value) : (value as string | number) ?? "";

  if (field.type === "select" && field.optionsSource === "tenants") {
    return <TenantOptionsSelect field={field} value={value} onChange={onChange} error={error} />;
  }

  return (
    <div>
      {fieldLabel(field)}
      {field.readOnly ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {displayValue(value)}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          id={`field-${field.key}`}
          value={String(current)}
          placeholder={field.placeholder}
          rows={4}
          onChange={(e) => handle(e.target.value)}
          className={baseClass}
        />
      ) : field.type === "select" ? (
        <select id={`field-${field.key}`} value={String(current)} onChange={(e) => handle(e.target.value)} className={baseClass}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={opt.value as string | number}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <div className="mt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              id={`field-${field.key}`}
              type="checkbox"
              checked={current as boolean}
              onChange={(e) => handle(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">{current ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
      ) : (
        <input
          id={`field-${field.key}`}
          type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"}
          value={String(current)}
          placeholder={field.placeholder}
          onChange={(e) => handle(field.type === "number" ? Number(e.target.value) : e.target.value)}
          className={baseClass}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>}
      <FieldError error={error} />
    </div>
  );
}

export function FormGrid({
  fields,
  values,
  onChange,
  errors,
}: {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: string | number | boolean) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field.key} className={field.type === "textarea" || field.type === "select" ? "sm:col-span-2" : undefined}>
          <FieldInput field={field} value={values[field.key]} onChange={onChange} error={errors?.[field.key]} />
        </div>
      ))}
    </div>
  );
}

/**
 * Validates a set of form fields against their `required` flag. Returns a map
 * of field key to error message. Only does client-side presence checks; the
 * backend must still perform authoritative validation.
 */
export function validateRequiredFields(
  fields: FormField[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required || field.readOnly) continue;
    const value = values[field.key];
    if (field.type === "boolean") continue;
    if (value === undefined || value === null || String(value).trim() === "") {
      errors[field.key] = `${field.label} is required`;
    }
  }
  return errors;
}