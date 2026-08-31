import { useGetContractorsV2Query, useAssignContractorV2Mutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Users2, CheckCircle, XCircle } from 'lucide-react';

interface Contractor {
  _id?: string;
  id?: string;
  name?: string;
  company?: string;
  skills?: string[];
  rating?: number;
  status?: string;
  hourlyRate?: number;
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  assigned: 'bg-blue-100 text-blue-700',
  busy: 'bg-amber-100 text-amber-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export default function ContractorMarketplace() {
  const { data, isLoading } = useGetContractorsV2Query();
  const [assignContractorV2] = useAssignContractorV2Mutation();

  const contractors: Contractor[] = data ?? [];
  const [woIds, setWoIds] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const assign = async (c: Contractor) => {
    const id = c._id || c.id || '';
    const workOrder = (woIds[id] || '').trim();
    if (!id || !workOrder) return;
    setBusyId(id);
    try {
      await assignContractorV2({ contractor: id, workOrder }).unwrap();
      setResults((prev) => ({ ...prev, [id]: 'Assigned' }));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [id]: err?.data?.error || err?.data?.message || 'Assignment failed.' }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Contractor Marketplace</h1>
      </div>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading contractors…</p>
      ) : contractors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-500">No contractors available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contractors.map((c) => {
            const id = c._id || c.id || '';
            const rating = Math.round(c.rating ?? 0);
            const status = (c.status || 'unknown').toLowerCase();
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{c.company || '—'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-600'}`}>
                    {c.status || 'unknown'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(c.skills) ? c.skills : []).map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-500 tracking-wide" title={`${c.rating ?? 0} / 5`}>
                    {'★'.repeat(rating)}
                    <span className="text-gray-200">{'★'.repeat(Math.max(0, 5 - rating))}</span>
                  </span>
                  <span className="text-gray-900 font-medium">${c.hourlyRate ?? 0}/hr</span>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-100">
                  <input
                    value={woIds[id] || ''}
                    onChange={(e) => setWoIds((prev) => ({ ...prev, [id]: e.target.value }))}
                    placeholder="Work order ID"
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => assign(c)}
                    disabled={busyId === id || !(woIds[id] || '').trim()}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
                {results[id] && (
                  <p className={`inline-flex items-center gap-1 text-xs ${results[id] === 'Assigned' ? 'text-green-600' : 'text-red-600'}`}>
                    {results[id] === 'Assigned' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {results[id]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
