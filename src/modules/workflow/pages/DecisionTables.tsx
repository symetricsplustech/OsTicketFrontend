import { useGetDecisionTablesQuery, useAddDecisionTableMutation, useEvaluateDecisionTableMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Table2, Plus, Play, CheckCircle, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface DecisionTable {
  _id?: string;
  id?: string;
  name?: string;
  conditionColumns?: any;
  outputField?: string;
  rowCount?: number;
}

export default function DecisionTables() {
  const { data, isLoading, refetch } = useGetDecisionTablesQuery();
  const [addDecisionTable] = useAddDecisionTableMutation();
  const [evaluateDecisionTable] = useEvaluateDecisionTableMutation();

  const tables: DecisionTable[] = data ?? [];
  const [form, setForm] = useState({ name: '', conditionColumns: '', outputField: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');

  const [selectedId, setSelectedId] = useState('');
  const [factsText, setFactsText] = useState('{}');
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalErr, setEvalErr] = useState('');
  const [busy, setBusy] = useState(false);

  const columnsLabel = (c: any) => (Array.isArray(c) ? c.join(', ') : typeof c === 'string' ? c : '—');

  const add = async () => {
    setAddMsg('');
    setAddErr('');
    try {
      await addDecisionTable({
        name: form.name,
        conditionColumns: form.conditionColumns.split(',').map((s) => s.trim()).filter(Boolean),
        outputField: form.outputField,
      }).unwrap();
      setAddMsg('Decision table created.');
      setForm({ name: '', conditionColumns: '', outputField: '' });
      refetch();
    } catch (err: any) {
      setAddErr(err?.data?.error || err?.data?.message || 'Failed to create decision table.');
    }
  };

  const evaluate = async () => {
    const id = selectedId;
    if (!id) return;
    setEvalErr('');
    setEvalResult(null);
    setBusy(true);
    try {
      const facts = JSON.parse(factsText);
      const res: any = await evaluateDecisionTable({ id, facts }).unwrap();
      setEvalResult(typeof res === 'object' && res !== null ? res : { output: res });
    } catch (err: any) {
      setEvalErr(err instanceof SyntaxError ? 'Facts must be valid JSON.' : err?.data?.error || err?.data?.message || 'Evaluation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Table2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Decision Tables</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading decision tables…</p>
        ) : tables.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-500">No decision tables yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Condition Columns</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Output Field</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Rows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tables.map((t) => (
                <tr key={t._id || t.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name || 'Untitled'}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{columnsLabel(t.conditionColumns)}</td>
                  <td className="px-4 py-3 text-gray-700">{t.outputField || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{t.rowCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Table
          </h2>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={inputCls} />
          <input value={form.conditionColumns} onChange={(e) => setForm({ ...form, conditionColumns: e.target.value })} placeholder="Condition columns (comma-separated)" className={inputCls} />
          <input value={form.outputField} onChange={(e) => setForm({ ...form, outputField: e.target.value })} placeholder="Output field" className={inputCls} />
          <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Create
          </button>
          {addMsg && <p className="text-xs text-green-600">{addMsg}</p>}
          {addErr && <p className="text-xs text-red-600">{addErr}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Play className="h-4 w-4" /> Evaluate
          </h2>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={inputCls}>
            <option value="">Select a table…</option>
            {tables.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>{t.name || 'Untitled'}</option>
            ))}
          </select>
          <textarea
            value={factsText}
            onChange={(e) => setFactsText(e.target.value)}
            rows={5}
            placeholder='{"amount": 5000}'
            className={`${inputCls} font-mono`}
          />
          <button
            onClick={evaluate}
            disabled={busy || !selectedId}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" /> Evaluate
          </button>
          {evalErr && <p className="text-xs text-red-600">{evalErr}</p>}
          {evalResult && (
            <div className="rounded-lg border border-gray-200 px-4 py-3 space-y-1">
              <p className={`inline-flex items-center gap-1.5 text-sm font-medium ${evalResult.hit ? 'text-green-700' : 'text-gray-500'}`}>
                {evalResult.hit ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                Hit: {String(evalResult.hit === true)}
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">{JSON.stringify(evalResult.output ?? evalResult.result ?? null)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
