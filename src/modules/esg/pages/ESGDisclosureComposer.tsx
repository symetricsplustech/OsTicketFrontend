import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Palette, TrendingUp, CheckCircle, Folder, Link } from 'lucide-react';
import { useState } from 'react';

export default function ESGDisclosureComposer() {
  const { data: initiatives } = useGetRecordsQuery({ entity: 'esg_initiative', limit: 30 });
  const [selectedInitiative, setSelectedInitiative] = useState<any | null>(null);
  const [disclosureText, setDisclosureText] = useState<string>('');

  const initiativesData = initiatives?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Palette className="h-6 w-6" /> ESG Disclosure</h1>
      <p className="text-sm text-gray-500">Sustainability reporting, initiative tracking, and project linkage</p>

      {/* Initiative list */}
      <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold mb-3">ESG Initiatives</h3>
        {initiativesData.slice(0, 15).map((i: any) => (
          <div
            key={i._id}
            onClick={() => setSelectedInitiative(i)}
            className="flex items-center justify-between py-2 px-3 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <StatusBadge status={i.status || 'draft'} />
              <span className="font-medium truncate">{i.name}</span>
            </div>
            <div className="text-xs text-gray-400">{i.framework || '—'}</div>
          </div>
        ))}
      </div>

      {/* Disclosure composer */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-3">Disclosure Statement</h3>
        <textarea
          value={disclosureText}
          onChange={e => setDisclosureText(e.target.value)}
          placeholder="Enter ESG disclosure text... (auto-linked to selected initiative)"
          className="w-full p-3 border rounded-lg text-sm resize-y h-32 focus:outline-none focus:border-brand-400"
        />
        <div className="mt-3 flex gap-2">
          <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Generate Disclosure</button>
          <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Cancel</button>
        </div>
      </div>

      {selectedInitiative && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold">Initiative Details</h3>
            <p className="text-sm text-gray-500"><strong>Framework:</strong> {selectedInitiative.framework || '—'}</p>
            <p className="text-sm text-gray-500"><strong>Status:</strong> {selectedInitiative.status || '—'}</p>
            <p className="text-sm text-gray-500"><strong>Target Year:</strong> {selectedInitiative.targetYear || '—'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Project Linkage</h3>
            <p className="text-sm text-gray-500">Linked to active projects</p>
            <button className="text-xs text-brand-600 underline mt-2 block">View Project Details</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{initiativesData.filter((i: any) => i.status === 'active').length}</div>
          <p className="text-xs text-gray-500 mt-1">Active Initiatives</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{initiativesData.filter((i: any) => i.status === 'at_risk').length}</div>
          <p className="text-xs text-gray-500 mt-1">At Risk</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{initiativesData.filter((i: any) => i.status === 'completed').length}</div>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
      </div>
    </div>
  );
}
