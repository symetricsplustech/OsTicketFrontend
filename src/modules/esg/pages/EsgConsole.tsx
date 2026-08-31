import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { Leaf, Plus, RefreshCw } from 'lucide-react';

interface EsgMetric {
  _id: string;
  name: string;
  framework?: string;
  pillar?: string;
  scope?: string;
  unit?: string;
  targetValue?: number;
  lastValue?: number | null;
  datapointCount?: number;
  dataPoints?: { value: number; period?: string }[];
}

interface EmissionFactor {
  _id: string;
  name: string;
  geography?: string;
  year?: number;
  source?: string;
  unitInput?: string;
  kgCO2ePerUnit?: number;
}

interface EsgDashboard {
  totalEmissions?: number;
  emissions?: { scope_1?: number; scope_2?: number; scope_3?: number };
  metricsTracked?: number;
  targetsMet?: number;
}

type Tab = 'metrics' | 'factors' | 'dashboard';

const PILLARS = ['environmental', 'social', 'governance'];
const FRAMEWORKS = ['GRI', 'SASB', 'TCFD', 'CSRD', 'BRSR', 'internal'];
const SCOPES = ['scope_1', 'scope_2', 'scope_3', 'na'];

export default function EsgConsole() {
  const [tab, setTab] = useState<Tab>('metrics');
  const [pillarFilter, setPillarFilter] = useState('environmental');
  const [metrics, setMetrics] = useState<EsgMetric[]>([]);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [dashboard, setDashboard] = useState<EsgDashboard>({});
  const [metricForm, setMetricForm] = useState({ name: '', framework: FRAMEWORKS[0], pillar: PILLARS[0], scope: SCOPES[3], unit: '', targetValue: 0 });
  const [factorForm, setFactorForm] = useState({ name: '', geography: '', year: new Date().getFullYear(), source: '', unitInput: '', kgCO2ePerUnit: 0 });
  const [dpForms, setDpForms] = useState<Record<string, { period: string; value: number }>>({});

  useEffect(() => {
    if (tab === 'metrics') loadMetrics();
    if (tab === 'factors') loadFactors();
    if (tab === 'dashboard') loadDashboard();
  }, [tab]);

  useEffect(() => { if (tab === 'metrics') loadMetrics(); }, [pillarFilter]);

  const loadMetrics = async () => {
    try { const { data } = await api.get('/em/esg/metrics?pillar=' + pillarFilter); setMetrics(data); } catch {}
  };

  const loadFactors = async () => {
    try { const { data } = await api.get('/em/esg/emission-factors'); setFactors(data); } catch {}
  };

  const loadDashboard = async () => {
    try { const { data } = await api.get('/em/esg/dashboard'); setDashboard(data); } catch {}
  };

  const createMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/esg/metrics', metricForm);
      setMetricForm({ name: '', framework: FRAMEWORKS[0], pillar: PILLARS[0], scope: SCOPES[3], unit: '', targetValue: 0 });
      loadMetrics();
    } catch {}
  };

  const addDataPoint = async (metricId: string) => {
    const dp = dpForms[metricId];
    if (!dp) return;
    try {
      await api.post(`/em/esg/metrics/${metricId}/data-point`, dp);
      setDpForms(prev => ({ ...prev, [metricId]: { period: '', value: 0 } }));
      loadMetrics();
    } catch {}
  };

  const createFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/esg/emission-factors', factorForm);
      setFactorForm({ name: '', geography: '', year: new Date().getFullYear(), source: '', unitInput: '', kgCO2ePerUnit: 0 });
      loadFactors();
    } catch {}
  };

  const lastValueOf = (m: EsgMetric) => {
    if (typeof m.lastValue === 'number') return m.lastValue;
    if (m.dataPoints?.length) return m.dataPoints[m.dataPoints.length - 1].value;
    return null;
  };

  const fmtKg = (v?: number) => `${(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} kgCO₂e`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6" /> ESG Console</h1>

      <div className="flex gap-2 border-b">
        {(['metrics', 'factors', 'dashboard'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'metrics' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {PILLARS.map(p => (
              <button key={p} onClick={() => setPillarFilter(p)} className={`px-4 py-2 rounded-lg text-sm capitalize font-medium ${pillarFilter === p ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{p}</button>
            ))}
          </div>

          <form onSubmit={createMetric} className="bg-white p-4 rounded-lg border space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Metric Name" value={metricForm.name} onChange={e => setMetricForm({ ...metricForm, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <select value={metricForm.framework} onChange={e => setMetricForm({ ...metricForm, framework: e.target.value })} className="border rounded-lg px-3 py-2">
                {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={metricForm.pillar} onChange={e => setMetricForm({ ...metricForm, pillar: e.target.value })} className="border rounded-lg px-3 py-2">
                {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={metricForm.scope} onChange={e => setMetricForm({ ...metricForm, scope: e.target.value })} className="border rounded-lg px-3 py-2">
                {SCOPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <input placeholder="Unit (e.g. tCO2e)" value={metricForm.unit} onChange={e => setMetricForm({ ...metricForm, unit: e.target.value })} className="border rounded-lg px-3 py-2" />
              <input type="number" step="any" placeholder="Target Value" value={metricForm.targetValue} onChange={e => setMetricForm({ ...metricForm, targetValue: +e.target.value })} className="border rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Plus className="h-4 w-4" /> Create Metric</button>
          </form>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map(m => {
              const lv = lastValueOf(m);
              return (
                <div key={m._id} className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{m.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{m.framework} · {(m.scope || 'na').replace(/_/g, ' ')} · target {m.targetValue ?? 0} {m.unit}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs capitalize">{m.pillar}</span>
                  </div>
                  <p className="text-sm">Last value: <span className="font-semibold">{lv !== null ? `${lv.toLocaleString()} ${m.unit || ''}` : '—'}</span> · {m.datapointCount ?? m.dataPoints?.length ?? 0} datapoints</p>
                  <div className="flex gap-2 items-center">
                    <input type="text" placeholder="Period (2026-Q3)" value={dpForms[m._id]?.period ?? ''} onChange={e => setDpForms(prev => ({ ...prev, [m._id]: { period: e.target.value, value: prev[m._id]?.value ?? 0 } }))} className="border rounded-lg px-3 py-2 text-sm w-40" />
                    <input type="number" step="any" placeholder="Value" value={dpForms[m._id]?.value ?? ''} onChange={e => setDpForms(prev => ({ ...prev, [m._id]: { period: prev[m._id]?.period ?? '', value: +e.target.value } }))} className="border rounded-lg px-3 py-2 text-sm w-28" />
                    <button onClick={() => addDataPoint(m._id)} disabled={!dpForms[m._id]?.period && !dpForms[m._id]?.value} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">Add Point</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'factors' && (
        <div className="space-y-4">
          <form onSubmit={createFactor} className="bg-white p-4 rounded-lg border space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Name" value={factorForm.name} onChange={e => setFactorForm({ ...factorForm, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input placeholder="Geography" value={factorForm.geography} onChange={e => setFactorForm({ ...factorForm, geography: e.target.value })} className="border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Year" value={factorForm.year} onChange={e => setFactorForm({ ...factorForm, year: +e.target.value })} className="border rounded-lg px-3 py-2" />
              <input placeholder="Source" value={factorForm.source} onChange={e => setFactorForm({ ...factorForm, source: e.target.value })} className="border rounded-lg px-3 py-2" />
              <input placeholder="Input Unit (kWh, km…)" value={factorForm.unitInput} onChange={e => setFactorForm({ ...factorForm, unitInput: e.target.value })} className="border rounded-lg px-3 py-2" />
              <input type="number" step="any" placeholder="kgCO2e per unit" value={factorForm.kgCO2ePerUnit} onChange={e => setFactorForm({ ...factorForm, kgCO2ePerUnit: +e.target.value })} className="border rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Plus className="h-4 w-4" /> Add Factor</button>
          </form>

          <div className="grid grid-cols-2 gap-4">
            {factors.map(f => (
              <div key={f._id} className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{f.geography || 'Global'} · {f.year} · {f.source}</p>
                <p className="text-sm mt-2 font-medium">{f.kgCO2ePerUnit?.toLocaleString()} kgCO₂e per {f.unitInput || 'unit'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={loadDashboard} className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 rounded-xl text-center">
            <p className="text-sm opacity-80">Total Emissions</p>
            <p className="text-5xl font-bold mt-2">{fmtKg(dashboard.totalEmissions)}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(['scope_1', 'scope_2', 'scope_3'] as const).map(scope => (
              <div key={scope} className="bg-white p-6 rounded-lg border text-center">
                <p className="text-sm text-gray-500 capitalize">{scope.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold mt-2 text-green-700">{fmtKg(dashboard.emissions?.[scope])}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg border text-center">
              <p className="text-sm text-gray-500">Metrics Tracked</p>
              <p className="text-3xl font-bold mt-2">{dashboard.metricsTracked ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border text-center">
              <p className="text-sm text-gray-500">Targets Met</p>
              <p className="text-3xl font-bold mt-2">{dashboard.targetsMet ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
