import api from '@shared/lib/api';
import { useState, useEffect, Fragment } from 'react';
import { Network, ShieldAlert, Activity, Plus, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Ci {
  _id: string;
  name: string;
  ciClass: string;
  status: string;
  criticality: string;
  environment: string;
  ipAddress?: string;
}
interface ImpactResult {
  impactedCount: number;
  impacted: { _id: string; name: string }[];
}
interface CmdbService {
  _id: string;
  name: string;
  type: string;
  criticality: string;
  healthScore: number;
}
interface HealthStats {
  total: number;
  stale: number;
  uncertified: number;
  noOwner: number;
  healthScore: number;
}

const CI_CLASSES = ['server', 'vm', 'application', 'database', 'network', 'cloud_resource', 'container', 'kubernetes_cluster', 'storage', 'service', 'business_application'];
const ENVIRONMENTS = ['production', 'staging', 'development', 'dr'];
type Tab = 'cis' | 'services' | 'health';

export default function CmdbExplorer() {
  const [tab, setTab] = useState<Tab>('cis');
  const [cis, setCis] = useState<Ci[]>([]);
  const [services, setServices] = useState<CmdbService[]>([]);
  const [health, setHealth] = useState<HealthStats | null>(null);
  const [filters, setFilters] = useState({ ciClass: '', environment: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [impact, setImpact] = useState<Record<string, ImpactResult>>({});

  useEffect(() => { load(); }, [tab]);
  useEffect(() => { if (tab === 'cis') loadCis(); }, [filters]);

  const loadCis = async () => {
    try {
      const { data } = await api.get('/em/cmdb/cis', { params: {
        ciClass: filters.ciClass || undefined,
        environment: filters.environment || undefined,
        search: filters.search || undefined,
      } });
      setCis(data);
    } catch {}
  };

  const load = async () => {
    try {
      if (tab === 'cis') await loadCis();
      if (tab === 'services') { const { data } = await api.get('/em/cmdb/services'); setServices(data); }
      if (tab === 'health') { const { data } = await api.get('/em/cmdb/health'); setHealth(data); }
    } catch {}
  };

  const createCi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/cmdb/cis', form);
      setShowForm(false); setForm({}); loadCis();
    } catch {}
  };

  const createService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/cmdb/services', form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const showImpact = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    try {
      const { data } = await api.get(`/em/cmdb/cis/${id}/impact`);
      setImpact({ ...impact, [id]: data });
      setExpandedId(id);
    } catch {}
  };

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    const cls = s === 'operational' || s === 'active' ? 'bg-green-100 text-green-700'
      : s === 'degraded' || s === 'stale' ? 'bg-orange-100 text-orange-700'
      : s === 'retired' || s === 'down' ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-600';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="h-6 w-6" /> CMDB Explorer</h1>
        {(tab === 'cis' || tab === 'services') && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add {tab === 'cis' ? 'CI' : 'Service'}
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {(['cis', 'services', 'health'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'cis' && (
        <form onSubmit={createCi} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.ciClass || ''} onChange={e => setForm({ ...form, ciClass: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">CI Class</option>
              {CI_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.environment || ''} onChange={e => setForm({ ...form, environment: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Environment</option>
              {ENVIRONMENTS.map(env => <option key={env} value={env}>{env}</option>)}
            </select>
            <select value={form.criticality || ''} onChange={e => setForm({ ...form, criticality: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Criticality</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input placeholder="IP Address" value={form.ipAddress || ''} onChange={e => setForm({ ...form, ipAddress: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'services' && (
        <form onSubmit={createService} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Type" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.criticality || ''} onChange={e => setForm({ ...form, criticality: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Criticality</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'cis' && (
        <>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
            <Search className="h-4 w-4 text-gray-400" />
            <input placeholder="Search CIs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="border rounded-lg px-3 py-2 flex-1" />
            <select value={filters.ciClass} onChange={e => setFilters({ ...filters, ciClass: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">All Classes</option>
              {CI_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.environment} onChange={e => setFilters({ ...filters, environment: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">All Environments</option>
              {ENVIRONMENTS.map(env => <option key={env} value={env}>{env}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Criticality</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {cis.map(ci => (
                  <Fragment key={ci._id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{ci.name}</td>
                      <td className="px-4 py-3">{ci.ciClass}</td>
                      <td className="px-4 py-3">{statusBadge(ci.status)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 ${ci.criticality === 'critical' || ci.criticality === 'high' ? 'text-red-600' : 'text-gray-600'}`}>
                          {(ci.criticality === 'critical' || ci.criticality === 'high') ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />} {ci.criticality}
                        </span>
                      </td>
                      <td className="px-4 py-3">{ci.environment}</td>
                      <td className="px-4 py-3 font-mono text-xs">{ci.ipAddress || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => showImpact(ci._id)} className="text-blue-600 hover:underline text-sm">Impact</button>
                      </td>
                    </tr>
                    {expandedId === ci._id && (
                      <tr className="bg-blue-50/50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <Activity className="h-4 w-4 mt-1 text-blue-500" />
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-700">Impacted CIs: <span className="font-bold text-blue-600">{impact[ci._id]?.impactedCount ?? 0}</span></p>
                              <div className="flex flex-wrap gap-2">
                                {(impact[ci._id]?.impacted || []).map(i => (
                                  <span key={i._id} className="bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs">{i.name}</span>
                                ))}
                                {!impact[ci._id]?.impacted?.length && <span className="text-sm text-gray-500">No downstream impacts detected.</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {cis.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400"><AlertTriangle className="h-5 w-5 inline mr-2" />No configuration items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s._id} className="bg-white p-4 rounded-lg border space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(s.criticality === 'critical' || s.criticality === 'high') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{s.criticality}</span>
              </div>
              <p className="text-sm text-gray-500">{s.type}</p>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Health Score</span><span>{s.healthScore}%</span></div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className={`h-2 rounded-full ${s.healthScore >= 80 ? 'bg-green-500' : s.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.healthScore}%` }} />
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-full bg-white border rounded-lg p-8 text-center text-gray-400"><AlertTriangle className="h-5 w-5 inline mr-2" />No services registered</div>
          )}
        </div>
      )}

      {tab === 'health' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <Network className="h-8 w-8 text-blue-500" />
              <div><p className="text-2xl font-bold">{health.total}</p><p className="text-sm text-gray-500">Total CIs</p></div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div><p className="text-2xl font-bold">{health.stale}</p><p className="text-sm text-gray-500">Stale</p></div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div><p className="text-2xl font-bold">{health.uncertified}</p><p className="text-sm text-gray-500">Uncertified</p></div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-purple-500" />
              <div><p className="text-2xl font-bold">{health.noOwner}</p><p className="text-sm text-gray-500">No Owner</p></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border flex flex-col items-center gap-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Activity className="h-5 w-5 text-green-600" /> Overall CMDB Health Score</h3>
            <div className={`w-44 h-44 rounded-full border-[14px] flex items-center justify-center ${(health.healthScore ?? 0) >= 80 ? 'border-green-500' : (health.healthScore ?? 0) >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
              <span className="text-4xl font-bold text-gray-800">{health.healthScore ?? 0}%</span>
            </div>
            <p className={`text-sm flex items-center gap-1 ${(health.healthScore ?? 0) >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {(health.healthScore ?? 0) >= 80 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {(health.healthScore ?? 0) >= 80 ? 'CMDB data quality is healthy' : 'Data quality needs attention'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
