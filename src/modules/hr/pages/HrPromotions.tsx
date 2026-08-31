import { usePromoteEmployeeMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Users2, TrendingUp, CheckCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface DownstreamTask {
  title?: string;
  name?: string;
  label?: string;
  description?: string;
  status?: string;
}

export default function HrPromotions() {
  const [promoteEmployee] = usePromoteEmployeeMutation();
  const [form, setForm] = useState({ employeeId: '', fromTitle: '', toTitle: '', effectiveDate: '', compensationDeltaPct: '' });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const tasks: DownstreamTask[] = Array.isArray(result?.downstreamTasks) ? result.downstreamTasks : [];

  const submit = async () => {
    setErr('');
    setResult(null);
    setBusy(true);
    try {
      const res: any = await promoteEmployee({
        employeeId: form.employeeId,
        fromTitle: form.fromTitle,
        toTitle: form.toTitle,
        effectiveDate: form.effectiveDate,
        compensationDeltaPct: Number(form.compensationDeltaPct),
      }).unwrap();
      setResult(res);
    } catch (e: any) {
      setErr(e?.data?.error || e?.data?.message || 'Promotion failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">HR Promotions</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Promote Employee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="Employee ID" className={inputCls} />
          <input value={form.fromTitle} onChange={(e) => setForm({ ...form, fromTitle: e.target.value })} placeholder="From title" className={inputCls} />
          <input value={form.toTitle} onChange={(e) => setForm({ ...form, toTitle: e.target.value })} placeholder="To title" className={inputCls} />
          <input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} className={inputCls} />
          <input
            type="number"
            value={form.compensationDeltaPct}
            onChange={(e) => setForm({ ...form, compensationDeltaPct: e.target.value })}
            placeholder="Compensation delta %"
            className={inputCls}
          />
        </div>
        <button
          onClick={submit}
          disabled={busy || !form.employeeId.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? 'Promoting…' : 'Promote'}
        </button>
        {err && <p className="text-xs text-red-600">{err}</p>}
      </div>

      {tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Downstream Tasks</h2>
          <ul className="space-y-2">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className={`h-4 w-4 shrink-0 ${t.status === 'done' ? 'text-green-600' : 'text-gray-300'}`} />
                <span>{t.title || t.name || t.label || t.description || 'Task'}</span>
                {t.status && <span className="ml-auto text-xs text-gray-400 capitalize">{t.status}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && !Array.isArray(result?.downstreamTasks) && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 max-w-2xl text-sm text-green-800">
          Promotion recorded successfully.
        </div>
      )}
    </div>
  );
}
