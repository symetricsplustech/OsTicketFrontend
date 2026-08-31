import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  Layout,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  GripVertical,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Settings,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

type WidgetType = 'metric' | 'chart_bar' | 'chart_pie' | 'chart_line' | 'list' | 'activity';
type WidgetSize = 'small' | 'medium' | 'large';

interface DashboardWidget {
  id?: number;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  data_source: string;
  config: Record<string, any>;
  position: number;
}

interface Dashboard {
  id: number;
  name: string;
  description: string;
  role: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created: string;
}

interface DashboardFormData {
  name: string;
  description: string;
  role: string;
  widgets: DashboardWidget[];
  is_default: boolean;
}

const WIDGET_TYPES: { value: WidgetType; label: string; icon: typeof BarChart3 }[] = [
  { value: 'metric', label: 'Metric', icon: TrendingUp },
  { value: 'chart_bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'chart_pie', label: 'Pie Chart', icon: PieChart },
  { value: 'chart_line', label: 'Line Chart', icon: TrendingUp },
  { value: 'list', label: 'List', icon: Users },
  { value: 'activity', label: 'Activity', icon: Clock },
];

const WIDGET_SIZES: { value: WidgetSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const DATA_SOURCES = [
  'leads_count',
  'deals_pipeline',
  'tickets_open',
  'agents_performance',
  'recent_activities',
  'conversion_rate',
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const MOCK_DATA: Record<string, any[]> = {
  leads_count: [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 62 },
    { name: 'Mar', value: 38 },
    { name: 'Apr', value: 73 },
    { name: 'May', value: 56 },
  ],
  deals_pipeline: [
    { name: 'Prospecting', value: 250000 },
    { name: 'Qualification', value: 180000 },
    { name: 'Proposal', value: 120000 },
    { name: 'Negotiation', value: 85000 },
    { name: 'Closed Won', value: 320000 },
  ],
  tickets_open: [
    { name: 'Open', value: 24 },
    { name: 'Pending', value: 12 },
    { name: 'Resolved', value: 45 },
  ],
  agents_performance: [
    { name: 'Agent A', value: 85 },
    { name: 'Agent B', value: 72 },
    { name: 'Agent C', value: 91 },
    { name: 'Agent D', value: 68 },
  ],
  recent_activities: [],
  conversion_rate: [
    { name: 'Week 1', value: 12 },
    { name: 'Week 2', value: 18 },
    { name: 'Week 3', value: 15 },
    { name: 'Week 4', value: 22 },
  ],
};

export default function DashboardBuilder() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDashboard, setPreviewDashboard] = useState<Dashboard | null>(null);

  const [form, setForm] = useState<DashboardFormData>({
    name: '',
    description: '',
    role: '',
    widgets: [],
    is_default: false,
  });

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/dashboards');
      setDashboards(response.data as Dashboard[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/dashboards/${editingId}`, form);
      } else {
        await api.post('/extra/dashboards', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchDashboards();
    } catch (err: any) {
      setError(err.message || 'Failed to save dashboard');
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setForm({
      name: dashboard.name,
      description: dashboard.description,
      role: dashboard.role,
      widgets: dashboard.widgets.map((w) => ({ ...w })),
      is_default: dashboard.is_default,
    });
    setEditingId(dashboard.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    try {
      await api.delete(`/extra/dashboards/${id}`);
      fetchDashboards();
    } catch (err: any) {
      setError(err.message || 'Failed to delete dashboard');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      role: '',
      widgets: [],
      is_default: false,
    });
  };

  const addWidget = () => {
    setForm({
      ...form,
      widgets: [
        ...form.widgets,
        {
          title: '',
          type: 'metric',
          size: 'medium',
          data_source: 'leads_count',
          config: {},
          position: form.widgets.length,
        },
      ],
    });
  };

  const removeWidget = (index: number) => {
    const updated = form.widgets
      .filter((_, i) => i !== index)
      .map((w, i) => ({ ...w, position: i }));
    setForm({ ...form, widgets: updated });
  };

  const updateWidget = (index: number, field: string, value: any) => {
    const updated = [...form.widgets];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, widgets: updated });
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const updated = [...form.widgets];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((w, i) => (w.position = i));
    setForm({ ...form, widgets: updated });
  };

  const renderWidgetPreview = (widget: DashboardWidget) => {
    const data = MOCK_DATA[widget.data_source] || [];

    switch (widget.type) {
      case 'metric':
        const total = data.reduce((acc: number, item: any) => acc + (item.value || 0), 0);
        return (
          <div className="text-center">
            <p className="text-3xl font-bold">{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{widget.title || 'Metric'}</p>
          </div>
        );
      case 'chart_bar':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data}>
              <Bar dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'chart_pie':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'chart_line':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'list':
        return (
          <div className="space-y-1">
            {data.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-2">
            {['New lead assigned', 'Ticket resolved', 'Deal closed'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const filteredDashboards = dashboards.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="h-6 w-6" />
            Dashboard Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create custom dashboards with configurable widgets
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
          New Dashboard
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
            placeholder="Search dashboards..."
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
              {editingId ? 'Edit Dashboard' : 'New Dashboard'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dashboard name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., manager, agent, admin"
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as default dashboard</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Settings className="inline h-4 w-4 mr-1" />
                  Widgets
                </label>
                <button
                  type="button"
                  onClick={addWidget}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Widget
                </button>
              </div>

              <div className="space-y-4">
                {form.widgets.map((widget, index) => {
                  const WidgetTypeConfig = WIDGET_TYPES.find((wt) => wt.value === widget.type);
                  const WidgetIcon = WidgetTypeConfig?.icon || BarChart3;
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <WidgetIcon className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          value={widget.title}
                          onChange={(e) => updateWidget(index, 'title', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Widget title"
                        />
                        <select
                          value={widget.type}
                          onChange={(e) => updateWidget(index, 'type', e.target.value)}
                          className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {WIDGET_TYPES.map((wt) => (
                            <option key={wt.value} value={wt.value}>
                              {wt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={widget.size}
                          onChange={(e) => updateWidget(index, 'size', e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {WIDGET_SIZES.map((ws) => (
                            <option key={ws.value} value={ws.value}>
                              {ws.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={widget.data_source}
                          onChange={(e) => updateWidget(index, 'data_source', e.target.value)}
                          className="w-40 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {DATA_SOURCES.map((ds) => (
                            <option key={ds} value={ds}>
                              {ds.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveWidget(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveWidget(index, 'down')}
                            disabled={index === form.widgets.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWidget(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-2">
                        {renderWidgetPreview(widget)}
                      </div>
                    </div>
                  );
                })}
                {form.widgets.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    No widgets added. Click "Add Widget" to build your dashboard.
                  </p>
                )}
              </div>
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

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading dashboards...</p>
        </div>
      ) : filteredDashboards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Layout className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No dashboards match your search' : 'No dashboards found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{dashboard.name}</h3>
                {dashboard.is_default && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {dashboard.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  {dashboard.widgets?.length || 0} widgets
                </span>
                {dashboard.role && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                    {dashboard.role}
                  </span>
                )}
              </div>
              <div className="flex gap-1 mb-3">
                {dashboard.widgets?.slice(0, 6).map((widget, i) => {
                  const wtConfig = WIDGET_TYPES.find((wt) => wt.value === widget.type);
                  const Icon = wtConfig?.icon || BarChart3;
                  return (
                    <div
                      key={i}
                      className="p-1 bg-gray-100 rounded"
                      title={widget.title || widget.type}
                    >
                      <Icon className="h-3 w-3 text-gray-500" />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => setPreviewDashboard(dashboard)}
                  className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <button
                  onClick={() => handleEdit(dashboard)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dashboard.id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{previewDashboard.name}</h2>
              <button
                onClick={() => setPreviewDashboard(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {previewDashboard.widgets?.map((widget, i) => (
                  <div
                    key={i}
                    className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${
                      widget.size === 'large'
                        ? 'col-span-2'
                        : widget.size === 'small'
                          ? 'col-span-1'
                          : 'col-span-1'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {widget.title || 'Widget'}
                    </h4>
                    {renderWidgetPreview(widget)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
