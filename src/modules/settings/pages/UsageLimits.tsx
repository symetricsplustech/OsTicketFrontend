import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Layout, TrendingUp, } from 'lucide-react';

export default function UsageLimits() {
  const { data: limits } = useGetRecordsQuery({ entity: 'plan_usage_limit', limit: 50 });
  const [selected, setSelected] = useState<any | null>(null);
  const { data: plans } = useGetRecordsQuery({ entity: 'plan', limit: 20 });

  const planLimits = limits?.records || [];
  const plansData = plans?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Layout className="h-6 w-6" /> Usage Limits</h1>
      <p className="text-sm text-gray-500">Plan quotas, rate caps, and hard-block enforcement outside AI runs</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Plan Usage Limits</h3>
        {planLimits.length > 0 ? (
          planLimits.map((l: any) => (
            <div
              key={l._id}
              onClick={() => setSelected(l)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{l.planName || l._id}</span>
                <StatusBadge status={l.status} />
              </div>
              <div className="text-xs text-gray-500">
                {l.limitType}: {l.limitValue}{l.limitUnit || ''}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No usage limits configured</p>
        )}
      </div>

      {/* Selected limit detail */}
      {selected && plansData.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Detail</h3>
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
              <p className="text-gray-500">Hard Block</p>
              <p className={selected.hardBlock ? 'text-red-600' : 'text-green-600'}>
                {selected.hardBlock ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Edit Limit</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Toggle Hard Block</button>
          </div>
        </div>
      )}

      {/* Plan selector */}
      {plansData.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-3">Select Plan</h3>
          <div className="grid grid-cols-2 gap-3">
            {plansData.map((p: any) => (
              <div
                key={p._id}
                onClick={() => setSelected({ ...selected, planName: p.name, planId: p._id })}
                className="px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-gray-400">{p.trialDays ? `• ${p.trialDays} trial days` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Add Usage Limit</button>
        <button className="btn-secondary text-sm ms-2">Import from Template</button>
      </div>
    </div>
  );
}