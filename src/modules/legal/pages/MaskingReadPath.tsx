import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Lock, Shield, } from 'lucide-react';

export default function MaskingReadPath() {
  const { data: rules } = useGetRecordsQuery({ entity: 'data_masking_rule', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);

  const maskingRules = rules?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6" /> Masking Read-Path Enforcement</h1>
      <p className="text-sm text-gray-500">Field-level data classification enforcement — ensures masking rules are applied on read for GDPR/DPDPA compliance</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Masking Rules — Read-Path Status</h3>
        {maskingRules.length > 0 ? (
          maskingRules.map((r: any) => (
            <div
              key={r._id}
              onClick={() => setSelected(r)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full {r.enforcedOnRead ? 'bg-green-500' : 'bg-gray-300'} animate-pulse" />
                <span className="font-medium truncate">{r.fieldName}</span>
              </div>
              <div className="text-xs text-gray-500">
                {r.maskType}: enforced on read = {r.enforcedOnRead ? '✅' : '⚠️ pending'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No masking rules configured</p>
        )}
      </div>

      {/* Selected rule detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Rule Detail</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Field Name</p>
              <p className="font-medium">{selected.fieldName || 'N/A'}</p>
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
              <p className="text-gray-500">Enforced on Read</p>
              <p className={selected.enforcedOnRead ? 'text-green-600' : 'text-red-500'}>
                {selected.enforcedOnRead ? 'Enabled' : 'Disabled — BE endpoint pending'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Toggle Read Enforcement</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Edit Rule</button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            <strong>BE Note:</strong> Read-path enforcement requires middleware modification to intercept outbound serialization and apply masking based on active ruleset.
          </p>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Create New Masking Rule</button>
        <button className="btn-secondary text-sm ms-2">Import from Policy</button>
      </div>
    </div>
  );
}