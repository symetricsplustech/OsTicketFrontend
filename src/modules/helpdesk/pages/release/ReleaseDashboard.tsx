import React, { useEffect, useState } from 'react';
import { releaseApi } from '../../services/release/releaseApi';
import type { ReleaseDashboard } from '../../services/release/releaseApi';

const ReleaseDashboard: React.FC = () => {
  const [data, setData] = useState<ReleaseDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await releaseApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading release dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const statusColors: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-700', build: 'bg-yellow-100 text-yellow-700',
    test: 'bg-purple-100 text-purple-700', ready: 'bg-indigo-100 text-indigo-700',
    deploying: 'bg-orange-100 text-orange-700', completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Release Management Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Releases" value={data.totalReleases} />
        <StatCard label="Active" value={data.activeReleases} color="text-blue-600" />
        <StatCard label="Completed" value={data.completedReleases} color="text-green-600" />
        <StatCard label="Failed" value={data.failedReleases} color="text-red-600" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tasks" value={data.totalTasks} sub={`${data.completedTasks} completed`} />
        <StatCard label="Phases" value={data.totalPhases} />
        <StatCard label="Deployments" value={data.totalDeployments} />
        <StatCard label="Pending Approvals" value={data.pendingApprovals} color={data.pendingApprovals > 0 ? 'text-yellow-600' : 'text-green-600'} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Release Status</h3>
          <div className="space-y-2">
            {Object.entries(data.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Task Status</h3>
          <div className="space-y-2">
            {Object.entries(data.taskStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Issues</h3>
          <div className="space-y-2 text-red-600">
            <div className="flex justify-between"><span>Blocked Tasks</span><span className="font-medium">{data.blockedTasks}</span></div>
            <div className="flex justify-between"><span>Failed Tasks</span><span className="font-medium">{data.failedTasks}</span></div>
            <div className="flex justify-between"><span>Pending Dependencies</span><span className="font-medium">{data.pendingDependencies}</span></div>
            <div className="flex justify-between"><span>Blocked Dependencies</span><span className="font-medium">{data.blockedDependencies}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Deployments</h3>
          <div className="space-y-2">
            {Object.entries(data.deploymentStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </div>
);

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700', build: 'bg-yellow-100 text-yellow-700',
  test: 'bg-purple-100 text-purple-700', ready: 'bg-indigo-100 text-indigo-700',
  deploying: 'bg-orange-100 text-orange-700', completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700',
};

export default ReleaseDashboard;
