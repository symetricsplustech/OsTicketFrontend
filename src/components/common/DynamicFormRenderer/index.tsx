import type { ReactNode } from "react";
import { Label } from "@components/common/ui";
import { Input, Select, Textarea } from "@components/common/ui";
import { cn } from "@utils/cn";
import { AlertCircle } from "lucide-react";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "date"
  | "datetime-local"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "file"
  | "reference"
  | "user-reference"
  | "group-reference"
  | "ci-reference"
  | "rich-text"
  | "read-only"
  | "hidden"
  | "masked";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  masked?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  maxLength?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  fieldPolicy?:
    | "READ"
    | "WRITE"
    | "HIDE"
    | "MASK"
    | "API_READ"
    | "API_WRITE"
    | "SEARCH"
    | "REPORT"
    | "EXPORT";
}

interface DynamicFormRendererProps {
  fields: FieldConfig[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  onSubmit?: (event: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export function DynamicFormRenderer({
  fields,
  values,
  onChange,
  errors,
  disabled,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  className,
}: DynamicFormRendererProps) {
  const visibleFields = fields.filter(
    (f) => !f.hidden && f.fieldPolicy !== "HIDE",
  );
  const handleChange = (name: string, value: unknown) => onChange(name, value);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  const renderControl = (field: FieldConfig) => {
    if (field.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={Boolean(values[field.name])}
          onChange={(e) => handleChange(field.name, e.target.checked)}
          disabled={field.disabled || disabled}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
      );
    }
    if (field.type === "select") {
      return (
        <Select
          value={String(values[field.name] ?? "")}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={field.disabled || disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    }
    if (field.type === "textarea") {
      return (
        <Textarea
          value={String(values[field.name] ?? "")}
          onChange={(e) => handleChange(field.name, e.target.value)}
          disabled={field.disabled || disabled}
          maxLength={field.maxLength}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={4}
        />
      );
    }
    if (field.type === "read-only" || field.fieldPolicy === "READ") {
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {String(values[field.name] ?? "—")}
        </div>
      );
    }
    if (field.type === "hidden" || field.fieldPolicy === "HIDE") {
      return (
        <input
          type="hidden"
          name={field.name}
          value={String(values[field.name] ?? "")}
        />
      );
    }
    if (field.type === "file") {
      return (
        <input
          type="file"
          onChange={(e) => handleChange(field.name, e.target.files?.[0])}
          disabled={field.disabled || disabled}
          className="text-sm"
        />
      );
    }
    return (
      <Input
        type={field.type === "rich-text" ? "text" : field.type}
        value={String(values[field.name] ?? "")}
        onChange={(e) => handleChange(field.name, e.target.value)}
        disabled={field.disabled || disabled}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      {visibleFields.map((field) => (
        <div
          key={field.name}
          className={cn(field.type === "textarea" ? "md:col-span-2" : "")}
        >
          {field.type !== "checkbox" ? (
            <Label htmlFor={field.name}>
              {field.label}
              {field.required ? " *" : ""}
            </Label>
          ) : null}
          {renderControl(field)}
          {errors[field.name] ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors[field.name]}
            </p>
          ) : null}
          {field.validation?.message && !errors[field.name] ? (
            <p className="mt-1 text-[10px] text-slate-400">
              {field.validation.message}
            </p>
          ) : null}
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function useFormValidation(fields: FieldConfig[]) {
  const errors: Record<string, string> = {};
  const validate = (values: Record<string, unknown>): boolean => {
    let isValid = true;
    for (const field of fields) {
      if (field.required && !values[field.name]) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
      if (
        field.validation?.pattern &&
        values[field.name] &&
        !new RegExp(field.validation.pattern).test(String(values[field.name]))
      ) {
        errors[field.name] =
          field.validation.message ?? `Invalid ${field.label}`;
        isValid = false;
      }
      if (
        field.validation?.min !== undefined &&
        Number(values[field.name]) < field.validation.min
      ) {
        errors[field.name] =
          `${field.label} must be at least ${field.validation.min}`;
        isValid = false;
      }
      if (
        field.validation?.max !== undefined &&
        Number(values[field.name]) > field.validation.max
      ) {
        errors[field.name] =
          `${field.label} must be at most ${field.validation.max}`;
        isValid = false;
      }
    }
    return isValid;
  };
  return { errors, validate };
}
