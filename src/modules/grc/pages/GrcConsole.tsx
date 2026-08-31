import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { Scale, Gavel, Plus, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface Risk {
  _id: string;
  statement: string;
  category: string;
  likelihood: string;
  impact: string;
  treatment: string;
  status: string;
  inherentScore?: number;
  residualScore?: number;
}
interface RiskScore {
  inherent?: number;
  residual?: number;
  appetiteExceeded?: boolean;
}
interface Control {
  _id: string;
  name: string;
  controlObjective: string;
  controlType: string;
  frequency: string;
  status: string;
}
interface Policy {
  _id: string;
  title: string;
  category: string;
  content: string;
  status: string;
}
interface Audit {
  _id: string;
  name: string;
  auditType: string;
  scope: string;
  plannedStart: string;
  plannedEnd: string;
  status: string;
}
interface ContinuityPlan {
  _id: string;
  name: string;
  scope: string;
  rtoHours: number;
  rpoHours: number;
}

const LIKELIHOODS = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain'];
const IMPACTS = ['negligible', 'minor', 'moderate', 'major', 'severe'];
const TREATMENTS = ['mitigate', 'accept', 'transfer', 'avoid'];
const CONTROL_TYPES = ['preventive', 'detective', 'corrective', 'directive'];
const FREQUENCIES = ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'];
const AUDIT_TYPES = ['internal', 'external', 'compliance', 'security'];
type Tab = 'risks' | 'controls' | 'policies' | 'audits' | 'continuity';

export default function GrcConsole() {
  const [tab, setTab] = useState<Tab>('risks');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [riskScores, setRiskScores] = useState<Record<string, RiskScore>>({});

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    try {
      if (tab === 'risks') { const { data } = await api.get('/em/grc/risks'); setRisks(data); }
      if (tab === 'controls') { const { data } = await api.get('/em/grc/controls'); setControls(data); }
      if (tab === 'policies') { const { data } = await api.get('/em/grc/policies'); setPolicies(data); }
      if (tab === 'audits') { const { data } = await api.get('/em/grc/audits'); setAudits(data); }
      if (tab === 'continuity') { const { data } = await api.get('/em/grc/continuity-plans'); setPlans(data); }
    } catch {}
  };

  const submit = (url: string) => async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(url, form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const scoreRisk = async (id: string) => {
    try {
      const { data } = await api.post(`/em/grc/risks/${id}/score`);
      setRiskScores({ ...riskScores, [id]: data });
      load();
    } catch {}
  };

  const testControl = async (id: string) => {
    const method = window.prompt('Test method:');
    if (!method) return;
    const result = window.prompt('Result (effective|deficient):', 'effective');
    if (!result) return;
    try {
      await api.post(`/em/grc/controls/${id}/test`, { method, result });
      load();
    } catch {}
  };

  const publishPolicy = async (id: string) => {
    try { await api.post(`/em/grc/policies/${id}/publish`); load(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="h-6 w-6" /> GRC Console</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add
          </button>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {(['risks', 'controls', 'policies', 'audits', 'continuity'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'risks' && (
        <form onSubmit={submit('/em/grc/risks')} className="bg-white p-4 rounded-lg border space-y-3">
          <textarea placeholder="Risk statement" value={form.statement || ''} onChange={e => setForm({ ...form, statement: e.target.value })} className="border rounded-lg px-3 py-2 w-full" rows={2} required />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.likelihood || ''} onChange={e => setForm({ ...form, likelihood: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Likelihood</option>
              {LIKELIHOODS.map(l => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
            </select>
            <select value={form.impact || ''} onChange={e => setForm({ ...form, impact: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Impact</option>
              {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={form.treatment || ''} onChange={e => setForm({ ...form, treatment: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Treatment</option>
              {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Risk</button>
          </div>
        </form>
      )}

      {showForm && tab === 'controls' && (
        <form onSubmit={submit('/em/grc/controls')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Control objective" value={form.controlObjective || ''} onChange={e => setForm({ ...form, controlObjective: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.controlType || ''} onChange={e => setForm({ ...form, controlType: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Control Type</option>
              {CONTROL_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.frequency || ''} onChange={e => setForm({ ...form, frequency: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Frequency</option>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Control</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'policies' && (
        <form onSubmit={submit('/em/grc/policies')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <textarea placeholder="Content" value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} className="border rounded-lg px-3 py-2 w-full" rows={4} required />
          <input type="hidden" value="draft" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Draft</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'audits' && (
        <form onSubmit={submit('/em/grc/audits')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.auditType || ''} onChange={e => setForm({ ...form, auditType: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Audit Type</option>
              {AUDIT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input placeholder="Scope" value={form.scope || ''} onChange={e => setForm({ ...form, scope: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="date" value={form.plannedStart || ''} onChange={e => setForm({ ...form, plannedStart: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="date" value={form.plannedEnd || ''} onChange={e => setForm({ ...form, plannedEnd: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Schedule Audit</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'continuity' && (
        <form onSubmit={submit('/em/grc/continuity-plans')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Plan name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Scope" value={form.scope || ''} onChange={e => setForm({ ...form, scope: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="number" min={0} placeholder="RTO hours" value={form.rtoHours ?? ''} onChange={e => setForm({ ...form, rtoHours: +e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="number" min={0} placeholder="RPO hours" value={form.rpoHours ?? ''} onChange={e => setForm({ ...form, rpoHours: +e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Plan</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'risks' && (
        <div className="space-y-3">
          {risks.map(r => (
            <div key={r._id} className="bg-white p-4 rounded-lg border space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.statement}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.category}</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">L: {(r.likelihood || '').replace('_', ' ')}</span>
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full capitalize">I: {r.impact}</span>
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full capitalize">{r.treatment}</span>
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">{r.status}</span>
                  </div>
                </div>
                <button onClick={() => scoreRisk(r._id)} className="text-blue-600 hover:underline text-sm whitespace-nowrap flex items-center gap-1"><Activity className="h-4 w-4" /> Score</button>
              </div>
              {riskScores[r._id] && (
                <div className="flex flex-wrap items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold text-gray-700">Inherent: <span className="text-blue-600">{riskScores[r._id].inherent ?? '-'}</span></span>
                  <span className="font-semibold text-gray-700">Residual: <span className="text-purple-600">{riskScores[r._id].residual ?? '-'}</span></span>
                  {riskScores[r._id].appetiteExceeded
                    ? <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Appetite Exceeded</span>
                    : <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium"><CheckCircle className="h-3 w-3" /> Within Appetite</span>}
                </div>
              )}
            </div>
          ))}
          {risks.length === 0 && <div className="bg-white border rounded-lg p-8 text-center text-gray-400"><AlertTriangle className="h-5 w-5 inline mr-2" />No risks registered</div>}
        </div>
      )}

      {tab === 'controls' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Objective</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {controls.map(c => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.controlObjective}</td>
                  <td className="px-4 py-3 capitalize">{c.controlType}</td>
                  <td className="px-4 py-3 capitalize">{c.frequency}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${c.status === 'deficient' ? 'text-red-600' : c.status === 'effective' ? 'text-green-600' : 'text-gray-600'}`}>
                      {c.status === 'deficient' ? <XCircle className="h-4 w-4" /> : c.status === 'effective' ? <CheckCircle className="h-4 w-4" /> : null} {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => testControl(c._id)} className="text-blue-600 hover:underline">Test</button>
                  </td>
                </tr>
              ))}
              {controls.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No controls defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.map(p => (
            <div key={p._id} className="bg-white p-4 rounded-lg border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-gray-400" />
                  <h3 className="font-semibold">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.content}</p>
              </div>
              {p.status !== 'published' && (
                <button onClick={() => publishPolicy(p._id)} className="text-blue-600 hover:underline text-sm whitespace-nowrap">Publish</button>
              )}
            </div>
          ))}
          {policies.length === 0 && <div className="bg-white border rounded-lg p-8 text-center text-gray-400">No policies yet</div>}
        </div>
      )}

      {tab === 'audits' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Planned Window</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 capitalize">{a.auditType}</td>
                  <td className="px-4 py-3 text-gray-500">{a.scope}</td>
                  <td className="px-4 py-3">{a.plannedStart ? new Date(a.plannedStart).toLocaleDateString() : '-'} → {a.plannedEnd ? new Date(a.plannedEnd).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{a.status}</td>
                </tr>
              ))}
              {audits.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No audits scheduled</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'continuity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p._id} className="bg-white p-4 rounded-lg border space-y-2">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.scope}</p>
              <div className="flex gap-4 pt-2">
                <div>
                  <p className="text-xl font-bold text-orange-600">{p.rtoHours}h</p>
                  <p className="text-xs text-gray-400">RTO</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-600">{p.rpoHours}h</p>
                  <p className="text-xs text-gray-400">RPO</p>
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && <div className="col-span-full bg-white border rounded-lg p-8 text-center text-gray-400">No continuity plans</div>}
        </div>
      )}
    </div>
  );
}
