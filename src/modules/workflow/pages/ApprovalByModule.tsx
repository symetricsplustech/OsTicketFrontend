import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { RecordDrawer } from '@shared/components/RecordDrawer';
import { StatusBadge } from '@shared/components/RecordTable';

const MODULE_TABS = ['helpdesk', 'crm', 'finance', 'grc', 'procurement'] as const;

export default function ApprovalInboxByModule() {
  const [activeTab, setActiveTab] = useState<typeof MODULE_TABS[number]>('helpdesk');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  const { data } = useGetRecordsQuery({
    entity: activeTab === 'helpdesk' ? 'change' : activeTab === 'crm' ? 'opportunity' : 'finance_case',
    limit: 50,
  });
  const pending = (data?.records || []).filter((r: any) => ['pending_approval', 'pending'].includes(r.status));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Approval Inbox</h1>
      <div className="flex gap-1 border-b">
        {MODULE_TABS.map(m => (
          <button key={m} onClick={() => setActiveTab(m)}
            className={`px-3 py-2 text-sm capitalize ${activeTab === m ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>
            {m} {activeTab === m && <span className="ml-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">{pending.length}</span>}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {pending.length === 0 && <p className="p-8 text-center text-gray-400">No pending approvals in {activeTab}</p>}
        {pending.map((r: any) => (
          <div key={r._id} onClick={() => { setSelectedId(r._id); setSelectedEntity(activeTab === 'helpdesk' ? 'change' : activeTab === 'crm' ? 'opportunity' : 'finance_case'); }}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="text-sm font-medium">{r.title || r.name || r.number}</p>
              <p className="text-xs text-gray-500">{r.category || r.caseType || r.stage} · raised {new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>

      {selectedId && <RecordDrawer entity={selectedEntity} id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
