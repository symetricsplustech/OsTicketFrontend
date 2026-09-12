import React, { useEffect, useState } from "react";
import {
  assignmentApi,
  AssignmentDashboard as DashboardType,
} from "../../services/assignments/assignmentApi";

const AssignmentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await assignmentApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <div className="p-6">Loading assignment dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const presenceEntries = Object.entries(data.agentPresence || {});
  const presenceColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    online: "bg-green-100 text-green-700",
    busy: "bg-yellow-100 text-yellow-700",
    away: "bg-orange-100 text-orange-700",
    offline: "bg-gray-100 text-gray-700",
    on_break: "bg-blue-100 text-blue-700",
    in_meeting: "bg-purple-100 text-purple-700",
    dnd: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assignment & Routing Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card label="Queues" value={data.queues} />
        <Card
          label="Active Rules"
          value={data.activeRules}
          sub={`${data.assignmentRules} total`}
        />
        <Card
          label="Routing Rules"
          value={data.activeRoutingRules}
          sub={`${data.routingRules} total`}
        />
        <Card
          label="Skills"
          value={data.activeSkills}
          sub={`${data.skills} total`}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Card label="Total Agents" value={data.agents} />
        <Card
          label="Utilization"
          value={`${data.utilizationPercent}%`}
          color={
            data.utilizationPercent > 90
              ? "text-red-600"
              : data.utilizationPercent > 70
                ? "text-yellow-600"
                : "text-green-600"
          }
        />
        <Card
          label="Overloaded"
          value={data.overloaded}
          color={data.overloaded > 0 ? "text-red-600" : "text-green-600"}
        />
        <Card
          label="Open Tickets"
          value={data.openTickets}
          sub={`${data.totalTickets} total`}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Agent Presence</h2>
          <div className="space-y-2">
            {presenceEntries.length === 0 ? (
              <p className="text-gray-500">No presence data</p>
            ) : (
              presenceEntries.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs ${presenceColors[status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {status}
                  </span>
                  <span className="font-medium">
                    {count} agent{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Capacity Overview</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Total Capacity:</span>{" "}
              <span className="font-medium">{data.totalCapacity}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Current Load:</span>{" "}
              <span className="font-medium">{data.totalLoad}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${data.utilizationPercent > 90 ? "bg-red-500" : data.utilizationPercent > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(data.utilizationPercent, 100)}%` }}
              />
            </div>
            <div>
              <span className="text-sm text-gray-500">Overloaded Agents:</span>{" "}
              <span
                className={`font-medium ${data.overloaded > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {data.overloaded}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-2xl font-bold ${color || "text-gray-900"}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </div>
);

export default AssignmentDashboard;
