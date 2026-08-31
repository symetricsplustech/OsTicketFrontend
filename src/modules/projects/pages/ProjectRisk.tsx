import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Shield,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type RiskStatus = 'identified' | 'analyzing' | 'mitigating' | 'closed';

interface ProjectRisk {
  id: number;
  title: string;
  description: string;
  project_id: number;
  project_name: string;
  probability: number;
  impact: number;
  level: RiskLevel;
  status: RiskStatus;
  mitigation_plan: string;
  owner: string;
  created: string;
}

interface RiskFormData {
  title: string;
  description: string;
  project_id: number;
  probability: number;
  impact: number;
  mitigation_plan: string;
  owner: string;
}

const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-green-700', bg: 'bg-green-100' },
  medium: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' },
};

const STATUS_CONFIG: Record<RiskStatus, { label: string; color: string; bg: string }> = {
  identified: { label: 'Identified', color: 'text-blue-700', bg: 'bg-blue-100' },
  analyzing: { label: 'Analyzing', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  mitigating: { label: 'Mitigating', color: 'text-purple-700', bg: 'bg-purple-100' },
  closed: { label: 'Closed', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const getRiskLevel = (probability: number, impact: number): RiskLevel => {
  const score = probability * impact;
  if (score >= 16) return 'critical';
  if (score >= 9) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'high':
      return '#F97316';
    case 'critical':
      return '#EF4444';
  }
};

export default function ProjectRisk() {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'all'>('all');
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);

  const [form, setForm] = useState<RiskFormData>({
    title: '',
    description: '',
    project_id: 0,
    probability: 1,
    impact: 1,
    mitigation_plan: '',
    owner: '',
  });

  useEffect(() => {
    fetchRisks();
    fetchProjects();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/project-risks');
      setRisks(response.data as ProjectRisk[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/extra/projects');
      setProjects(response.data as { id: number; name: string }[]);
    } catch (err: any) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        level: getRiskLevel(form.probability, form.impact),
      };
      if (editingId) {
        await api.put(`/extra/project-risks/${editingId}`, data);
      } else {
        await api.post('/extra/project-risks', data);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchRisks();
    } catch (err: any) {
      setError(err.message || 'Failed to save risk');
    }
  };

  const handleEdit = (risk: ProjectRisk) => {
    setForm({
      title: risk.title,
      description: risk.description,
      project_id: risk.project_id,
      probability: risk.probability,
      impact: risk.impact,
      mitigation_plan: risk.mitigation_plan,
      owner: risk.owner,
    });
    setEditingId(risk.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this risk?')) return;
    try {
      await api.delete(`/extra/project-risks/${id}`);
      fetchRisks();
    } catch (err: any) {
      setError(err.message || 'Failed to delete risk');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      project_id: 0,
      probability: 1,
      impact: 1,
      mitigation_plan: '',
      owner: '',
    });
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || risk.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const renderMatrix = () => {
    const matrix = [];
    for (let i = 5; i >= 1; i--) {
      const row = [];
      for (let j = 1; j <= 5; j++) {
        const level = getRiskLevel(j, i);
        const count = risks.filter(
          (r) => r.probability === j && r.impact === i
        ).length;
        row.push(
          <div
            key={`${i}-${j}`}
            className="w-12 h-12 flex items-center justify-center text-xs font-medium border border-gray-200"
            style={{ backgroundColor: getRiskColor(level) + '33' }}
          >
            {count > 0 ? count : ''}
          </div>
        );
      }
      matrix.push(
        <div key={i} className="flex items-center gap-1">
          <span className="w-6 text-xs text-gray-500 text-right">{i}</span>
          {row}
        </div>
      );
    }
    return matrix;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Project Risks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Identify and manage project risks
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
          New Risk
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Risk Matrix (Probability x Impact)</h3>
          <div className="space-y-1">
            {renderMatrix()}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <span>← Probability →</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }} />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F97316' }} />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }} />
                <span>Critical</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Risk Summary</h3>
          <div className="space-y-3">
            {Object.entries(LEVEL_CONFIG).map(([level, config]) => {
              const count = risks.filter((r) => r.level === level).length;
              return (
                <div key={level} className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as RiskLevel | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Levels</option>
          {Object.entries(LEVEL_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Risk' : 'New Risk'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk title"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the risk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  required
                  value={form.project_id}
                  onChange={(e) =>
                    setForm({ ...form, project_id: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk owner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probability (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.probability}
                  onChange={(e) =>
                    setForm({ ...form, probability: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.impact}
                  onChange={(e) =>
                    setForm({ ...form, impact: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level:{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      LEVEL_CONFIG[getRiskLevel(form.probability, form.impact)].bg
                    } ${LEVEL_CONFIG[getRiskLevel(form.probability, form.impact)].color}`}
                  >
                    {LEVEL_CONFIG[getRiskLevel(form.probability, form.impact)].label}
                  </span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitigation Plan
                </label>
                <textarea
                  rows={2}
                  value={form.mitigation_plan}
                  onChange={(e) =>
                    setForm({ ...form, mitigation_plan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How will you mitigate this risk?"
                />
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
          <p className="text-gray-500 mt-2">Loading risks...</p>
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || levelFilter !== 'all'
              ? 'No risks match your filters'
              : 'No risks identified'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRisks.map((risk) => {
                const levelConfig = LEVEL_CONFIG[risk.level];
                const score = risk.probability * risk.impact;
                return (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {risk.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {risk.project_name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${levelConfig.bg} ${levelConfig.color}`}
                      >
                        {levelConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{score}</span>
                        {score >= 9 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{risk.owner}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(risk)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(risk.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
