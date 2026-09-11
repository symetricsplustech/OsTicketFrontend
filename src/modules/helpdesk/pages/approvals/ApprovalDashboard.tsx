import React, { useEffect, useState } from 'react';
import { approvalEngineApi, ApprovalDashboard as DashboardType } from '../../services/approvals/approvalEngineApi';

const ApprovalDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardType | null>(null);
  const [pending, setPending] = useState<Array<{ _id: string; number: string; title: string; entityType: string; status: string; dueAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashRes, pendingRes] = await Promise.all([
          approvalEngineApi.getDashboard(),
          approvalEngineApi.getPendingForUser(),
        ]);
        setData(dashRes.data.data);
        setPending(pendingRes.data.data as never[]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading approval dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700', expired: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-700', skipped: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Approval Engine Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card label="Definitions" value={data.totalDefinitions} sub={`${data.activeDefinitions} active`} />
        <Card label="Total Instances" value={data.totalInstances} />
        <Card label="Overdue" value={data.overdue} color={data.overdue > 0 ? 'text-red-600' : 'text-green-600'} />
        <Card label="Avg Completion" value={`${data.avgCompletionHours}h`} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Status Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(data.statusCounts || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Entity Types</h2>
          <div className="space-y-2">
            {Object.entries(data.entityTypeBreakdown || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">My Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-gray-500">No pending approvals</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th>Number</th><th>Title</th><th>Type</th><th>Due</th></tr></thead>
            <tbody>
              {pending.map(p => (
                <tr key={p._id} className="border-t">
                  <td className="py-2 font-medium">{p.number}</td>
                  <td>{p.title}</td>
                  <td><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{p.entityType}</span></td>
                  <td className={p.dueAt && new Date(p.dueAt) < new Date() ? 'text-red-600' : 'text-gray-500'}>{p.dueAt ? new Date(p.dueAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </div>
);

export default ApprovalDashboard;
