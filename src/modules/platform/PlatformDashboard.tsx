import { useEffect, useState } from "react";
import api from "@shared/lib/api";

type Overview = {
  summary: Record<string, number>;
  companies: Array<{ _id: string; name: string; status: string }>;
};

export default function PlatformDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Overview>("/platform/overview")
      .then((response) => setData(response.data))
      .catch(() => setError("Unable to load platform overview."));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Loading platform overview...</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">
          Central SaaS administration
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the whole platform from the dedicated control areas in the
          sidebar.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Organizations", data.summary.total || 0],
          ["Active", data.summary.active || 0],
          ["Trial", data.summary.trial || 0],
          ["Active agents", data.summary.activeAgents || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Organization status</h2>
        <div className="mt-4 space-y-3">
          {data.companies.map((company) => (
            <div
              key={company._id}
              className="flex items-center justify-between border-b pb-3 text-sm last:border-0 last:pb-0"
            >
              <span className="font-medium text-gray-800">{company.name}</span>
              <span className="capitalize text-gray-500">
                {company.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
          {data.companies.length === 0 && (
            <p className="text-sm text-gray-500">
              No organizations created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
