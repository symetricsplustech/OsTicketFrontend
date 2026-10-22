import { createElement } from "react";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export type ToastType = "success" | "error" | "warning" | "info";

const IconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const colorMap = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export function ToastContainer() {
  return <Toaster position="top-right" />;
}

export function showToast(type: ToastType, title: string, message?: string) {
  toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur ${colorMap[type]}`}
      >
        {createElement(IconMap[type], { className: "h-5 w-5 shrink-0" })}
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {message ? (
            <p className="mt-1 text-xs opacity-80">{message}</p>
          ) : null}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss notification"
          className="ml-2 rounded hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 4000 },
  );
}

export function showSuccess(title: string, message?: string) {
  showToast("success", title, message);
}
export function showError(title: string, message?: string) {
  showToast("error", title, message);
}
export function showWarning(title: string, message?: string) {
  showToast("warning", title, message);
}
export function showInfo(title: string, message?: string) {
  showToast("info", title, message);
}

export function showConfirm({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  toast.custom(
    (t) => (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {message ? (
          <p className="mt-2 text-xs text-slate-500">{message}</p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              onCancel?.();
              toast.dismiss(t.id);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
}
