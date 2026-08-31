import { useGetQuoteVersionsQuery, useAddQuoteVersionMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { FileStack, XCircle } from 'lucide-react';

interface QuoteVersion {
  _id: string;
  version?: number | string;
  createdAt?: string;
  snapshot?: { total?: number; [k: string]: any };
}

export default function QuoteVersions() {
  const [quoteIdInput, setQuoteIdInput] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const { data: versions, isLoading, error, refetch } = useGetQuoteVersionsQuery(quoteId, { skip: !quoteId });
  const [addQuoteVersion, { isLoading: creating }] = useAddQuoteVersionMutation();
  const [err, setErr] = useState<string | null>(null);

  const handleSnapshot = async () => {
    setErr(null);
    try {
      await addQuoteVersion(quoteId).unwrap();
      refetch();
    } catch (e: any) {
      setErr(e?.data?.message || 'Failed to create version');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileStack className="h-6 w-6" /> Quote Versions</h1>
        <p className="text-sm text-gray-500 mt-1">Track snapshots of a quote over time.</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Quote ID"
          value={quoteIdInput}
          onChange={(e) => setQuoteIdInput(e.target.value)}
          className="input-field max-w-xs"
        />
        <button onClick={() => setQuoteId(quoteIdInput.trim())} disabled={!quoteIdInput.trim()} className="btn-primary disabled:opacity-50">
          Load
        </button>
      </div>

      {(err || error) && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {err || 'Failed to load versions'}
        </div>
      )}

      {quoteId && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Versions for <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">{quoteId}</code></h2>
            <div className="flex gap-2">
              <button onClick={handleSnapshot} disabled={creating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                Snapshot
              </button>
              <a
                href={`/api/gaps2/quotes/${quoteId}/export.pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary inline-flex items-center gap-1"
              >
                Download branded PDF
              </a>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading versions...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Version #</th>
                  <th className="py-2 pr-4">Created At</th>
                  <th className="py-2">Snapshot Total</th>
                </tr>
              </thead>
              <tbody>
                {(versions || []).map((v: QuoteVersion) => (
                  <tr key={v._id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{v.version ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}</td>
                    <td className="py-2">{v.snapshot?.total != null ? v.snapshot.total : '—'}</td>
                  </tr>
                ))}
                {(!versions || versions.length === 0) && (
                  <tr><td colSpan={3} className="py-3 text-gray-500">No versions yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
