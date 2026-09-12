import React, { useEffect, useState } from 'react';
import { cmdbApi } from '../../services/cmdb/cmdbApi';
import type { CmdbDashboard } from '../../services/cmdb/cmdbApi';

const CmdbDashboard: React.FC = () => {
  const [data, setData] = useState<CmdbDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await cmdbApi.getDashboard();
        setData(res.data.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading CMDB dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const criticalityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
    non_critical: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">CMDB / Service Portfolio Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Portfolios" value={data.activePortfolios} sub={`${data.portfolios} total`} />
        <StatCard label="Business Services" value={data.activeBusinessServices} sub={`${data.businessServices} total`} />
        <StatCard label="Technical Services" value={data.activeTechnicalServices} sub={`${data.technicalServices} total`} />
        <StatCard label="Service Offerings" value={data.activeOfferings} sub={`${data.offerings} total`} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="CIs" value={data.cis} color="text-blue-600" />
        <StatCard label="Health Score" value={`${Math.round(data.healthScore)}%`} color={data.healthScore >= 90 ? 'text-green-600' : data.healthScore >= 70 ? 'text-yellow-600' : 'text-red-600'} />
        <StatCard label="Relationships" value={data.relationships} />
        <StatCard label="Dependencies" value={data.dependencies} />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">CI Criticality</h3>
          <div className="space-y-2">
            {Object.entries(data.ciCriticalityBreakdown).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${criticalityColors[level] || 'bg-gray-100 text-gray-700'}`}>{level}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">CI Status</h3>
          <div className="space-y-2">
            {Object.entries(data.ciStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Compliance</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-red-600">
              <span>Stale CIs (90+ days)</span>
              <span className="font-medium">{data.staleCIs}</span>
            </div>
            <div className="flex items-center justify-between text-orange-600">
              <span>Uncertified CIs</span>
              <span className="font-medium">{data.uncertifiedCIs}</span>
            </div>
            <div className="flex items-center justify-between text-yellow-600">
              <span>No Owner</span>
              <span className="font-medium">{data.noOwnerCIs}</span>
            </div>
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

export default CmdbDashboard;
