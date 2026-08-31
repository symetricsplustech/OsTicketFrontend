import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  BarChart3,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Play,
  Download,
  Filter,
  Calendar,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

type ChartType = 'bar' | 'pie' | 'line' | 'table';
type DataSource = 'leads' | 'deals' | 'contacts' | 'activities' | 'tickets';

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportMetric {
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

interface CustomReport {
  id: number;
  name: string;
  description: string;
  data_source: DataSource;
  chart_type: ChartType;
  filters: ReportFilter[];
  metrics: ReportMetric[];
  group_by?: string;
  created: string;
  last_run?: string;
}

interface ReportFormData {
  name: string;
  description: string;
  data_source: DataSource;
  chart_type: ChartType;
  filters: ReportFilter[];
  metrics: ReportMetric[];
  group_by: string;
}

const DATA_SOURCES: { value: DataSource; label: string }[] = [
  { value: 'leads', label: 'Leads' },
  { value: 'deals', label: 'Deals' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'activities', label: 'Activities' },
  { value: 'tickets', label: 'Tickets' },
];

const CHART_TYPES: { value: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'table', label: 'Table', icon: Filter },
];

const AGGREGATIONS = ['count', 'sum', 'avg', 'min', 'max'];
const OPERATORS = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportBuilder() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [runningReport, setRunningReport] = useState<number | null>(null);
  const [reportResult, setReportResult] = useState<any>(null);

  const [form, setForm] = useState<ReportFormData>({
    name: '',
    description: '',
    data_source: 'leads',
    chart_type: 'bar',
    filters: [],
    metrics: [],
    group_by: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/reports');
      setReports(response.data as CustomReport[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/reports/${editingId}`, form);
      } else {
        await api.post('/extra/reports', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    }
  };

  const handleEdit = (report: CustomReport) => {
    setForm({
      name: report.name,
      description: report.description,
      data_source: report.data_source,
      chart_type: report.chart_type,
      filters: report.filters || [],
      metrics: report.metrics || [],
      group_by: report.group_by || '',
    });
    setEditingId(report.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/extra/reports/${id}`);
      fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const handleRun = async (report: CustomReport) => {
    try {
      setRunningReport(report.id);
      setReportResult(null);
      const response = await api.post(`/extra/reports/${report.id}/run`);
      setReportResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to run report');
    } finally {
      setRunningReport(null);
    }
  };

  const handleExport = async (id: number) => {
    try {
      const response = await api.get(`/extra/reports/${id}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.csv`;
      link.click();
    } catch (err: any) {
      setError(err.message || 'Failed to export report');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      data_source: 'leads',
      chart_type: 'bar',
      filters: [],
      metrics: [],
      group_by: '',
    });
  };

  const addFilter = () => {
    setForm({
      ...form,
      filters: [...form.filters, { field: '', operator: 'equals', value: '' }],
    });
  };

  const removeFilter = (index: number) => {
    setForm({ ...form, filters: form.filters.filter((_, i) => i !== index) });
  };

  const updateFilter = (index: number, field: string, value: string) => {
    const updated = [...form.filters];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, filters: updated });
  };

  const addMetric = () => {
    setForm({
      ...form,
      metrics: [...form.metrics, { field: '', aggregation: 'count' }],
    });
  };

  const removeMetric = (index: number) => {
    setForm({ ...form, metrics: form.metrics.filter((_, i) => i !== index) });
  };

  const updateMetric = (index: number, field: string, value: string) => {
    const updated = [...form.metrics];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, metrics: updated });
  };

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChart = (data: any[], chartType: ChartType) => {
    if (!data || data.length === 0) {
      return <p className="text-gray-500 text-center py-8">No data available</p>;
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-2 text-sm text-gray-600">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Report Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create custom reports with filters, metrics, and visualizations
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Report' : 'New Report'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Report name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Source
                </label>
                <select
                  value={form.data_source}
                  onChange={(e) =>
                    setForm({ ...form, data_source: e.target.value as DataSource })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {DATA_SOURCES.map((ds) => (
                    <option key={ds.value} value={ds.value}>
                      {ds.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chart Type
                </label>
                <div className="flex gap-2">
                  {CHART_TYPES.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setForm({ ...form, chart_type: ct.value })}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                          form.chart_type === ct.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{ct.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Filters
                </label>
                <button
                  type="button"
                  onClick={addFilter}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Filter
                </button>
              </div>
              <div className="space-y-2">
                {form.filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={filter.field}
                      onChange={(e) => updateFilter(index, 'field', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Field name"
                    />
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => removeFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <BarChart3 className="inline h-4 w-4 mr-1" />
                  Metrics
                </label>
                <button
                  type="button"
                  onClick={addMetric}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Metric
                </button>
              </div>
              <div className="space-y-2">
                {form.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={metric.field}
                      onChange={(e) => updateMetric(index, 'field', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Field name"
                    />
                    <select
                      value={metric.aggregation}
                      onChange={(e) => updateMetric(index, 'aggregation', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {AGGREGATIONS.map((agg) => (
                        <option key={agg} value={agg}>
                          {agg}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <input
                type="text"
                value={form.group_by}
                onChange={(e) => setForm({ ...form, group_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Group by field (optional)"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {reportResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Report Results</h3>
            <button
              onClick={() => setReportResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {renderChart(reportResult.data, reportResult.chart_type)}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No reports match your search' : 'No reports found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const chartConfig = CHART_TYPES.find((ct) => ct.value === report.chart_type);
            const ChartIcon = chartConfig?.icon || BarChart3;
            return (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{report.name}</h3>
                  <ChartIcon className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {report.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="capitalize">{report.data_source}</span>
                  <span>•</span>
                  <span className="capitalize">{report.chart_type}</span>
                  <span>•</span>
                  <span>{report.filters?.length || 0} filters</span>
                </div>
                {report.last_run && (
                  <div className="text-xs text-gray-500 mb-3">
                    Last run: {new Date(report.last_run).toLocaleDateString()}
                  </div>
                )}
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    onClick={() => handleRun(report)}
                    disabled={runningReport === report.id}
                    className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    {runningReport === report.id ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={() => handleExport(report.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                  <button
                    onClick={() => handleEdit(report)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
