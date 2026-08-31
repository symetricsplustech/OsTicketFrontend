import { useState } from 'react';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { RecordDrawer } from '@shared/components/RecordDrawer';
import { Scale, Search } from 'lucide-react';

export default function ClauseLibraryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'clauses' | 'matters' | 'holds'>('clauses');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="h-6 w-6" /> Clause Library & Investigations</h1>
      <div className="flex gap-1 border-b">
        {(['clauses', 'matters', 'holds'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 'clauses' && (
        <EntityPage entity="clause_item" title="Clause Library" columns={[
          { key: 'title', label: 'Clause' },
          { key: 'category', label: 'Category' },
          { key: 'riskNotes', label: 'Risk Notes' },
        ]} />
      )}

      {tab === 'matters' && (
        <EntityPage entity="legal_matter" title="Legal Matters" columns={[
          { key: 'title', label: 'Matter' },
          { key: 'practiceArea', label: 'Practice Area' },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          { key: 'privilege', label: 'Privileged', render: v => v ? 'Yes' : '—' },
        ]} />
      )}

      {tab === 'holds' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Legal Holds</h3>
          <p className="text-sm text-gray-500 mb-4">Holds prevent data disposal. Open a matter to view its custody holds and acknowledgements.</p>
          <EntityPage entity="legal_matter" title="" columns={[
            { key: 'title', label: 'Matter' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
          ]} />
        </div>
      )}
    </div>
  );
}
