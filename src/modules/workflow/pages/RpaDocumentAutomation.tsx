import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Folder, Server, } from 'lucide-react';

export default function RpaDocumentAutomation() {
  const { data: automations } = useGetRecordsQuery({ entity: 'automation', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);

  const items = automations?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Folder className="h-6 w-6" /> RPA Document Automation</h1>
      <p className="text-sm text-gray-500">Saved-page model, builder/renderer UI for document workflow automation, with versioned draft/publish/rollback</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Automation Workflows</h3>
        {items.length > 0 ? (
          items.map((a: any) => (
            <div
              key={a._id}
              onClick={() => setSelected(a)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                <span className="font-medium truncate">{a.name}</span>
              </div>
              <div className="text-xs text-gray-500">{a.type || 'N/A'}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No automations configured</p>
        )}
      </div>

      {/* Selected automation detail */}
      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Workflow Detail</h3>
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
              <p className={selected.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                {selected.status}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Steps</p>
              <p className="font-medium">{selected.steps ? selected.steps.length : 0}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Edit Workflow</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Clone</button>
            <button className="flex-1 bg-gray-100 py-2 rounded text-sm">Delete</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Create New Automation</button>
        <button className="btn-secondary text-sm ms-2">Import from Template</button>
      </div>
    </div>
  );
}