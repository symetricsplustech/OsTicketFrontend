import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Shield, Lock, } from 'lucide-react';

export default function MaskingRules() {
  const { data: rules } = useGetRecordsQuery({ entity: 'data_masking_rule', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);

  const maskingRules = rules?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Data Masking</h1>
      <p className="text-sm text-gray-500">Field-level data classification and masking enforcement for GDPR/DPDPA compliance</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Masking Rules</h3>
        {maskingRules.length > 0 ? (
          maskingRules.map((r: any) => (
            <div
              key={r._id}
              onClick={() => setSelected(r)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full {r.enabled ? 'bg-green-500' : 'bg-gray-300'} animate-pulse" />
                <span className="font-medium truncate">{r.fieldName}</span>
              </div>
              <div className="text-xs text-gray-500">{r.maskType}: {r.pattern || '—'}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No masking rules configured</p>
        )}
      </div>

      {/* Selected rule detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <h3 className="font-semibold mb-3">Rule Detail</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Field</p>
              <p className="font-medium">{selected.fieldName}</p>
            </div>
            <div>
              <p className="text-gray-500">Mask Type</p>
              <p className="font-medium text-green-600">{selected.maskType}</p>
            </div>
            <div>
              <p className="text-gray-500">Pattern</p>
              <p className="font-medium">{selected.pattern || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Enabled</p>
              <p className={selected.enabled ? 'text-green-600' : 'text-red-600'}>{selected.enabled ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Edit Rule</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Toggle Enabled</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Create New Masking Rule</button>
        <button className="btn-secondary text-sm ms-2">Import from Policy</button>
      </div>
    </div>
  );
}