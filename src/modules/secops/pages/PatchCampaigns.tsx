import { useGetPatchCampaignsQuery, useAddPatchCampaignMutation, useSchedulePatchesMutation, useImportCloudOtFindingsMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Plus, Play, Cloud, Layers } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'campaigns' | 'findings';

interface Campaign {
  _id?: string;
  id?: string;
  name?: string;
  status?: string;
  vulnCount?: number;
}

export default function PatchCampaigns() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const { data, isLoading } = useGetPatchCampaignsQuery();
  const [addPatchCampaign] = useAddPatchCampaignMutation();
  const [schedulePatches] = useSchedulePatchesMutation();
  const [importCloudOtFindings] = useImportCloudOtFindingsMutation();

  const campaigns: Campaign[] = data ?? [];
  const [campForm, setCampForm] = useState({ name: '', vulnerabilities: '', maintenanceWindow: '' });
  const [addMsg, setAddMsg] = useState('');
  const [schedResults, setSchedResults] = useState<Record<string, string>>({});
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  const [findingForm, setFindingForm] = useState({ title: '', severity: 'medium', ciId: '', kind: 'cloud' });
  const [findingMsg, setFindingMsg] = useState('');
  const [findingErr, setFindingErr] = useState('');

  const schedule = async (c: Campaign) => {
    const id = c._id || c.id;
    if (!id) return;
    setSchedulingId(id);
    try {
      const res: any = await schedulePatches(id).unwrap();
      const tasksCreated = typeof res === 'object' && res !== null ? res.tasksCreated ?? res.count ?? 0 : res;
      setSchedResults((prev) => ({ ...prev, [id]: `${tasksCreated} remediation tasks created` }));
    } catch (err: any) {
      setSchedResults((prev) => ({ ...prev, [id]: err?.data?.error || err?.data?.message || 'Schedule failed.' }));
    } finally {
      setSchedulingId(null);
    }
  };

  const addCampaign = async () => {
    setAddMsg('');
    try {
      await addPatchCampaign({
        name: campForm.name,
        vulnerabilities: campForm.vulnerabilities.split(',').map((v) => v.trim()).filter(Boolean),
        maintenanceWindow: campForm.maintenanceWindow,
      }).unwrap();
      setAddMsg('Campaign created.');
      setCampForm({ name: '', vulnerabilities: '', maintenanceWindow: '' });
    } catch (err: any) {
      setAddMsg(err?.data?.error || err?.data?.message || 'Failed to create campaign.');
    }
  };

  const importFinding = async () => {
    setFindingMsg('');
    setFindingErr('');
    try {
      await importCloudOtFindings({
        title: findingForm.title,
        severity: findingForm.severity,
        ciId: findingForm.ciId,
        kind: findingForm.kind,
      }).unwrap();
      setFindingMsg('Finding imported.');
      setFindingForm({ title: '', severity: 'medium', ciId: '', kind: findingForm.kind });
    } catch (err: any) {
      setFindingErr(err?.data?.error || err?.data?.message || 'Import failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Patch Campaigns</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['campaigns', 'findings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <div className="space-y-6">
          <div className="space-y-3">
            {isLoading ? (
              <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading campaigns…</p>
            ) : campaigns.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-500">No patch campaigns yet.</div>
            ) : (
              campaigns.map((c) => {
                const id = c._id || c.id || '';
                return (
                  <div key={id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="text-sm font-medium text-gray-900 min-w-[180px]">{c.name || 'Untitled'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      c.status === 'active' ? 'bg-green-100 text-green-700' : c.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status || 'draft'}
                    </span>
                    <span className="text-xs text-gray-500">{c.vulnCount ?? 0} vulnerabilities</span>
                    <div className="ml-auto flex items-center gap-3">
                      {schedResults[id] && <span className="text-xs text-green-600">{schedResults[id]}</span>}
                      <button
                        onClick={() => schedule(c)}
                        disabled={schedulingId === id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-600 text-brand-600 rounded-lg text-xs font-medium hover:bg-brand-50 disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5" /> Schedule
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Campaign
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={campForm.name} onChange={(e) => setCampForm({ ...campForm, name: e.target.value })} placeholder="Name" className={inputCls} />
              <input value={campForm.vulnerabilities} onChange={(e) => setCampForm({ ...campForm, vulnerabilities: e.target.value })} placeholder="Vuln IDs (comma-separated)" className={inputCls} />
              <input type="date" value={campForm.maintenanceWindow} onChange={(e) => setCampForm({ ...campForm, maintenanceWindow: e.target.value })} className={inputCls} />
            </div>
            <button onClick={addCampaign} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
              <Plus className="h-4 w-4" /> Add Campaign
            </button>
            {addMsg && <p className="text-xs text-green-600">{addMsg}</p>}
          </div>
        </div>
      )}

      {tab === 'findings' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-xl">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Cloud className="h-4 w-4" /> Import Cloud / OT Finding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={findingForm.title} onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })} placeholder="Title" className={inputCls} />
            <select value={findingForm.severity} onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })} className={inputCls}>
              {['low', 'medium', 'high', 'critical'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input value={findingForm.ciId} onChange={(e) => setFindingForm({ ...findingForm, ciId: e.target.value })} placeholder="CI ID" className={inputCls} />
            <select value={findingForm.kind} onChange={(e) => setFindingForm({ ...findingForm, kind: e.target.value })} className={inputCls}>
              <option value="cloud">cloud</option>
              <option value="ot">ot</option>
            </select>
          </div>
          <button onClick={importFinding} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Import Finding
          </button>
          {findingMsg && <p className="text-xs text-green-600">{findingMsg}</p>}
          {findingErr && <p className="text-xs text-red-600">{findingErr}</p>}
        </div>
      )}
    </div>
  );
}
