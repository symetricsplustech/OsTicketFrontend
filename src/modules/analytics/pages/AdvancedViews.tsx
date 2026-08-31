import { useGetFunnelReportMutation, usePeriodCompareMutation, useScorecardMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { LineChart, Send, XCircle } from 'lucide-react';

export default function AdvancedViews() {
  const [getFunnelReport, { isLoading: loadingFunnel }] = useGetFunnelReportMutation();
  const [periodCompare, { isLoading: loadingCompare }] = usePeriodCompareMutation();
  const [scorecard, { isLoading: loadingScore }] = useScorecardMutation();

  const [funnel, setFunnel] = useState<any>(null);
  const [compare, setCompare] = useState<any>(null);
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const runFunnel = async () => {
    setErr(null); setFunnel(null);
    try { setFunnel(await getFunnelReport({}).unwrap()); } catch (e: any) { setErr(e?.data?.message || 'Failed to load funnel'); }
  };
  const runCompare = async () => {
    setErr(null); setCompare(null);
    try { setCompare(await periodCompare().unwrap()); } catch (e: any) { setErr(e?.data?.message || 'Failed to compare periods'); }
  };
  const runScorecard = async () => {
    setErr(null); setRagResult(null);
    try { setRagResult(await scorecard({ metric, value: Number(value) }).unwrap()); } catch (e: any) { setErr(e?.data?.message || 'Failed to score metric'); }
  };

  const stages: any[] = funnel?.stages || funnel || [];

  const ragClass =
    ragResult?.rag === 'green' ? 'bg-green-100 text-green-700' :
    ragResult?.rag === 'amber' ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-700';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><LineChart className="h-6 w-6" /> Advanced Views</h1>
        {err && (
          <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> {err}</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Funnel */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Funnel Report</h2>
          <button onClick={runFunnel} disabled={loadingFunnel} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Send className="h-4 w-4" /> {loadingFunnel ? 'Running...' : 'Run'}
          </button>
          {funnel && (
            <div className="space-y-3">
              {Array.isArray(stages) && stages.map((s: any, i: number) => {
                const max = Math.max(...stages.map((x: any) => x.count ?? x.value ?? 0), 1);
                const w = Math.max(((s.count ?? s.value ?? 0) / max) * 100, 4);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{s.stage || s.name}</span>
                      <span>{s.convFromPrev != null ? `${s.convFromPrev}%` : (s.conversion != null ? `${s.conversion}%` : s.count ?? s.value)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded h-4 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Period compare */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Period Compare</h2>
          <button onClick={runCompare} disabled={loadingCompare} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Send className="h-4 w-4" /> {loadingCompare ? 'Running...' : 'Run'}
          </button>
          {compare && (() => {
            const rows: any[] = compare.metrics || compare.rows || [];
            return (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-1.5 pr-2">Metric</th>
                    <th className="py-1.5 pr-2">Current</th>
                    <th className="py-1.5 pr-2">Previous</th>
                    <th className="py-1.5">Δ%</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 pr-2 font-medium">{r.metric || r.name}</td>
                      <td className="py-1.5 pr-2">{r.current}</td>
                      <td className="py-1.5 pr-2 text-gray-500">{r.previous}</td>
                      <td className={`py-1.5 font-semibold ${(r.deltaPct ?? r.delta ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {r.deltaPct ?? r.delta}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
          {compare?.freshness != null && (
            <p className="text-xs text-gray-400">Data freshness: {new Date(compare.freshness).toLocaleString()}</p>
          )}
        </div>

        {/* Scorecard RAG */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Scorecard RAG</h2>
          <input type="text" required placeholder="Metric name (e.g. csat)" value={metric} onChange={(e) => setMetric(e.target.value)} className="input-field" />
          <input type="number" required placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} className="input-field" />
          <button onClick={runScorecard} disabled={!metric || value === '' || loadingScore} className="btn-primary disabled:opacity-50">
            {loadingScore ? 'Running...' : 'Run'}
          </button>
          {ragResult && (
            <div className="rounded-lg bg-gray-50 border p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">{(ragResult as any).metric || metric}: <span className="font-bold">{(ragResult as any).value ?? value}</span></p>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold uppercase ${ragClass}`}>{(ragResult as any).rag || 'red'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
