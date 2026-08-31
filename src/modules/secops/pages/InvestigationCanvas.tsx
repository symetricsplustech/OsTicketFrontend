import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { RecordDrawer } from '@shared/components/RecordDrawer';
import { ShieldCheck, Activity, Layers, Palette } from 'lucide-react';

export default function InvestigationCanvas() {
  const { data: cases } = useGetRecordsQuery({ entity: 'incident', limit: 30 });
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const { data: evidence } = useGetRecordsQuery({ entity: 'evidence', limit: 30 });

  const incidents = cases?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Investigation Canvas</h1>
      <p className="text-sm text-gray-500">Incident investigation, evidence, and campaign tracking</p>

      {/* Case list */}
      <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold mb-3">Active Incidents</h3>
        {incidents.slice(0, 15).map((c: any) => (
          <div
            key={c._id}
            onClick={() => setSelectedCase(c)}
            className="flex items-center justify-between py-2 px-3 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={c.status} />
              <span className="font-medium truncate">{c.title}</span>
            </div>
            <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {/* Evidence panel */}
      <div className="bg-white border rounded-lg p-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <h3 className="font-semibold mb-3">Evidence ({evidence?.records?.length || 0})</h3>
        {evidence?.records?.length > 0 ? (
          evidence.records.map((e: any) => (
            <div key={e._id} className="flex items-center gap-2 text-xs text-gray-500 py-1 border-b last:border-0">
              <Layers className="w-3 h-3 text-gray-300" />
              <span>{e.type}: {e.description || e.name}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No evidence logged</p>
        )}
      </div>

      {/* Campaign board */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-gray-400" /> Campaign Board</h3>
        <p className="text-xs text-gray-400 mb-3">Track investigation campaigns and their outcomes</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Active</div>
            <p className="font-medium text-brand-600">5</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Resolved</div>
            <p className="font-medium text-green-600">12</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">On Hold</div>
            <p className="font-medium text-gray-600">3</p>
          </div>
        </div>
      </div>

      {/* Selected case detail drawer */}
      {selectedCase && (
        <RecordDrawer entity="incident" id={selectedCase._id} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
}