import React from "react";
import { cn } from "@utils/cn";
import { Input, Select, Textarea, Label } from "@components/common/ui";

interface FieldWithRulesProps {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
  };
  options?: { value: any; label: string }[];
}

export function FieldWithRules({
  name,
  label,
  type,
  value,
  onChange,
  disabled,
  readOnly,
  hidden,
  required = false,
  validation,
  options,
}: FieldWithRulesProps) {
  if (hidden) {
    return null;
  }

  const classes = cn(
    "mb-4",
    disabled && "opacity-50 cursor-not-allowed",
    readOnly && "bg-slate-100",
  );

  const renderInput = (): JSX.Element => {
    if (type === "text") {
      return (
        <Input
          id={name}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || readOnly}
          placeholder={required ? undefined : "Enter " + label.lowercase()}
        />
      );
    }
    if (type === "textarea") {
      return (
        <Textarea
          id={name}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || readOnly}
          placeholder={required ? undefined : "Enter " + label.lowercase()}
        />
      );
    }
    if (type === "select") {
      return (
        <Select disabled={disabled || readOnly}>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    }
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          id={name}
          checked={value}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled || readOnly}
        />
      );
    }
    if (type === "date") {
      return (
        <input
          type="date"
          id={name}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || readOnly}
        />
      );
    }
    return <span>{label}</span>;
  };

  return (
    <div className={classes}>
      <Label htmlFor={name}>{label}</Label>
      {renderInput()}
    </div>
  );
}
