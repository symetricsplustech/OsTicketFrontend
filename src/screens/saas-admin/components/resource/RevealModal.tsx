import { useState } from "react";
import { AlertTriangle, Check, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { Modal } from "../ui/Modal";
import { Button } from "@components/common/ui";
import type { RevealPayload } from "./types";

interface RevealFieldProps {
  label: string;
  value: string;
  masked?: boolean;
}

function RevealField({ label, value, masked }: RevealFieldProps) {
  const [revealed, setRevealed] = useState(!masked);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — select the value manually.");
    }
  };

  const display =
    masked && !revealed ? "•".repeat(Math.min(value.length, 40)) : value;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <code className="min-w-0 flex-1 break-all font-mono text-sm text-slate-800">
          {display}
        </code>
        {masked ? (
          <Button
            variant="ghost"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={copy} aria-label="Copy">
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface RevealModalProps {
  payload: RevealPayload | null;
  onClose: () => void;
}

export function RevealModal({ payload, onClose }: RevealModalProps) {
  return (
    <Modal
      isOpen={!!payload}
      onClose={onClose}
      title={payload?.title ?? "Details"}
      description={payload?.description}
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="space-y-4">
        {payload?.warning ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{payload.warning}</span>
          </div>
        ) : null}
        {payload?.fields.map((field) => (
          <RevealField
            key={field.label}
            label={field.label}
            value={field.value}
            masked={field.masked}
          />
        ))}
      </div>
    </Modal>
  );
}
