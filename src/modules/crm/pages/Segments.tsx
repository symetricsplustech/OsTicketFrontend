import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Users,
  ArrowRight,
  Equal,
  ChevronDown,
} from 'lucide-react';

type OperatorType = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';

interface SegmentRule {
  id?: number;
  field: string;
  operator: OperatorType;
  value: string;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  rules: SegmentRule[];
  logic: 'AND' | 'OR';
  contact_count: number;
  created: string;
}

interface SegmentFormData {
  name: string;
  description: string;
  rules: SegmentRule[];
  logic: 'AND' | 'OR';
}

const FIELD_OPTIONS = [
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Lead Source' },
  { value: 'industry', label: 'Industry' },
  { value: 'company_size', label: 'Company Size' },
  { value: 'location', label: 'Location' },
  { value: 'lead_score', label: 'Lead Score' },
  { value: 'last_activity', label: 'Last Activity' },
  { value: 'created_date', label: 'Created Date' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals', icon: Equal },
  { value: 'not_equals', label: 'Not Equals', icon: Equal },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

export default function Segments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState<SegmentFormData>({
    name: '',
    description: '',
    rules: [],
    logic: 'AND',
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/segments');
      setSegments(response.data as Segment[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch segments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/segments/${editingId}`, form);
      } else {
        await api.post('/extra/segments', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchSegments();
    } catch (err: any) {
      setError(err.message || 'Failed to save segment');
    }
  };

  const handleEdit = (segment: Segment) => {
    setForm({
      name: segment.name,
      description: segment.description,
      rules: segment.rules,
      logic: segment.logic,
    });
    setEditingId(segment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    try {
      await api.delete(`/extra/segments/${id}`);
      fetchSegments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete segment');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', rules: [], logic: 'AND' });
  };

  const addRule = () => {
    setForm({
      ...form,
      rules: [...form.rules, { field: '', operator: 'equals', value: '' }],
    });
  };

  const removeRule = (index: number) => {
    setForm({ ...form, rules: form.rules.filter((_, i) => i !== index) });
  };

  const updateRule = (index: number, field: string, value: string) => {
    const updated = [...form.rules];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, rules: updated });
  };

  const filteredSegments = segments.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Filter className="h-6 w-6" />
            Segments
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage dynamic customer segments</p>
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
          New Segment
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
            placeholder="Search segments..."
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
              {editingId ? 'Edit Segment' : 'New Segment'}
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
                  placeholder="Segment name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Rules Builder
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Match:</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logic: 'AND' })}
                      className={`px-3 py-1 rounded ${
                        form.logic === 'AND'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ALL (AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logic: 'OR' })}
                      className={`px-3 py-1 rounded ${
                        form.logic === 'OR'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ANY (OR)
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addRule}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {form.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-xs font-medium text-gray-500 w-12">
                        {form.logic}
                      </span>
                    )}
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(index, 'field', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select field</option>
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(index, 'operator', e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {OPERATOR_OPTIONS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {form.rules.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    No rules added. Click "Add Rule" to build your segment.
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
          <p className="text-gray-500 mt-2">Loading segments...</p>
        </div>
      ) : filteredSegments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No segments match your search' : 'No segments found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSegments.map((segment) => (
            <div key={segment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{segment.name}</h3>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{segment.contact_count}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{segment.description || 'No description'}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {segment.rules?.slice(0, 3).map((rule, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {rule.field} {rule.operator.replace('_', ' ')} {rule.value}
                  </span>
                ))}
                {(segment.rules?.length || 0) > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                    +{(segment.rules?.length || 0) - 3} more
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                  {segment.logic}
                </span>
                <span className="text-xs text-gray-500">
                  {segment.rules?.length || 0} rules
                </span>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => handleEdit(segment)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(segment.id)}
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
    </div>
  );
}
