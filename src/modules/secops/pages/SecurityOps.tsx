import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Incident {
  _id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  triageScore?: number;
}
interface Vulnerability {
  _id: string;
  title: string;
  cveId?: string;
  severity: string;
  exploitability: string;
  status: string;
  riskScore?: number;
  slaDueAt?: string;
}
interface Posture {
  postureScore: number;
  [key: string]: any;
}

const CATEGORIES = ['phishing', 'malware', 'data_loss', 'account_takeover', 'unauthorized_access', 'insider_threat', 'ddos', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const EXPLOITABILITIES = ['low', 'medium', 'high'];
type Tab = 'incidents' | 'vulnerabilities' | 'posture';

export default function SecurityOps() {
  const [tab, setTab] = useState<Tab>('incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [posture, setPosture] = useState<Posture | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [scoredId, setScoredId] = useState<string | null>(null);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    try {
      if (tab === 'incidents') { const { data } = await api.get('/em/secops/incidents'); setIncidents(data); }
      if (tab === 'vulnerabilities') { const { data } = await api.get('/em/secops/vulnerabilities'); setVulns(data); }
      if (tab === 'posture') { const { data } = await api.get('/em/secops/posture'); setPosture(data); }
    } catch {}
  };

  const createIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/secops/incidents', form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const createVuln = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/secops/vulnerabilities', form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const triage = async (id: string) => {
    try { await api.post(`/em/secops/incidents/${id}/triage`); load(); } catch {}
  };

  const contain = async (id: string) => {
    const action = window.prompt('Describe the containment action:');
    if (!action) return;
    try {
      await api.post(`/em/secops/incidents/${id}/contain`, { action, advanceStatus: 'contained' });
      load();
    } catch {}
  };

  const scoreVuln = async (id: string) => {
    try {
      await api.post(`/em/secops/vulnerabilities/${id}/score`);
      setScoredId(id);
      load();
    } catch {}
  };

  const severityBadge = (severity: string) => {
    const cls = severity === 'critical' ? 'bg-red-100 text-red-700'
      : severity === 'high' ? 'bg-orange-100 text-orange-700'
      : severity === 'medium' ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-600';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{severity}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6" /> Security Operations</h1>
        {(tab === 'incidents' || tab === 'vulnerabilities') && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add {tab === 'incidents' ? 'Incident' : 'Vulnerability'}
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {(['incidents', 'vulnerabilities', 'posture'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); setScoredId(null); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'incidents' && (
        <form onSubmit={createIncident} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.severity || ''} onChange={e => setForm({ ...form, severity: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Severity</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'vulnerabilities' && (
        <form onSubmit={createVuln} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="CVE ID" value={form.cveId || ''} onChange={e => setForm({ ...form, cveId: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.severity || ''} onChange={e => setForm({ ...form, severity: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Severity</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.exploitability || ''} onChange={e => setForm({ ...form, exploitability: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Exploitability</option>
              {EXPLOITABILITIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'incidents' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{i.title}</td>
                  <td className="px-4 py-3">{i.category}</td>
                  <td className="px-4 py-3">{severityBadge(i.severity)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${i.status === 'contained' || i.status === 'closed' ? 'text-green-600' : i.status === 'open' ? 'text-orange-600' : 'text-gray-600'}`}>
                      {i.status === 'contained' || i.status === 'closed' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {i.status}{typeof i.triageScore === 'number' ? ` · score ${i.triageScore}` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                    <button onClick={() => triage(i._id)} className="text-blue-600 hover:underline">Triage</button>
                    <button onClick={() => contain(i._id)} className="text-red-600 hover:underline">Contain</button>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400"><CheckCircle className="h-5 w-5 inline mr-2" />No security incidents</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'vulnerabilities' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">CVE</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Exploitability</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">SLA Due</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vulns.map(v => (
                <tr key={v._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.cveId || '-'}</td>
                  <td className="px-4 py-3">{severityBadge(v.severity)}</td>
                  <td className="px-4 py-3 capitalize">{v.exploitability}</td>
                  <td className="px-4 py-3">
                    {typeof v.riskScore === 'number' ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${v.riskScore >= 70 ? 'text-red-600' : v.riskScore >= 40 ? 'text-orange-600' : 'text-green-600'}`}>
                        <Activity className="h-4 w-4" /> {v.riskScore}
                      </span>
                    ) : <span className="text-gray-400">Not scored</span>}
                    {scoredId === v._id && typeof v.riskScore === 'number' && <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">scored</span>}
                  </td>
                  <td className="px-4 py-3">{v.slaDueAt ? new Date(v.slaDueAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => scoreVuln(v._id)} className="text-blue-600 hover:underline">Score</button>
                  </td>
                </tr>
              ))}
              {vulns.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400"><CheckCircle className="h-5 w-5 inline mr-2" />No vulnerabilities tracked</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'posture' && posture && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border flex flex-col items-center">
            <p className="text-sm text-gray-500 flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4" /> Security Posture Score</p>
            <p className={`text-6xl font-bold ${(posture.postureScore ?? 0) >= 80 ? 'text-green-600' : (posture.postureScore ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{posture.postureScore ?? 0}</p>
            <p className="text-sm text-gray-400 mt-1">out of 100</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(posture)
              .filter(([k]) => k !== 'postureScore' && k !== '_id')
              .map(([k, v]) => (
                <div key={k} className="bg-white p-4 rounded-lg border">
                  <p className="text-2xl font-bold text-gray-800">{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</p>
                  <p className="text-sm text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
