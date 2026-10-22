import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/screens/saas-admin/components/ui/StatusBadge";
import { TENANT_RESOURCE_LISTS } from "./resources";

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (value.every((item) => typeof item !== "object" || item === null)) {
      return value.map((item) => String(item)).join(", ");
    }
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const label = obj.displayName ?? obj.name ?? obj.title ?? obj.email ?? obj.label;
    if (typeof label === "string" && label) return label;
    const keys = Object.keys(obj);
    return keys.length > 0 ? `${keys.length} fields` : "—";
  }
  return String(value);
}

function isStatusKey(key: string): boolean {
  return key === "status" || key === "state" || key.endsWith("Status");
}

function prettifyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

export function OrganizationResourceDetailScreen() {
  const { recordId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const row = (location.state as { row?: Record<string, unknown> } | null)?.row;
  const config = TENANT_RESOURCE_LISTS.find(
    (entry) => location.pathname === `${entry.path}/${recordId}`,
  );

  const heading =
    (typeof row?.name === "string" && row.name) ||
    (typeof row?.title === "string" && row.title) ||
    (typeof row?.email === "string" && row.email) ||
    recordId ||
    "Record";

  const entries = row
    ? Object.entries(row).filter(
        ([, value]) => typeof value !== "function" && typeof value !== "symbol",
      )
    : [];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {config?.title ?? "Record"}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {recordId ? `Record ID: ${recordId}` : "Record details"}
          </p>
        </div>
      </header>

      {row && entries.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {prettifyKey(key)}
                </dt>
                <dd className="mt-1 break-words text-sm text-slate-800">
                  {isStatusKey(key) && typeof value === "string" ? (
                    <StatusBadge status={value} />
                  ) : (
                    formatDetailValue(value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Open a record from its list to see the full details here.
          </p>
        </div>
      )}
    </div>
  );
}
