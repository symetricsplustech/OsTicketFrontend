import { useGetPriorityMatrixQuery, useSetPriorityMatrixMutation, useComputePriorityMutation } from '@shared/store/apiEndpoints';
import { useEffect, useState } from 'react';
import { Grid3x3, Save, Send, XCircle } from 'lucide-react';

const IMPACTS = ['low', 'medium', 'high'];
const URGENCIES = ['low', 'medium', 'high'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

type Cells = Record<string, string>;
const key = (impact: string, urgency: string) => `${impact}|${urgency}`;

export default function PriorityMatrixEditor() {
  const { data: matrix, isLoading } = useGetPriorityMatrixQuery();
  const [setPriorityMatrix, { isLoading: saving }] = useSetPriorityMatrixMutation();
  const [computePriority, { isLoading: computing }] = useComputePriorityMutation();

  const [cells, setCells] = useState<Cells>({});
  const [test, setTest] = useState({ impact: 'medium', urgency: 'medium' });
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(matrix)) {
      const next: Cells = {};
      for (const i of IMPACTS) for (const u of URGENCIES) next[key(i, u)] = 'medium';
      (matrix as any[]).forEach((c) => { if (c?.impact && c?.urgency) next[key(c.impact, c.urgency)] = c.priority || 'medium'; });
      setCells(next);
    }
  }, [matrix]);

  const handleSaveAll = async () => {
    setErr(null); setOk(null);
    try {
      await setPriorityMatrix({
        cells: IMPACTS.flatMap((impact) =>
          URGENCIES.map((urgency) => ({ impact, urgency, priority: cells[key(impact, urgency)] }))
        ),
      }).unwrap();
      setOk('Priority matrix saved');
    } catch (e: any) {
      setErr(e?.data?.message || 'Failed to save matrix');
    }
  };

  const handleCompute = async () => {
    setErr(null); setResult(null);
    try {
      const res = await computePriority({ impact: test.impact, urgency: test.urgency }).unwrap();
      setResult(res);
    } catch (e: any) {
      setErr(e?.data?.message || 'Failed to compute priority');
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500">Loading priority matrix...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Grid3x3 className="h-6 w-6" /> Priority Matrix Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Rows: impact · Columns: urgency</p>
      </div>

      {(err || ok) && (
        err ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> {err}
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{ok}</div>
        )
      )}

      <div className="card p-6 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-sm font-semibold text-gray-500 text-left">Impact ↓ / Urgency →</th>
              {URGENCIES.map((u) => (
                <th key={u} className="p-2 text-sm font-semibold capitalize text-gray-700">{u}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IMPACTS.map((i) => (
              <tr key={i}>
                <td className="p-2 text-sm font-semibold capitalize text-gray-700">{i}</td>
                {URGENCIES.map((u) => (
                  <td key={u} className="p-2">
                    <select
                      value={cells[key(i, u)] || 'medium'}
                      onChange={(e) => setCells({ ...cells, [key(i, u)]: e.target.value })}
                      className="input-field capitalize"
                    >
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="mt-4 btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Test Compute</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Impact</label>
            <select value={test.impact} onChange={(e) => setTest({ ...test, impact: e.target.value })} className="mt-1 input-field capitalize">
              {IMPACTS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Urgency</label>
            <select value={test.urgency} onChange={(e) => setTest({ ...test, urgency: e.target.value })} className="mt-1 input-field capitalize">
              {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <button onClick={handleCompute} disabled={computing} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Send className="h-4 w-4" /> {computing ? 'Computing...' : 'Compute'}
          </button>
        </div>
        {result && (
          <div className="mt-4 rounded-lg bg-gray-50 border p-4 text-sm flex flex-wrap items-center gap-4">
            <span className="font-medium text-gray-700">Result:</span>
            <span className={`rounded-full px-3 py-1 font-semibold capitalize ${
              result.priority === 'critical' ? 'bg-red-100 text-red-700' :
              result.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              result.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
            }`}>{result.priority}</span>
            <span className="text-gray-500">source: <code>{String(result.source ?? JSON.stringify(result))}</code></span>
          </div>
        )}
      </div>
    </div>
  );
}
