import { usePublishKbSweepMutation, useGetGapAnalysisQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { FileText, CheckCircle, Table2 } from 'lucide-react';

interface ZeroResultQuery {
  query?: string;
  hits?: number;
}

export default function KnowledgeInsights() {
  const [publishKbSweep] = usePublishKbSweepMutation();
  const { data: gapData, isLoading: gapLoading } = useGetGapAnalysisQuery();
  const [sweepResult, setSweepResult] = useState<any>(null);
  const [sweepBusy, setSweepBusy] = useState(false);
  const [sweepErr, setSweepErr] = useState('');

  const zeroResultQueries: ZeroResultQuery[] = Array.isArray(gapData?.zeroResultQueries) ? gapData.zeroResultQueries : [];

  const runSweep = async () => {
    setSweepErr('');
    setSweepBusy(true);
    try {
      const res: any = await publishKbSweep(undefined).unwrap();
      setSweepResult(res);
    } catch (err: any) {
      setSweepErr(err?.data?.error || err?.data?.message || 'Publish sweep failed.');
    } finally {
      setSweepBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Insights</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Publish Sweep</h2>
          <p className="text-sm text-gray-500">Scan drafts and publish everything ready for the knowledge base.</p>
          <button
            onClick={runSweep}
            disabled={sweepBusy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" /> {sweepBusy ? 'Publishing…' : 'Publish sweep'}
          </button>
          {sweepErr && <p className="text-xs text-red-600">{sweepErr}</p>}
          {sweepResult && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm font-medium text-green-800">{sweepResult.publishedNow ?? 0} articles published now</p>
              {typeof sweepResult.skipped === 'number' && <p className="text-xs text-green-600 mt-1">{sweepResult.skipped} skipped</p>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Table2 className="h-4 w-4 text-gray-400" /> Gap Analysis
          </h2>
          {gapLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Analyzing gaps…</p>
          ) : zeroResultQueries.length === 0 ? (
            <p className="text-sm text-gray-500">No zero-result queries found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-600">Query</th>
                  <th className="text-right py-2 font-semibold text-gray-600">Hits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {zeroResultQueries.map((q, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="py-2 text-gray-800 truncate max-w-[220px]">{q.query || '—'}</td>
                    <td className="py-2 text-right text-gray-500">{q.hits ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
