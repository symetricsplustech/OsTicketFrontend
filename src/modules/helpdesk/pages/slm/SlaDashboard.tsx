import React, { useEffect, useState } from 'react';
import { slmApi, SLADashboard } from '../../services/slm/slmApi';

const SlaDashboard: React.FC = () => {
  const [data, setData] = useState<SLADashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await slmApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading SLA dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Service Level Management Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Plans" value={data.totalPlans} />
        <StatCard label="Active Plans" value={data.activePlans} />
        <StatCard label="Response Compliance" value={`${data.responseCompliance}%`} color={data.responseCompliance >= 95 ? 'text-green-600' : data.responseCompliance >= 80 ? 'text-yellow-600' : 'text-red-600'} />
        <StatCard label="Resolution Compliance" value={`${data.resolutionCompliance}%`} color={data.resolutionCompliance >= 95 ? 'text-green-600' : data.resolutionCompliance >= 80 ? 'text-yellow-600' : 'text-red-600'} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">SLA Plans</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th>Plan</th><th>Schedule</th><th>Status</th><th>Response</th><th>Resolution</th></tr></thead>
            <tbody>
              {data.planStats.map((p, i) => (
                <tr key={i} className="border-t"><td className="py-2">{p.name}</td><td>{p.schedule}</td><td><span className={`px-2 py-1 rounded text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span></td><td>{p.firstResponse ? `${p.firstResponse}m` : '-'}</td><td>{p.resolution ? `${p.resolution}m` : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Breaches</h2>
          <ul className="space-y-2">
            {data.recentBreaches.length === 0 ? <li className="text-gray-500">No recent breaches</li> : data.recentBreaches.map((b, i) => (
              <li key={i} className="text-sm border-b pb-2">
                <span className="font-medium">{(b.ticket as unknown as { number: string })?.number || 'N/A'}</span>
                <span className="ml-2 text-red-600">Breach</span>
                <span className="ml-2 text-gray-500">{new Date(b.occurredAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</div>
  </div>
);

export default SlaDashboard;
