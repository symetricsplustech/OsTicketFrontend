import { useMemo } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { useGetUsageSummaryQuery } from '@shared/store/apiEndpoints';

// Module dashboard with REAL data from the generic CRUD API
export function ModuleDashboard({ entity, title }: { entity: string; title: string }) {
  const { data } = useGetRecordsQuery({ entity, limit: 500 });
  const records = data?.records || [];

  // Compute real stats
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let open = 0, closed = 0;
    for (const r of records) {
      if (r.status) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.priority) byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
      if (['closed', 'resolved'].includes(r.status)) closed++; else open++;
    }
    return { total: records.length, open, closed, byStatus, byPriority };
  }, [records]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title} Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} color="blue" />
        <StatCard label="Resolved" value={stats.closed} color="green" />
        <StatCard label="Resolution Rate" value={stats.total ? `${Math.round(stats.closed / stats.total * 100)}%` : '—'} color="purple" />
      </div>

      {/* Status distribution bars */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-3">Status Distribution</h3>
        <div className="space-y-2">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="text-xs w-24 capitalize">{status}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.byStatus), 1)) * 100)}%` }}>
                  <span className="text-[10px] text-white font-bold">{count}</span>
                </div>
              </div>
            </div>
          ))}
          {!Object.keys(stats.byStatus).length && <p className="text-sm text-gray-400">No data yet</p>}
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="grid grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map(p => (
          <div key={p} className={`rounded-lg border p-4 ${p === 'critical' ? 'border-red-200 bg-red-50' : p === 'high' ? 'border-orange-200 bg-orange-50' : 'bg-white'}`}>
            <p className="text-xs text-gray-500 capitalize">{p}</p>
            <p className="text-2xl font-bold">{stats.byPriority[p] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color?: string }) {
  const colors: Record<string, string> = { blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600' };
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color ? colors[color] : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

