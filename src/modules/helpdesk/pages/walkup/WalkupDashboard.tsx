import React, { useEffect, useState } from "react";
import { walkupApi } from "../../services/walkup/walkupApi";
import type { WalkupDashboard } from "../../services/walkup/walkupApi";

const WalkupDashboard: React.FC = () => {
  const [data, setData] = useState<WalkupDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await walkupApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading walk-up dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Walk-Up Experience Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Locations"
          value={data.activeLocations}
          sub={`${data.totalLocations} total`}
        />
        <StatCard
          label="Services"
          value={data.activeServices}
          sub={`${data.totalServices} total`}
        />
        <StatCard
          label="Queues"
          value={data.openQueues}
          sub={`${data.totalQueues} total`}
        />
        <StatCard
          label="Avg Wait"
          value={`${data.avgWaitMinutes} min`}
          color={data.avgWaitMinutes > 30 ? "text-red-600" : "text-green-600"}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Check-ins" value={data.activeCheckins} />
        <StatCard
          label="Waiting"
          value={data.waitingCount}
          color="text-yellow-600"
        />
        <StatCard
          label="In Service"
          value={data.inServiceCount}
          color="text-blue-600"
        />
        <StatCard label="Upcoming Appts" value={data.upcomingAppointments} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatCard
          label="Kiosks Online"
          value={data.onlineKiosks}
          sub={`${data.totalKiosks} total`}
          color={
            data.onlineKiosks === data.totalKiosks
              ? "text-green-600"
              : "text-yellow-600"
          }
        />
        <StatCard label="Interactions" value={data.totalInteractions} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
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

export default WalkupDashboard;
