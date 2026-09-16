import { useEffect, useState } from "react";
import api from "@shared/lib/api";

const moduleOptions = [
  "helpdesk",
  "settings",
  "crm",
  "csm",
  "itam",
  "itom",
  "projects",
  "hr",
  "field-service",
  "workflow",
  "analytics",
  "ai",
];
type Company = { _id: string; name: string };

export default function PermissionsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [active, setActive] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get<{ companies: Company[] }>("/platform/overview")
      .then((r) => {
        setCompanies(r.data.companies);
        if (r.data.companies[0]) setCompanyId(r.data.companies[0]._id);
      })
      .catch(() => setError("Unable to load organizations."));
  }, []);
  useEffect(() => {
    if (!companyId) return;
    api
      .get<{ modules: Array<{ moduleKey: string; status: string }> }>(
        `/platform/companies/${companyId}/modules`,
      )
      .then((r) =>
        setActive(
          r.data.modules
            .filter((m) => m.status === "active")
            .map((m) => m.moduleKey),
        ),
      )
      .catch(() => setError("Unable to load organization permissions."));
  }, [companyId]);
  const save = async () => {
    try {
      await api.put(`/platform/companies/${companyId}/modules`, {
        modules: active,
      });
    } catch {
      setError("Unable to save organization permissions.");
    }
  };
  const toggle = (moduleKey: string) =>
    setActive((current) =>
      current.includes(moduleKey)
        ? current.filter((key) => key !== moduleKey)
        : [...current, moduleKey],
    );
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">Entitlements</p>
        <h1 className="mt-1 text-2xl font-bold">Organization permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose which SaaS modules each organization is allowed to use.
        </p>
      </div>
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <label className="text-sm font-medium">Organization</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="mt-2 w-full rounded border px-3 py-2"
        >
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {moduleOptions.map((moduleKey) => (
            <label
              key={moduleKey}
              className="flex items-center gap-2 rounded border p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={active.includes(moduleKey)}
                onChange={() => toggle(moduleKey)}
              />
              {moduleKey.replace(/-/g, " ")}
            </label>
          ))}
        </div>
        <button
          onClick={save}
          disabled={!companyId}
          className="mt-6 rounded bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Save permissions
        </button>
      </div>
    </div>
  );
}
