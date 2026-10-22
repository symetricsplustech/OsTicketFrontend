import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "@components/common/ui";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@utils/cn";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  confirmDisabled?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading,
  confirmDisabled,
}: ConfirmDialogProps) {
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-500",
      btnColor: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      btnColor: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: Info,
      iconColor: "text-brand-500",
      btnColor: "bg-brand-600 hover:bg-brand-700",
    },
  };

  const { icon: Icon, iconColor, btnColor } = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className={btnColor}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
            iconColor,
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700">{message}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
