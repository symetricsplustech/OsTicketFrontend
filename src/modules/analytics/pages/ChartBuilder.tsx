import api from '@shared/lib/api';
import { useState } from 'react';
import { BarChart3, Save, CheckCircle, XCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface Group {
  _id: string;
  count: number;
}

type Dataset = 'tickets' | 'leads' | 'opportunities';
type ChartType = 'bar' | 'line' | 'pie' | 'area';

const GROUP_FIELDS: Record<Dataset, string[]> = {
  tickets: ['status', 'priority', 'category'],
  leads: ['status', 'source'],
  opportunities: ['stage'],
};

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#06b6d4', '#f97316', '#64748b'];

export default function ChartBuilder() {
  const [dataset, setDataset] = useState<Dataset>('tickets');
  const [groupBy, setGroupBy] = useState('status');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groups, setGroups] = useState<Group[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectDataset = (d: Dataset) => {
    setDataset(d);
    setGroupBy(GROUP_FIELDS[d][0]);
    setGroups([]);
    setSavedMsg(null);
    setErrorMsg(null);
  };

  const generate = async () => {
    setGenerating(true);
    setSavedMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.post('/ops/drilldown', { dataset, groupBy });
      setGroups(res.data?.groups || []);
    } catch {
      setGroups([]);
      setErrorMsg('Failed to generate chart data.');
    } finally {
      setGenerating(false);
    }
  };

  const saveAsReport = async () => {
    const name = window.prompt('Report name');
    if (!name) return;
    try {
      await api.post('/extra/custom-reports', {
        name,
        module: 'analytics',
        type: 'chart',
        chartType,
        groupBy,
        filters: { dataset },
      });
      setSavedMsg(`Report "${name}" saved successfully.`);
      setErrorMsg(null);
    } catch {
      setErrorMsg('Failed to save report.');
      setSavedMsg(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        Chart Builder
      </h1>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dataset</label>
            <select
              value={dataset}
              onChange={(e) => selectDataset(e.target.value as Dataset)}
              className="mt-1 input-field capitalize"
            >
              {(Object.keys(GROUP_FIELDS) as Dataset[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="mt-1 input-field capitalize"
            >
              {GROUP_FIELDS[dataset].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="mt-1 input-field"
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
              <option value="area">Area</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} disabled={generating} className="btn-primary">
            {generating ? 'Generating…' : 'Generate'}
          </button>
          <button onClick={saveAsReport} disabled={groups.length === 0} className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50">
            <Save className="h-4 w-4" /> Save as report
          </button>
        </div>
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> {savedMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            <XCircle className="h-4 w-4" /> {errorMsg}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 capitalize">
          Preview — {dataset} by {groupBy}
        </h2>
        {groups.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">
            Configure the chart and click Generate to see a live preview.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            {chartType === 'bar' && (
              <BarChart data={groups} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {chartType === 'line' && (
              <LineChart data={groups} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={groups} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.5} strokeWidth={2} />
              </AreaChart>
            )}
            {chartType === 'pie' && (
              <PieChart>
                <Pie data={groups} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={110} label>
                  {groups.map((g, i) => (
                    <Cell key={g._id ?? i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
