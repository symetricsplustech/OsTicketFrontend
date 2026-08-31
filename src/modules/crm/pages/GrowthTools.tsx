import { useGetCampaignsQuery, useAddCampaignMutation, useAddCampaignMemberMutation, useGetTerritoriesQuery, useAddTerritoryMutation, useGetAccountTeamsQuery, useAddAccountTeamMemberMutation, useGetStageAgeingQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Megaphone, Plus, CheckCircle, XCircle, Target, Users2 } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'campaigns' | 'territories' | 'teams' | 'stageageing';
const CHANNELS = ['email', 'sms', 'social', 'webinar', 'event'];
const TEAM_ROLES = ['owner', 'sales_rep', 'engineer', 'support_lead', 'exec_sponsor'];

export default function GrowthTools() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: territories = [] } = useGetTerritoriesQuery();
  const { data: teams = [] } = useGetAccountTeamsQuery();
  const { data: ageing } = useGetStageAgeingQuery();

  const [addCampaign] = useAddCampaignMutation();
  const [addCampaignMember] = useAddCampaignMemberMutation();
  const [addTerritory] = useAddTerritoryMutation();
  const [addAccountTeamMember] = useAddAccountTeamMemberMutation();

  const [cForm, setCForm] = useState({ name: '', channel: 'email', budget: '' });
  const [cMsg, setCMsg] = useState('');
  const [cErr, setCErr] = useState('');
  const [memberInputs, setMemberInputs] = useState<Record<string, string>>({});
  const [memberMsg, setMemberMsg] = useState<Record<string, string>>({});
  const [memberErrs, setMemberErrs] = useState<Record<string, string>>({});

  const [tForm, setTForm] = useState({ name: '', regions: '' });
  const [tMsg, setTMsg] = useState('');
  const [tErr, setTErr] = useState('');

  const [teamForm, setTeamForm] = useState({ companyId: '', userId: '', teamRole: 'owner' });
  const [teamMsg, setTeamMsg] = useState('');
  const [teamErr, setTeamErr] = useState('');

  const addCamp = async () => {
    setCMsg(''); setCErr('');
    try {
      await addCampaign({ name: cForm.name, channel: cForm.channel, budget: Number(cForm.budget) }).unwrap();
      setCMsg('Campaign created.');
      setCForm({ name: '', channel: 'email', budget: '' });
    } catch (err: any) {
      setCErr(err?.data?.error || err?.data?.message || 'Failed to create campaign.');
    }
  };

  const addMember = async (id: string) => {
    setMemberMsg((m) => ({ ...m, [id]: '' }));
    setMemberErrs((m) => ({ ...m, [id]: '' }));
    try {
      await addCampaignMember({ id, contactId: memberInputs[id] }).unwrap();
      setMemberMsg((m) => ({ ...m, [id]: 'Member added.' }));
      setMemberInputs((m) => ({ ...m, [id]: '' }));
    } catch (err: any) {
      setMemberErrs((m) => ({ ...m, [id]: err?.data?.error || err?.data?.message || 'Failed to add member.' }));
    }
  };

  const addTerr = async () => {
    setTMsg(''); setTErr('');
    try {
      await addTerritory({
        name: tForm.name,
        regions: tForm.regions.split(',').map((r) => r.trim()).filter(Boolean),
      }).unwrap();
      setTMsg('Territory created.');
      setTForm({ name: '', regions: '' });
    } catch (err: any) {
      setTErr(err?.data?.error || err?.data?.message || 'Failed to create territory.');
    }
  };

  const addTeamMember = async () => {
    setTeamMsg(''); setTeamErr('');
    try {
      await addAccountTeamMember({
        company: teamForm.companyId,
        user: teamForm.userId,
        teamRole: teamForm.teamRole,
      }).unwrap();
      setTeamMsg('Team member added.');
      setTeamForm({ companyId: '', userId: '', teamRole: 'owner' });
    } catch (err: any) {
      setTeamErr(err?.data?.error || err?.data?.message || 'Failed to add team member.');
    }
  };

  const membersCount = (c: any) => (Array.isArray(c.members) ? c.members.length : c.memberCount ?? c.membersCount ?? 0);
  const respondedCount = (c: any) => (Array.isArray(c.respondedMembers) ? c.respondedMembers.length : c.respondedCount ?? c.responsesCount ?? 0);

  const ageingRows: any[] = Array.isArray(ageing) ? ageing : ageing?.stages || [];
  const maxDays = Math.max(1, ...ageingRows.map((r) => Number(r.avgDaysInStage || 0)));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Growth Tools</h1>
      </div>

      <div className="flex gap-1 border-b">
        {(['campaigns', 'territories', 'teams', 'stageageing'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'campaigns' ? 'Campaigns' : t === 'territories' ? 'Territories' : t === 'teams' ? 'Account Teams' : 'Stage Ageing'}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {campaigns.length === 0 && <p className="text-sm text-gray-500 p-5">No campaigns yet.</p>}
            {campaigns.map((c: any) => (
              <div key={c._id} className="px-5 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">{c.channel}</span>
                      <span className="text-xs text-gray-500">${Number(c.budget || 0).toLocaleString()} budget</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Users2 className="h-3.5 w-3.5" /> {membersCount(c)} members</span>
                      <span className="flex items-center gap-1 text-xs text-green-600"><Target className="h-3.5 w-3.5" /> {respondedCount(c)} responded</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input placeholder="Contact ID" value={memberInputs[c._id] || ''} onChange={(e) => setMemberInputs({ ...memberInputs, [c._id]: e.target.value })} className={`${inputCls} max-w-xs`} />
                  <button onClick={() => addMember(c._id)} disabled={!memberInputs[c._id]} className="px-3 py-1.5 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium disabled:opacity-50 whitespace-nowrap">Add Member</button>
                  {memberMsg[c._id] && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> {memberMsg[c._id]}</span>}
                  {memberErrs[c._id] && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> {memberErrs[c._id]}</span>}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addCamp(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Campaign</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Name" value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} className={inputCls} required />
              <select value={cForm.channel} onChange={(e) => setCForm({ ...cForm, channel: e.target.value })} className={inputCls}>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <input type="number" min="0" placeholder="Budget" value={cForm.budget} onChange={(e) => setCForm({ ...cForm, budget: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Create Campaign</button>
              {cMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {cMsg}</span>}
              {cErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {cErr}</span>}
            </div>
          </form>
        </section>
      )}

      {tab === 'territories' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {territories.length === 0 && <p className="text-sm text-gray-500 p-5">No territories yet.</p>}
            {territories.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between px-5 py-3">
                <p className="font-medium text-gray-900">{t.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(t.regions || []).map((r: string) => (
                      <span key={r} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{r}</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{typeof t.owner === 'object' ? t.owner?.name : t.ownerName || t.owner}</span>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addTerr(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Territory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Territory name" value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} className={inputCls} required />
              <input placeholder="Regions (comma-separated)" value={tForm.regions} onChange={(e) => setTForm({ ...tForm, regions: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Create Territory</button>
              {tMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {tMsg}</span>}
              {tErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {tErr}</span>}
            </div>
          </form>
        </section>
      )}

      {tab === 'teams' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-4 text-gray-500">No account teams yet.</td></tr>
                )}
                {teams.map((t: any) => (
                  <tr key={t._id}>
                    <td className="px-5 py-3">{typeof t.company === 'object' ? t.company?.name : t.companyName || t.company}</td>
                    <td className="px-5 py-3">{typeof t.user === 'object' ? t.user?.name || t.user?.email : t.userName || t.user}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{t.teamRole}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addTeamMember(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Team Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Company ID" value={teamForm.companyId} onChange={(e) => setTeamForm({ ...teamForm, companyId: e.target.value })} className={inputCls} required />
              <input placeholder="User ID" value={teamForm.userId} onChange={(e) => setTeamForm({ ...teamForm, userId: e.target.value })} className={inputCls} required />
              <select value={teamForm.teamRole} onChange={(e) => setTeamForm({ ...teamForm, teamRole: e.target.value })} className={inputCls}>
                {TEAM_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Add Member</button>
              {teamMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {teamMsg}</span>}
              {teamErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {teamErr}</span>}
            </div>
          </form>
        </section>
      )}

      {tab === 'stageageing' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Stage Ageing</h2>
          {ageingRows.length === 0 && <p className="text-sm text-gray-500">No ageing data.</p>}
          {ageingRows.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm text-gray-600 capitalize">{r.stage ?? r._id ?? `Stage ${i + 1}`}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(Number(r.avgDaysInStage || 0) / maxDays) * 100}%` }} />
              </div>
              <span className="w-28 text-right text-sm text-gray-700">{Number(r.avgDaysInStage || 0).toFixed(1)}d · {r.count ?? r.dealCount ?? 0} deals</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
