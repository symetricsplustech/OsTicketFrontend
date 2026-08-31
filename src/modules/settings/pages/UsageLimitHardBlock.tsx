import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Shield, AlertCircle, Layout, } from 'lucide-react';

export default function UsageLimitHardBlock() {
  const { data: limits } = useGetRecordsQuery({ entity: 'plan_usage_limit', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);
  const { data: alerts } = useGetRecordsQuery({ entity: 'alert', limit: 20 });

  const planLimits = limits?.records || [];
  const recentAlerts = alerts?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Usage Limit Hard-Block</h1>
      <p className="text-sm text-gray-500">Hard-block enforcement outside AI runs — prevents exceeding plan quotas and usage limits</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Plan Usage Limits with Hard-Block</h3>
        {planLimits.length > 0 ? (
          planLimits.map((l: any) => (
            <div
              key={l._id}
              onClick={() => setSelected(l)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{l.planName || l._id}</span>
                <StatusBadge status={l.hardBlockEnabled ? 'active' : 'inactive'} />
              </div>
              <div className="text-xs text-gray-500">
                {l.limitType}: {l.currentValue}/{l.limitValue} ({l.percentUsed || '0'}%)
              </div>
              {l.hardBlockEnabled && (
                <span className="ml-2 text-xs text-red-500">⚠️ Hard-block active</span>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No usage limits configured</p>
        )}
      </div>

      {/* Selected limit detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Limit Detail</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Plan</p>
              <p className="font-medium">{selected.planName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Limit Type</p>
              <p className="font-medium">{selected.limitType}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Value</p>
              <p className="font-medium">{selected.currentValue || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Hard-Block Status</p>
              <p className={selected.hardBlockEnabled ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                {selected.hardBlockEnabled ? 'ENABLED — Blocks AI runs & operations' : 'DISABLED — Allows operations'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            {selected.hardBlockEnabled ? 'This limit will block AI runs, workflow executions, and data operations when the threshold is exceeded.' : 'Hard-block can be enabled from this detail view.'}
          </p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm">Toggle Hard-Block</button>
          </div>
        </div>
      )}

      {/* Recent alerts from hard-block enforcement */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Recent Hard-Block Alerts</h3>
        {recentAlerts.length > 0 ? (
          recentAlerts.map((a: any) => (
            <div
              key={a._id}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="font-medium truncate">{a.title}</span>
              </div>
              <div className="text-xs text-gray-500">
                {a.plan} · {new Date(a.createdAt).toLocaleDateString()} · {a.severity}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No hard-block alerts in last 30 days</p>
        )}
      </div>

      <div className="mt-4">
        <button className="btn-primary text-sm">Review Limit Configurations</button>
        <button className="btn-secondary text-sm ms-2">Export Usage Report</button>
      </div>
    </div>
  );
}