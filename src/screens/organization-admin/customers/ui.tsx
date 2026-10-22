import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2, X } from "lucide-react";
import { cn } from "@utils/cn";

export const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:bg-slate-50 disabled:text-slate-400";

export const labelClass = "mb-1 block text-xs font-medium text-slate-600";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function CustomerStatusBadge({ status }: { status: string }) {
  const tone =
    status === "ACTIVE" ? "green" : status === "PROSPECT" ? "blue" : "slate";
  return <Badge tone={tone}>{status}</Badge>;
}

export function PortalStatusBadge({ status }: { status: string }) {
  const tone =
    status === "ACTIVE"
      ? "green"
      : status === "INVITED"
        ? "amber"
        : status === "REVOKED"
          ? "red"
          : "slate";
  return <Badge tone={tone}>{status === "NONE" ? "No access" : status}</Badge>;
}

export function IncidentStatusBadge({ status }: { status: string }) {
  const tone =
    status === "resolved" || status === "closed"
      ? "green"
      : status === "in-progress"
        ? "blue"
        : status === "pending"
          ? "amber"
          : "slate";
  return <Badge tone={tone}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "critical"
      ? "red"
      : priority === "high"
        ? "amber"
        : priority === "medium"
          ? "blue"
          : "slate";
  return <Badge tone={tone}>{priority}</Badge>;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white shadow-2xl",
          wide ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  label = "Nothing here yet.",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-400">
      <Inbox className="h-6 w-6" />
      {label}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

/** Extracts a human message from an RTK Query error envelope. */
export function apiErrorMessage(error: unknown): string {
  const data = (error as { data?: { error?: { message?: string } } })?.data;
  return data?.error?.message ?? "Something went wrong. Please try again.";
}
