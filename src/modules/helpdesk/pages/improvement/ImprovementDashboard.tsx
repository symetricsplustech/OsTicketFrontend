import React, { useEffect, useState } from 'react';
import { improvementApi, ImprovementDashboard as DashboardType } from '../../services/improvement/improvementApi';

const ImprovementDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await improvementApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading improvement dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700', qualified: 'bg-indigo-100 text-indigo-700',
    approved: 'bg-green-100 text-green-700', on_hold: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700', converted: 'bg-purple-100 text-purple-700',
    implemented: 'bg-green-100 text-green-700', planned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700',
    achieved: 'bg-green-100 text-green-700', at_risk: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Continual Improvement Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Opportunities" value={data.totalOpportunities} sub={`${data.opportunitiesByStatus?.new || 0} new`} />
        <StatCard label="Initiatives" value={data.totalInitiatives} sub={`${data.initiativesByStatus?.in_progress || 0} active`} />
        <StatCard label="Tasks" value={data.totalTasks} sub={`${data.tasksByStatus?.in_progress || 0} in progress`} />
        <StatCard label="Goals" value={data.totalGoals} sub={`${data.goalsByStatus?.achieved || 0} achieved`} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="ROI" value={`${data.roi}%`} color={data.roiPositive ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="Est. Benefits" value={`$${(data.estimatedBenefits / 1000).toFixed(1)}k`} />
        <StatCard label="Actual Costs" value={`$${(data.actualCosts / 1000).toFixed(1)}k`} />
        <StatCard label="ROI Positive" value={data.roiPositive ? 'Yes' : 'No'} color={data.roiPositive ? 'text-green-600' : 'text-red-600'} />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Opportunities by Status</h3>
          <div className="space-y-2">
            {Object.entries(data.opportunitiesByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Initiatives by Status</h3>
          <div className="space-y-2">
            {Object.entries(data.initiativesByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Goals & Targets</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Goals Achieved</span><span className="font-medium text-green-600">{data.achievedGoals} / {data.totalGoals}</span></div>
            <div className="flex justify-between"><span>Goals At Risk</span><span className="font-medium text-orange-600">{data.atRiskGoals}</span></div>
            <div className="flex justify-between"><span>Targets Achieved</span><span className="font-medium text-green-600">{data.achievedTargets}</span></div>
            <div className="flex justify-between"><span>Targets At Risk</span><span className="font-medium text-orange-600">{data.atRiskTargets}</span></div>
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
  new: 'bg-blue-100 text-blue-700', qualified: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-green-100 text-green-700', on_hold: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700', converted: 'bg-purple-100 text-purple-700',
  implemented: 'bg-green-100 text-green-700', planned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700',
  achieved: 'bg-green-100 text-green-700', at_risk: 'bg-orange-100 text-orange-700',
};

export default ImprovementDashboard;
