import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { TrendingUp, CheckCircle, Folder, Link } from 'lucide-react';
import { useState } from 'react';

export default function SupplierESGQuestionnaires() {
  const { data: questionnaires } = useGetRecordsQuery({ entity: 'supplier_esg', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);

  const items = questionnaires?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Supplier ESG Questionnaires</h1>
      <p className="text-sm text-gray-500">Weighted ESG scoring for suppliers, with questionnaire responses and tier ratings</p>

      <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold mb-3">Active Questionnaires</h3>
        {items.slice(0, 15).map((q: any) => (
          <div
            key={q._id}
            onClick={() => setSelected(q)}
            className="flex items-center justify-between py-2 px-3 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={q.status || 'draft'} />
              <span className="font-medium truncate">{q.name}</span>
            </div>
            <div className="text-xs text-gray-400">
              {q.tier} - {q.score ? q.score + '/100' : 'N/A'} - {new Date(q.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Detail: {selected.name}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Framework</p>
              <p className="font-medium">{selected.framework || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Tier</p>
              <p className="font-medium text-green-600">{selected.tier || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Score</p>
              <p className="font-medium text-green-600">{selected.score || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Assessment</p>
              <p className="font-medium">{new Date(selected.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">{selected.responses || 'No responses recorded'}</p>
          <div className="mt-3">
            <button className="btn-primary text-sm w-full">Edit Responses</button>
            <button className="btn-secondary text-sm w-full mt-2">Download Report</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Create New ESG Questionnaire</button>
        <button className="btn-secondary text-sm ms-2">Clone Template</button>
      </div>
    </div>
  );
}
