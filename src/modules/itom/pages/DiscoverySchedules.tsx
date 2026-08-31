import { useGetDiscoverySchedulesQuery, useAddDiscoveryScheduleMutation, useRunDiscoveryScheduleMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Play, Plus, RefreshCw, Cloud, Container, Database } from 'lucide-react';

const SCOPE_TYPES = ['network_range', 'cloud_account', 'kubernetes', 'container'] as const;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

const SCOPE_ICON: Record<string, any> = {
  network_range: Database,
  cloud_account: Cloud,
  kubernetes: Container,
  container: Container,
};

interface Schedule {
  _id?: string;
  id?: string;
  name?: string;
  scopeType?: string;
  target?: string;
  cronHint?: string;
  lastStatus?: string;
  lastFindings?: number;
}

export default function DiscoverySchedules() {
  const { data, isLoading, refetch } = useGetDiscoverySchedulesQuery();
  const [addDiscoverySchedule] = useAddDiscoveryScheduleMutation();
  const [runDiscoverySchedule] = useRunDiscoveryScheduleMutation();

  const schedules: Schedule[] = data ?? [];
  const [form, setForm] = useState({ name: '', scopeType: 'network_range', target: '', cronHint: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<Record<string, string>>({});

  const run = async (s: Schedule) => {
    const id = s._id || s.id;
    if (!id) return;
    setRunningId(id);
    try {
      const res: any = await runDiscoverySchedule(id).unwrap();
      const newResources = typeof res === 'object' && res !== null ? res.newResources ?? res.count ?? 0 : res;
      setRunResults((prev) => ({ ...prev, [id]: `${newResources} new resources discovered` }));
    } catch (err: any) {
      setRunResults((prev) => ({ ...prev, [id]: err?.data?.error || err?.data?.message || 'Run failed.' }));
    } finally {
      setRunningId(null);
    }
  };

  const add = async () => {
    setAddMsg('');
    setAddErr('');
    try {
      await addDiscoverySchedule({ ...form }).unwrap();
      setAddMsg('Schedule created.');
      setForm({ name: '', scopeType: 'network_range', target: '', cronHint: '' });
    } catch (err: any) {
      setAddErr(err?.data?.error || err?.data?.message || 'Failed to create schedule.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discovery Schedules</h1>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading schedules…</p>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-500">No discovery schedules yet.</div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const id = s._id || s.id || '';
            const ScopeIcon = SCOPE_ICON[(s.scopeType || '').toLowerCase()] || Database;
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 min-w-[160px]">
                  <ScopeIcon className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-medium text-gray-900">{s.name || 'Untitled'}</span>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 capitalize">{s.scopeType || '—'}</span>
                <span className="text-xs text-gray-500 font-mono">{s.target || '—'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.lastStatus === 'success' ? 'bg-green-100 text-green-700' : s.lastStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {s.lastStatus || 'never run'}
                </span>
                <span className="text-xs text-gray-500">{s.lastFindings ?? 0} findings</span>
                <div className="ml-auto flex items-center gap-3">
                  {runResults[id] && <span className="text-xs text-green-600">{runResults[id]}</span>}
                  <button
                    onClick={() => run(s)}
                    disabled={runningId === id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-600 text-brand-600 rounded-lg text-xs font-medium hover:bg-brand-50 disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" /> Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={inputCls} />
          <select value={form.scopeType} onChange={(e) => setForm({ ...form, scopeType: e.target.value })} className={inputCls}>
            {SCOPE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="Target" className={inputCls} />
          <input value={form.cronHint} onChange={(e) => setForm({ ...form, cronHint: e.target.value })} placeholder="Cron hint" className={inputCls} />
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add Schedule
        </button>
        {addMsg && <p className="text-xs text-green-600">{addMsg}</p>}
        {addErr && <p className="text-xs text-red-600">{addErr}</p>}
      </div>
    </div>
  );
}
