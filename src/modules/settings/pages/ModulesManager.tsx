import { useState } from 'react';
import { Layers, Plus, Minus, Clock, AlertTriangle, CheckCircle, History, Gauge, Sparkles } from 'lucide-react';
import {
  useGetModuleCatalogQuery, useActivateModuleV2Mutation, useDeactivateModuleV2Mutation,
  usePreviewModuleChangeMutation, useSetModuleStatusMutation, useGetUsageSummaryQuery,
  useGetActivationHistoryQuery,
} from '@shared/store/apiEndpoints';
import { useAuth } from '@core/auth/useAuth';

export default function ModulesManager() {
  const { refreshModules } = useAuth();
  const { data: catalog = [], isLoading, refetch } = useGetModuleCatalogQuery();
  const { data: usage } = useGetUsageSummaryQuery();
  const { data: history = [] } = useGetActivationHistoryQuery();
  const [activate, { isLoading: activating }] = useActivateModuleV2Mutation();
  const [deactivate] = useDeactivateModuleV2Mutation();
  const [setStatus] = useSetModuleStatusMutation();
  const [preview, { isLoading: previewing }] = usePreviewModuleChangeMutation();

  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = catalog.filter(m => m.key.toLowerCase().includes(search.toLowerCase()));

  const doActivate = async (m: any) => {
    setPendingKey(m.key); setError(''); setPreviewResult(null);
    if (m.missingDependencies?.length) {
      setError(`Cannot activate ${m.key}: missing dependencies ${m.missingDependencies.join(', ')}`);
      setPendingKey(null); return;
    }
    try {
      const res = await activate({ key: m.key, mode: 'active' }).unwrap();
      refetch();
      // Refresh the auth module list so sidebar guards pass immediately
      // without forcing the user to re-login.
      refreshModules().catch(() => {});
    } catch (e: any) {
      setError(e?.data?.error || `Failed to activate ${m.key}`);
    }
    setPendingKey(null);
  };

  const startTrial = async (m: any) => {
    setPendingKey(m.key); setError('');
    try {
      await activate({ key: m.key, mode: 'trial' }).unwrap();
      refetch();
      refreshModules().catch(() => {});
    } catch (e: any) { setError(e?.data?.error || 'Trial failed'); }
    setPendingKey(null);
  };

  const doDeactivate = async (m: any) => {
    setPendingKey(m.key); setError('');
    try {
      await deactivate({ key: m.key, graceDays: 30 }).unwrap();
      refetch();
      refreshModules().catch(() => {});
    } catch (e: any) { setError(e?.data?.error || 'Deactivate failed'); }
    setPendingKey(null);
  };

  const runPreview = async () => {
    const keys = catalog.filter(m => !m.active && !['settings'].includes(m.key)).slice(0, 6).map(m => m.key);
    try { setPreviewResult(await preview({ keys }).unwrap()); }
    catch (e: any) { setError(e?.data?.error || 'Preview failed'); }
  };

  const extendGrace = async (m: any) => {
    try { await setStatus({ key: m.key, status: 'grace', graceDays: 7 }).unwrap(); refetch(); } catch {}
  };
  const resumeActive = async (m: any) => {
    try { await setStatus({ key: m.key, status: 'active' }).unwrap(); refetch(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6" /> Modules & Plan</h1>
        <div className="flex gap-2">
          <button onClick={runPreview} disabled={previewing} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700">
            <Sparkles className="h-4 w-4" /> {previewing ? 'Calculating…' : 'Preview plan change'}
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg text-sm">
            <History className="h-4 w-4" /> History
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</div>}

      {previewResult && (
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold">Proposed plan change</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase"><tr><th>Module</th><th>Monthly</th><th>Trial</th><th>Prorated today</th><th>Status</th></tr></thead>
            <tbody>
              {previewResult.lines?.map((l: any) => (
                <tr key={l.key} className="border-t">
                  <td className="py-1">{l.label || l.key}</td>
                  <td>${l.monthlyPrice}</td>
                  <td>{l.trialDays ? `${l.trialDays}d` : '—'}</td>
                  <td>${l.proratedFirstInvoice}</td>
                  <td>{l.blocked ? <span className="text-red-600">blocked: needs {l.missingDependencies?.join(', ')}</span> : l.alreadyActive ? 'already active' : <span className="text-green-600">ready</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm font-medium pt-1">New monthly total: ${previewResult.totalMonthlyNew} · Due today: ${previewResult.totalDueToday}</p>
        </div>
      )}

      {/* Usage vs plan limits */}
      {usage && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Gauge className="h-4 w-4" /> Usage vs plan <span className="text-xs text-gray-400">({usage.planName})</span></h3>
          <div className="grid grid-cols-5 gap-4">
            {(['agents', 'contacts', 'ticketsPerMonth', 'storageMb', 'automationRuns'] as const).map(k => {
              const u = usage[k]; if (!u) return null;
              return (
                <div key={k}>
                  <p className="text-xs text-gray-500 capitalize mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                  <p className={`text-sm font-semibold ${u.over ? 'text-red-600' : ''}`}>{u.used}{u.limit != null ? ` / ${u.limit}` : ''}</p>
                  {u.limit != null && (
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                      <div className={`h-1.5 rounded-full ${u.over ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${u.pct}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules…" className="input-field max-w-xs" />

      {isLoading ? <p className="text-gray-500">Loading modules…</p> : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.key} className={`bg-white rounded-lg border p-4 ${!m.active && m.missingDependencies.length ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{m.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full ${
                  m.status === 'active' ? 'bg-green-100 text-green-700' :
                  m.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                  m.status === 'disabled' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{m.status}</span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                {m.monthlyPrice > 0
                  ? <span className="font-semibold">${m.monthlyPrice}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
                  : <span className="text-green-600 font-semibold text-sm">Included free</span>}
                {m.trialDays > 0 && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{m.trialDays}-day trial</span>}
              </div>

              {m.trialEndsAt && m.status === 'trial' && (
                <p className="text-xs text-blue-600 mt-2">Trial ends {new Date(m.trialEndsAt).toLocaleDateString()}</p>
              )}
              {m.graceUntil && (
                <p className="text-xs text-orange-600 mt-2">Read-only grace until {new Date(m.graceUntil).toLocaleDateString()}</p>
              )}
              {m.missingDependencies.length > 0 && (
                <p className="text-xs text-red-600 mt-2">Requires: {m.missingDependencies.join(', ')}</p>
              )}
              {m.conflictsActive.length > 0 && (
                <p className="text-xs text-yellow-600 mt-2">Conflicts with: {m.conflictsActive.join(', ')}</p>
              )}

              <div className="mt-3 flex gap-1.5 flex-wrap">
                {!m.active && m.status !== 'trial' && (
                  <>
                    <button onClick={() => doActivate(m)} disabled={pendingKey === m.key || !!m.missingDependencies.length}
                      className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-40 flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Activate
                    </button>
                    {m.trialDays > 0 && (
                      <button onClick={() => startTrial(m)} disabled={pendingKey === m.key}
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-40 flex items-center gap-1">
                        Trial
                      </button>
                    )}
                  </>
                )}
                {m.active && m.key !== 'settings' && (
                  <button onClick={() => doDeactivate(m)} disabled={pendingKey === m.key}
                    className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-40 flex items-center gap-1">
                    <Minus className="h-3 w-3" /> Deactivate (30d grace)
                  </button>
                )}
                {m.status === 'grace' && (
                  <>
                    <button onClick={() => resumeActive(m)} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Resume</button>
                    <button onClick={() => extendGrace(m)} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded">+7d grace</button>
                  </>
                )}
                {(m.status === 'suspended' || m.status === 'expired') && (
                  <button onClick={() => doActivate(m)} className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded">Reactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showHistory && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Activation history</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase"><tr><th>When</th><th>Module</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              {history.map((h: any) => (
                <tr key={h._id} className="border-t">
                  <td className="py-1 text-gray-500">{new Date(h.createdAt).toLocaleString()}</td>
                  <td>{h.moduleKey}</td>
                  <td><CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />{h.action}</td>
                  <td className="text-gray-400 text-xs">{h.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
