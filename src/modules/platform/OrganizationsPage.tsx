import { useEffect, useState } from "react";
import api from "@shared/lib/api";

type Company = {
  _id: string;
  name: string;
  domain?: string;
  email?: string;
  supportEmail?: string;
  status: string;
  billingCycle?: string;
  planExpiresAt?: string;
};
const statuses = [
  "pending_verification",
  "trial",
  "active",
  "grace",
  "restricted",
  "suspended",
  "expired",
  "archived",
  "terminated",
];
const blank = {
  name: "",
  domain: "",
  email: "",
  supportEmail: "",
  billingCycle: "monthly",
};

export default function OrganizationsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const response = await api.get<{ companies: Company[] }>(
        "/platform/overview",
      );
      setCompanies(response.data.companies);
    } catch {
      setError("Unable to load organizations.");
    }
  };
  useEffect(() => {
    load();
  }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      editing
        ? await api.put(`/platform/companies/${editing._id}`, form)
        : await api.post("/platform/companies", form);
      setEditing(null);
      setForm(blank);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to save organization.");
    }
  };
  const edit = (company: Company) => {
    setEditing(company);
    setForm({
      name: company.name,
      domain: company.domain || "",
      email: company.email || "",
      supportEmail: company.supportEmail || "",
      billingCycle: company.billingCycle || "monthly",
    });
  };
  const status = async (id: string, value: string) => {
    try {
      await api.patch(`/platform/companies/${id}/status`, { status: value });
      await load();
    } catch {
      setError("Unable to update status.");
    }
  };
  const remove = async (company: Company) => {
    if (!window.confirm(`Delete ${company.name}?`)) return;
    try {
      await api.delete(`/platform/companies/${company._id}`);
      await load();
    } catch {
      setError("Unable to delete organization.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">SaaS control plane</p>
        <h1 className="mt-1 text-2xl font-bold">Organizations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage every company in the platform.
        </p>
      </div>
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-lg border bg-white shadow-sm">
        <form
          onSubmit={save}
          className="grid gap-3 border-b bg-gray-50 p-5 md:grid-cols-2"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Organization name"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            placeholder="Domain"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Billing email"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            placeholder="Support email"
            className="rounded border px-3 py-2 text-sm"
          />
          <select
            value={form.billingCycle}
            onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="monthly">Monthly billing</option>
            <option value="yearly">Yearly billing</option>
          </select>
          <div className="flex gap-2">
            <button className="rounded bg-brand-600 px-4 py-2 text-sm text-white">
              {editing ? "Save changes" : "Create organization"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
                className="rounded border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="divide-y">
          {companies.map((company) => (
            <div
              key={company._id}
              className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-center"
            >
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-500">
                  {company.domain || "No domain"}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {company.billingCycle || "monthly"} billing
              </span>
              <select
                value={company.status}
                onChange={(e) => status(company._id, e.target.value)}
                className="rounded-full border px-2 py-1 text-xs capitalize"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {company.planExpiresAt
                  ? new Date(company.planExpiresAt).toLocaleDateString()
                  : "No expiry"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => edit(company)}
                  className="text-sm text-brand-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(company)}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <p className="p-5 text-sm text-gray-500">No organizations found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
