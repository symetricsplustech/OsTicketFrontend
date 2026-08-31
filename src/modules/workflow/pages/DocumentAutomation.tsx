import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Folder, Activity, Shield, } from 'lucide-react';

export default function DocumentAutomation() {
  const { data: automations } = useGetRecordsQuery({ entity: 'automation', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);
  const { data: templates } = useGetRecordsQuery({ entity: 'template', limit: 20 });

  const items = automations?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Folder className="h-6 w-6" /> Document Automation</h1>
      <p className="text-sm text-gray-500">RPA-style workflow orchestration for document processing, with approval gates and audit trails</p>

      {/* Automation list */}
      <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold mb-3">Active Automations</h3>
        {items.slice(0, 15).map((a: any) => (
          <div
            key={a._id}
            onClick={() => setSelected(a)}
            className="flex items-center justify-between py-2 px-3 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={a.status} />
              <span className="font-medium truncate">{a.name}</span>
            </div>
            <div className="text-xs text-gray-400">{a.type || 'N/A'}</div>
          </div>
        ))}
      </div>

      {/* Selected automation detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <h3 className="font-semibold mb-3">Detail: {selected.name}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{selected.type}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium text-green-600">{selected.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Trigger</p>
              <p className="font-medium">{selected.trigger || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Run</p>
              <p className="font-medium">{selected.lastRun ? new Date(selected.lastRun).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
          {selected.steps && selected.steps.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-3">Workflow Steps</p>
                {selected.steps.map((s: any, i: number) => (
                <div key={i} className="px-2 py-1 bg-gray-50 rounded text-xs">
                  <span className="font-medium">Step {i + 1}:</span> {s.action}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Run Now</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Edit Workflow</button>
            <button className="flex-1 bg-gray-100 py-2 rounded text-sm">Clone</button>
          </div>
        </div>
      )}

      {/* Template library */}
      {templates && templates?.records?.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-3">Template Library</h3>
          <div className="grid grid-cols-3 gap-3">
            {templates.records.map((t: any) => (
              <div key={t._id} className="bg-gray-50 border rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-400">{t.name}</div>
                <p className="font-medium truncated">{t.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new automation */}
      <div className="mt-4">
        <button className="btn-primary text-sm">Create New Automation</button>
        <button className="btn-secondary text-sm ms-2">Import from CSV</button>
      </div>
    </div>
  );
}