import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Download, Shield, } from 'lucide-react';

export default function PitrAutomation() {
  const { data: backupTests } = useGetRecordsQuery({ entity: 'backup_test', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);

  const backupData = backupTests?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Download className="h-6 w-6" /> PITR Automation</h1>
      <p className="text-sm text-gray-500">Point-in-time recovery, backup dump automation, and restore testing</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Backup & Restore Tests</h3>
        {backupData.length > 0 ? (
          backupData.map((b: any) => (
            <div
              key={b._id}
              onClick={() => setSelected(b)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={b.status} />
                <span className="font-medium truncate">{b.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {b.type}: {b.frequency || '—'} • {b.lastRun ? new Date(b.lastRun).toLocaleDateString() : 'Never ran'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No backup tests configured</p>
        )}
      </div>

      {/* Selected backup test detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Test Detail</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{selected.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{selected.type || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className={selected.status === 'success' ? 'text-green-600' : selected.status === 'failed' ? 'text-red-500' : 'text-gray-500'}>
                {selected.status}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Run</p>
              <p className="font-medium">{selected.lastRun ? new Date(selected.lastRun).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Run Restore Test</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Edit Schedule</button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            <strong>BE Note:</strong> Dump automation absent per checklist 23.11 — backup test records only; automation of restore piping not yet implemented.
          </p>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Create New Backup Test</button>
        <button className="btn-secondary text-sm ms-2">Import Configuration</button>
      </div>
    </div>
  );
}