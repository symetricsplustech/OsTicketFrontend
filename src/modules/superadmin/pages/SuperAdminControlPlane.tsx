import { useEffect, useState } from "react";
import api from "@shared/lib/api";
import toast from "react-hot-toast";
import { Plus, RefreshCw, ShieldCheck } from "lucide-react";

const TYPES = [
  ["integration", "Integrations"],
  ["email_domain", "Email Infrastructure"],
  ["storage_policy", "Storage & Retention"],
  ["backup", "Backups"],
  ["disaster_recovery", "Disaster Recovery"],
  ["compliance_policy", "Compliance"],
  ["support_incident", "SaaS Support"],
  ["announcement", "Announcements"],
  ["abuse_case", "Abuse Management"],
  ["api_key", "API Management"],
  ["license", "Licensing"],
  ["migration", "Tenant Migration"],
  ["feature_flag", "Feature Rollout"],
] as const;

export default function SuperAdminControlPlane() {
  const [kind, setKind] = useState<string>("integration");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      setItems((await api.get(`/superadmin/control/${kind}`)).data?.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to load platform resources",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [kind]);
  const create = async () => {
    const name = window
      .prompt(`Name for the new ${kind.replace(/_/g, " ")}:`)
      ?.trim();
    if (!name) return;
    try {
      const response = await api.post(`/superadmin/control/${kind}`, {
        name,
        status: "active",
      });
      if (response.data?.secret)
        window.alert(
          `Copy this API key now. It will not be shown again:\n\n${response.data.secret}`,
        );
      toast.success("Created");
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Create failed");
    }
  };
  const updateStatus = async (item: any, status: string) => {
    try {
      await api.put(`/superadmin/control/${kind}/${item._id}`, { status });
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Control Plane</h1>
          <p className="mt-1 text-sm text-gray-500">
            Global infrastructure, compliance, rollout, support and tenant
            operations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-lg border p-2"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={create}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setKind(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${kind === value ? "bg-purple-600 text-white" : "border bg-white text-gray-600"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tenant / Scope</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {item.tenant?.name || item.region || "Global"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item, e.target.value)}
                    className="rounded border px-2 py-1"
                  >
                    <option>active</option>
                    <option>paused</option>
                    <option>resolved</option>
                    <option>revoked</option>
                    <option>failed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !items.length && (
          <div className="flex flex-col items-center gap-2 p-12 text-gray-400">
            <ShieldCheck className="h-8 w-8" />
            <p>No resources configured for this area.</p>
          </div>
        )}
      </div>
    </div>
  );
}
