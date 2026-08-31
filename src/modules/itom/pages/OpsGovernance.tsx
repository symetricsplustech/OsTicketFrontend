import { useGetRemediationActionsQuery, useAddRemediationActionMutation, useExecuteRemediationMutation, useGetCloudAccountsQuery, useAddCloudAccountMutation, useAddCloudCostMutation, useGetSoarPlaybooksQuery, useRunSoarPlaybookMutation, useEnrichThreatIntelMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { CloudCog, Plus, CheckCircle, XCircle, Plug2 } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'remediation' | 'cloud' | 'soar' | 'threatintel';

export default function OpsGovernance() {
  const [tab, setTab] = useState<Tab>('remediation');
  const { data: actions = [] } = useGetRemediationActionsQuery();
  const { data: accounts = [] } = useGetCloudAccountsQuery();
  const { data: playbooks = [] } = useGetSoarPlaybooksQuery();

  const [addRemediationAction] = useAddRemediationActionMutation();
  const [executeRemediation] = useExecuteRemediationMutation();
  const [addCloudAccount] = useAddCloudAccountMutation();
  const [addCloudCost] = useAddCloudCostMutation();
  const [runSoarPlaybook] = useRunSoarPlaybookMutation();
  const [enrichThreatIntel] = useEnrichThreatIntelMutation();

  const [raForm, setRaForm] = useState({ name: '', commandTemplate: '', targetType: 'alert', approvalRequired: false });
  const [raMsg, setRaMsg] = useState('');
  const [raErr, setRaErr] = useState('');
  const [execMsg, setExecMsg] = useState('');
  const [execErr, setExecErr] = useState('');

  const [caForm, setCaForm] = useState({ provider: 'aws', accountId: '', name: '', monthlyBudget: '' });
  const [caMsg, setCaMsg] = useState('');
  const [caErr, setCaErr] = useState('');
  const [costForm, setCostForm] = useState({ accountId: '', month: '', service: '', amount: '' });
  const [costMsg, setCostMsg] = useState('');
  const [costErr, setCostErr] = useState('');

  const [pbId, setPbId] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [soarResult, setSoarResult] = useState('');
  const [soarErr, setSoarErr] = useState('');

  const [tiId, setTiId] = useState('');
  const [tiResult, setTiResult] = useState<{ matchedKnown?: number; unknownAdded?: number } | null>(null);
  const [tiErr, setTiErr] = useState('');

  const addAction = async () => {
    setRaMsg(''); setRaErr('');
    try {
      await addRemediationAction({
        name: raForm.name,
        commandTemplate: raForm.commandTemplate,
        targetType: raForm.targetType,
        approvalRequired: raForm.approvalRequired,
      }).unwrap();
      setRaMsg('Remediation action added.');
      setRaForm({ name: '', commandTemplate: '', targetType: 'alert', approvalRequired: false });
    } catch (err: any) {
      setRaErr(err?.data?.error || err?.data?.message || 'Failed to add remediation action.');
    }
  };

  const execute = async (id: string) => {
    const targetRef = window.prompt('Target reference (alert/CI/host id):');
    if (!targetRef) return;
    setExecMsg(''); setExecErr('');
    try {
      await executeRemediation({ id, body: { targetRef } }).unwrap();
      setExecMsg(`Execution started for ${targetRef}.`);
    } catch (err: any) {
      setExecErr(err?.data?.error || err?.data?.message || 'Execute failed.');
    }
  };

  const addAccount = async () => {
    setCaMsg(''); setCaErr('');
    try {
      await addCloudAccount({
        provider: caForm.provider,
        accountId: caForm.accountId,
        name: caForm.name,
        monthlyBudget: Number(caForm.monthlyBudget),
      }).unwrap();
      setCaMsg('Cloud account added.');
      setCaForm({ provider: 'aws', accountId: '', name: '', monthlyBudget: '' });
    } catch (err: any) {
      setCaErr(err?.data?.error || err?.data?.message || 'Failed to add cloud account.');
    }
  };

  const addCost = async () => {
    setCostMsg(''); setCostErr('');
    try {
      await addCloudCost({
        accountId: costForm.accountId,
        month: costForm.month,
        service: costForm.service,
        amount: Number(costForm.amount),
      }).unwrap();
      setCostMsg('Cost entry saved.');
      setCostForm({ accountId: costForm.accountId, month: '', service: '', amount: '' });
    } catch (err: any) {
      setCostErr(err?.data?.error || err?.data?.message || 'Failed to save cost entry.');
    }
  };

  const runPlaybook = async () => {
    setSoarResult(''); setSoarErr('');
    try {
      const res = await runSoarPlaybook({ id: pbId, incidentId }).unwrap();
      const steps = Array.isArray(res.executedSteps) ? res.executedSteps : [];
      setSoarResult(steps.length ? steps.join(' → ') : 'Run completed.');
    } catch (err: any) {
      setSoarErr(err?.data?.error || err?.data?.message || 'Playbook run failed.');
    }
  };

  const enrich = async () => {
    setTiResult(null); setTiErr('');
    try {
      const res = await enrichThreatIntel(tiId).unwrap();
      setTiResult({ matchedKnown: res.matchedKnown, unknownAdded: res.unknownAdded });
    } catch (err: any) {
      setTiErr(err?.data?.error || err?.data?.message || 'Enrichment failed.');
    }
  };

  const statusChipCls = (status: string) =>
    status === 'success' || status === 'passed'
      ? 'bg-green-100 text-green-700'
      : status === 'failed'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CloudCog className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Ops Governance</h1>
      </div>

      <div className="flex gap-1 border-b">
        {(['remediation', 'cloud', 'soar', 'threatintel'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'threatintel' ? 'ThreatIntel' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'remediation' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {actions.length === 0 && <p className="text-sm text-gray-500 p-5">No remediation actions yet.</p>}
            {actions.map((a: any) => {
              const lastStatus = a.lastRun?.status || a.lastRunStatus;
              return (
                <div key={a._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="font-mono text-xs text-gray-500">{a.commandTemplate}</p>
                    {lastStatus && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${statusChipCls(lastStatus)}`}>
                        last run: {lastStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{a.targetType}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${a.approvalRequired ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {a.approvalRequired ? 'approval required' : 'auto'}
                    </span>
                    <button onClick={() => execute(a._id)} className="px-3 py-1.5 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium">Execute</button>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addAction(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Remediation Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Name" value={raForm.name} onChange={(e) => setRaForm({ ...raForm, name: e.target.value })} className={inputCls} required />
              <select value={raForm.targetType} onChange={(e) => setRaForm({ ...raForm, targetType: e.target.value })} className={inputCls}>
                <option value="alert">alert</option>
                <option value="ci">ci</option>
                <option value="host">host</option>
              </select>
            </div>
            <textarea rows={3} placeholder='Command template, e.g. restart-service {{targetRef}}' value={raForm.commandTemplate} onChange={(e) => setRaForm({ ...raForm, commandTemplate: e.target.value })} className={`${inputCls} font-mono`} required />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={raForm.approvalRequired} onChange={(e) => setRaForm({ ...raForm, approvalRequired: e.target.checked })} className="rounded border-gray-300" />
              Approval required
            </label>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Add Action</button>
            {raMsg && <span className="ml-3 flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {raMsg}</span>}
            {raErr && <span className="ml-3 flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {raErr}</span>}
          </form>

          {(execMsg || execErr) && (
            <p className={`text-sm flex items-center gap-1 ${execErr ? 'text-red-600' : 'text-green-600'}`}>
              {execErr ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />} {execErr || execMsg}
            </p>
          )}
        </section>
      )}

      {tab === 'cloud' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.length === 0 && <p className="text-sm text-gray-500">No cloud accounts yet.</p>}
            {accounts.map((c: any) => (
              <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{c.provider}</span>
                <p className="mt-2 font-semibold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.accountId}</p>
                <p className="text-sm text-gray-700">Monthly budget: ${Number(c.monthlyBudget || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addAccount(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="text-lg font-semibold text-gray-900">Add Cloud Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={caForm.provider} onChange={(e) => setCaForm({ ...caForm, provider: e.target.value })} className={inputCls}>
                <option value="aws">aws</option>
                <option value="azure">azure</option>
                <option value="gcp">gcp</option>
              </select>
              <input placeholder="Account ID" value={caForm.accountId} onChange={(e) => setCaForm({ ...caForm, accountId: e.target.value })} className={inputCls} required />
              <input placeholder="Name" value={caForm.name} onChange={(e) => setCaForm({ ...caForm, name: e.target.value })} className={inputCls} required />
              <input type="number" min="0" placeholder="Monthly budget" value={caForm.monthlyBudget} onChange={(e) => setCaForm({ ...caForm, monthlyBudget: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Add Account</button>
              {caMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {caMsg}</span>}
              {caErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {caErr}</span>}
            </div>
          </form>

          <form
            onSubmit={(e) => { e.preventDefault(); addCost(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="text-lg font-semibold text-gray-900">Log Cloud Cost</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={costForm.accountId} onChange={(e) => setCostForm({ ...costForm, accountId: e.target.value })} className={inputCls} required>
                <option value="">Select account</option>
                {accounts.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name || c.accountId}</option>
                ))}
              </select>
              <input type="month" pattern="\d{4}-\d{2}" placeholder="YYYY-MM" title="Month as YYYY-MM" value={costForm.month} onChange={(e) => setCostForm({ ...costForm, month: e.target.value })} className={inputCls} required />
              <input placeholder="Service" value={costForm.service} onChange={(e) => setCostForm({ ...costForm, service: e.target.value })} className={inputCls} required />
              <input type="number" step="0.01" min="0" placeholder="Amount" value={costForm.amount} onChange={(e) => setCostForm({ ...costForm, amount: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Save Cost Entry</button>
              {costMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {costMsg}</span>}
              {costErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {costErr}</span>}
            </div>
            <p className="text-xs text-gray-500">Entries are stored per month/service; totals are not aggregated here.</p>
          </form>
        </section>
      )}

      {tab === 'soar' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {playbooks.length === 0 && <p className="text-sm text-gray-500 p-5">No playbooks yet.</p>}
            {playbooks.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">{p.triggerCategory}</span>
                    <span className="text-xs text-gray-500">{(p.steps || []).length || p.stepsCount || 0} steps</span>
                    <span className="text-xs text-gray-500">{(p.runs || []).length || p.runCount || 0} runs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); runPlaybook(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="text-lg font-semibold text-gray-900">Run Playbook</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={pbId} onChange={(e) => setPbId(e.target.value)} className={inputCls} required>
                <option value="">Select playbook</option>
                {playbooks.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <input placeholder="Incident ID" value={incidentId} onChange={(e) => setIncidentId(e.target.value)} className={inputCls} required />
              <button type="submit" disabled={!pbId} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50">Run Playbook</button>
            </div>
            {soarResult && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> {soarResult}</p>}
            {soarErr && <p className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> {soarErr}</p>}
          </form>
        </section>
      )}

      {tab === 'threatintel' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-xl">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plug2 className="h-5 w-5 text-brand-600" /> Threat Intel Enrichment</h2>
          <div className="flex gap-3">
            <input placeholder="Incident ID" value={tiId} onChange={(e) => setTiId(e.target.value)} className={inputCls} required />
            <button onClick={enrich} disabled={!tiId.trim()} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50 whitespace-nowrap">Enrich</button>
          </div>
          {tiResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{tiResult.matchedKnown ?? 0}</p>
                <p className="text-xs text-green-700">matched known indicators</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{tiResult.unknownAdded ?? 0}</p>
                <p className="text-xs text-orange-700">unknown indicators added</p>
              </div>
            </div>
          )}
          {tiErr && <p className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> {tiErr}</p>}
        </section>
      )}
    </div>
  );
}
