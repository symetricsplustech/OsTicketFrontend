import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "@components/common/ui";

export interface PromptOptions {
  label: string;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
}

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  options: PromptOptions | null;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

/**
 * Styled replacement for `window.prompt` with real validation — used by the
 * resource engine for audit-gated input (export reasons, rejection reasons,
 * reply bodies) where an unvalidated native dialog is not acceptable.
 */
export function PromptDialog({
  isOpen,
  title,
  options,
  onCancel,
  onConfirm,
}: PromptDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && options) {
      setValue(options.defaultValue ?? "");
      setError("");
    }
  }, [isOpen, options]);

  if (!options) return null;

  const minLength = options.minLength ?? (options.required ? 1 : 0);

  const submit = () => {
    const trimmed = value.trim();
    if (options.required && trimmed.length === 0) {
      setError("This field is required.");
      return;
    }
    if (trimmed.length < minLength) {
      setError(
        `Must be at least ${minLength} character${minLength === 1 ? "" : "s"}.`,
      );
      return;
    }
    onConfirm(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={submit}>Confirm</Button>
        </>
      }
    >
      <label
        htmlFor="resource-prompt-input"
        className="block text-sm font-medium text-slate-700"
      >
        {options.label}
      </label>
      <textarea
        id="resource-prompt-input"
        autoFocus
        rows={3}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "resource-prompt-error" : undefined}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      />
      {error ? (
        <p
          id="resource-prompt-error"
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      ) : minLength > 0 ? (
        <p className="mt-1 text-xs text-slate-500">
          At least {minLength} character{minLength === 1 ? "" : "s"}. Press
          Enter to confirm.
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">Press Enter to confirm.</p>
      )}
    </Modal>
  );
}
