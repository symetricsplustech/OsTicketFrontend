import { useGetOkrsQuery, useAddOkrMutation, useUpdateKeyResultMutation, useGetSprintsQuery, useAddSprintMutation, useSprintAddTaskMutation, useGetRateCardsQuery, useAddRateCardMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Target, Plus, CheckCircle, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'okrs' | 'sprints' | 'ratecards';

export default function PlanningExtras() {
  const [tab, setTab] = useState<Tab>('okrs');
  const [projectFilter, setProjectFilter] = useState('');
  const { data: okrs = [] } = useGetOkrsQuery();
  const { data: rateCards = [] } = useGetRateCardsQuery();
  const { data: sprints = [] } = useGetSprintsQuery(projectFilter.trim() ? { project: projectFilter.trim() } : {});

  const [addOkr] = useAddOkrMutation();
  const [updateKeyResult] = useUpdateKeyResultMutation();
  const [addSprint] = useAddSprintMutation();
  const [sprintAddTask] = useSprintAddTaskMutation();
  const [addRateCard] = useAddRateCardMutation();

  const [okrForm, setOkrForm] = useState({ objective: '', period: '', krTitle: '', krTarget: '', krUnit: '' });
  const [okrMsg, setOkrMsg] = useState('');
  const [okrErr, setOkrErr] = useState('');
  const [krErrs, setKrErrs] = useState<Record<string, string>>({});

  const [sprintForm, setSprintForm] = useState({ projectId: '', name: '', startDate: '', endDate: '' });
  const [sprintMsg, setSprintMsg] = useState('');
  const [sprintErr, setSprintErr] = useState('');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [taskMsg, setTaskMsg] = useState<Record<string, string>>({});
  const [taskErrs, setTaskErrs] = useState<Record<string, string>>({});

  const [rateForm, setRateForm] = useState({ role: '', rate: '', currency: 'USD', effectiveFrom: '' });
  const [rateMsg, setRateMsg] = useState('');
  const [rateErr, setRateErr] = useState('');

  const visibleSprints = sprints;

  const krStep = (kr: any) => Math.max(1, Math.round(Number(kr.target || 0) / 10));

  const adjustKr = async (okrId: string, krIndex: number, kr: any, dir: number) => {
    setKrErrs((m) => ({ ...m, [`${okrId}:${krIndex}`]: '' }));
    try {
      await updateKeyResult({ id: okrId, krIndex, current: Math.max(0, Number(kr.current || 0) + dir * krStep(kr)) }).unwrap();
    } catch (err: any) {
      setKrErrs((m) => ({ ...m, [`${okrId}:${krIndex}`]: err?.data?.error || err?.data?.message || 'Update failed.' }));
    }
  };

  const addNewOkr = async () => {
    setOkrMsg(''); setOkrErr('');
    try {
      await addOkr({
        objective: okrForm.objective,
        period: okrForm.period,
        keyResults: [{ title: okrForm.krTitle, target: Number(okrForm.krTarget), unit: okrForm.krUnit }],
      }).unwrap();
      setOkrMsg('OKR created.');
      setOkrForm({ objective: '', period: '', krTitle: '', krTarget: '', krUnit: '' });
    } catch (err: any) {
      setOkrErr(err?.data?.error || err?.data?.message || 'Failed to create OKR.');
    }
  };

  const addNewSprint = async () => {
    setSprintMsg(''); setSprintErr('');
    try {
      await addSprint({
        projectId: sprintForm.projectId,
        name: sprintForm.name,
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
      }).unwrap();
      setSprintMsg('Sprint created.');
      setSprintForm({ projectId: '', name: '', startDate: '', endDate: '' });
    } catch (err: any) {
      setSprintErr(err?.data?.error || err?.data?.message || 'Failed to create sprint.');
    }
  };

  const addTask = async (id: string) => {
    setTaskMsg((m) => ({ ...m, [id]: '' }));
    setTaskErrs((m) => ({ ...m, [id]: '' }));
    try {
      await sprintAddTask({ id, taskRef: taskInputs[id] }).unwrap();
      setTaskMsg((m) => ({ ...m, [id]: 'Task added to backlog.' }));
      setTaskInputs((m) => ({ ...m, [id]: '' }));
    } catch (err: any) {
      setTaskErrs((m) => ({ ...m, [id]: err?.data?.error || err?.data?.message || 'Failed to add task.' }));
    }
  };

  const addCard = async () => {
    setRateMsg(''); setRateErr('');
    try {
      await addRateCard({
        role: rateForm.role,
        rate: Number(rateForm.rate),
        currency: rateForm.currency,
        effectiveFrom: rateForm.effectiveFrom,
      }).unwrap();
      setRateMsg('Rate card added.');
      setRateForm({ role: '', rate: '', currency: 'USD', effectiveFrom: '' });
    } catch (err: any) {
      setRateErr(err?.data?.error || err?.data?.message || 'Failed to add rate card.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Planning Extras</h1>
      </div>

      <div className="flex gap-1 border-b">
        {(['okrs', 'sprints', 'ratecards'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'okrs' ? 'OKRs' : t === 'sprints' ? 'Sprints' : 'Rate Cards'}
          </button>
        ))}
      </div>

      {tab === 'okrs' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {okrs.length === 0 && <p className="text-sm text-gray-500">No OKRs yet.</p>}
            {okrs.map((o: any) => (
              <div key={o._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{o.objective}</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700">{o.period}</span>
                </div>
                {(o.keyResults || []).map((kr: any, i: number) => {
                  const pct = Math.min(100, Math.max(0, (Number(kr.current || 0) / Number(kr.target || 1)) * 100));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{kr.title ?? kr.name}</span>
                        <span className="text-gray-500">{Number(kr.current || 0)} / {Number(kr.target || 0)} {kr.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjustKr(o._id, i, kr, -1)} className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold">−</button>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <button onClick={() => adjustKr(o._id, i, kr, 1)} className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold">+</button>
                      </div>
                      {krErrs[`${o._id}:${i}`] && (
                        <p className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> {krErrs[`${o._id}:${i}`]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addNewOkr(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add OKR</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Objective" value={okrForm.objective} onChange={(e) => setOkrForm({ ...okrForm, objective: e.target.value })} className={inputCls} required />
              <input placeholder="Period (e.g. 2026-Q3)" value={okrForm.period} onChange={(e) => setOkrForm({ ...okrForm, period: e.target.value })} className={inputCls} required />
            </div>
            <p className="text-sm font-medium text-gray-700">Key result</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Key result title" value={okrForm.krTitle} onChange={(e) => setOkrForm({ ...okrForm, krTitle: e.target.value })} className={`${inputCls} md:col-span-2`} required />
              <input type="number" min="0" step="any" placeholder="Target" value={okrForm.krTarget} onChange={(e) => setOkrForm({ ...okrForm, krTarget: e.target.value })} className={inputCls} required />
              <input placeholder="Unit (%, count, $)" value={okrForm.krUnit} onChange={(e) => setOkrForm({ ...okrForm, krUnit: e.target.value })} className={inputCls} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Create OKR</button>
              {okrMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {okrMsg}</span>}
              {okrErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {okrErr}</span>}
            </div>
          </form>
        </section>
      )}

      {tab === 'sprints' && (
        <section className="space-y-4">
          <div className="max-w-sm">
            <input placeholder="Filter by project ID" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-3">
            {visibleSprints.length === 0 && <p className="text-sm text-gray-500">No sprints found.</p>}
            {visibleSprints.map((s: any) => (
              <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{typeof s.project === 'object' ? s.project?.name : s.projectId || s.project}</p>
                  </div>
                  <span className="text-xs text-gray-500">{s.startDate} → {s.endDate}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(s.tasks || []).map((t: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{typeof t === 'object' ? t.taskRef : t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input placeholder="Backlog task ref" value={taskInputs[s._id] || ''} onChange={(e) => setTaskInputs({ ...taskInputs, [s._id]: e.target.value })} className={`${inputCls} max-w-xs`} />
                  <button onClick={() => addTask(s._id)} disabled={!taskInputs[s._id]} className="px-3 py-1.5 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium disabled:opacity-50 whitespace-nowrap">Add Task</button>
                  {taskMsg[s._id] && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> {taskMsg[s._id]}</span>}
                  {taskErrs[s._id] && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> {taskErrs[s._id]}</span>}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addNewSprint(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Sprint</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Project ID" value={sprintForm.projectId} onChange={(e) => setSprintForm({ ...sprintForm, projectId: e.target.value })} className={inputCls} required />
              <input placeholder="Sprint name" value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })} className={inputCls} required />
              <label className="flex flex-col gap-1 text-xs text-gray-600">
                Start
                <input type="date" value={sprintForm.startDate} onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })} className={inputCls} required />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-600">
                End
                <input type="date" value={sprintForm.endDate} onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })} className={inputCls} required />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Create Sprint</button>
              {sprintMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {sprintMsg}</span>}
              {sprintErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {sprintErr}</span>}
            </div>
          </form>
        </section>
      )}

      {tab === 'ratecards' && (
        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Rate</th>
                  <th className="px-5 py-3 font-medium">Currency</th>
                  <th className="px-5 py-3 font-medium">Effective From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rateCards.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-4 text-gray-500">No rate cards yet.</td></tr>
                )}
                {rateCards.map((r: any) => (
                  <tr key={r._id}>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.role}</td>
                    <td className="px-5 py-3">{Number(r.rate).toLocaleString()}</td>
                    <td className="px-5 py-3">{r.currency}</td>
                    <td className="px-5 py-3">{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); addCard(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Add Rate Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input placeholder="Role" value={rateForm.role} onChange={(e) => setRateForm({ ...rateForm, role: e.target.value })} className={inputCls} required />
              <input type="number" min="0" step="0.01" placeholder="Rate" value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} className={inputCls} required />
              <select value={rateForm.currency} onChange={(e) => setRateForm({ ...rateForm, currency: e.target.value })} className={inputCls}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
              <label className="flex flex-col gap-1 text-xs text-gray-600">
                Effective from
                <input type="date" value={rateForm.effectiveFrom} onChange={(e) => setRateForm({ ...rateForm, effectiveFrom: e.target.value })} className={inputCls} required />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Add Rate Card</button>
              {rateMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {rateMsg}</span>}
              {rateErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {rateErr}</span>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
