import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Clock,
  User,
  Tag,
  Eye,
} from 'lucide-react';

type RequestCategory = 'leave' | 'expense' | 'equipment' | 'access' | 'other';

interface HrRequestType {
  id: number;
  name: string;
  description: string;
  category: RequestCategory;
  sla_days: number;
  required_fields: string[];
  approval_workflow: string;
  is_active: boolean;
  usage_count: number;
  created: string;
}

interface HrRequestTypeFormData {
  name: string;
  description: string;
  category: RequestCategory;
  sla_days: number;
  required_fields: string[];
  approval_workflow: string;
  is_active: boolean;
}

const CATEGORY_CONFIG: Record<RequestCategory, { label: string; color: string; bg: string }> = {
  leave: { label: 'Leave', color: 'text-blue-700', bg: 'bg-blue-100' },
  expense: { label: 'Expense', color: 'text-green-700', bg: 'bg-green-100' },
  equipment: { label: 'Equipment', color: 'text-purple-700', bg: 'bg-purple-100' },
  access: { label: 'Access', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  other: { label: 'Other', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const FIELD_OPTIONS = [
  'start_date',
  'end_date',
  'reason',
  'amount',
  'description',
  'vendor',
  'priority',
  'justification',
];

export default function HrRequestCatalogue() {
  const [requestTypes, setRequestTypes] = useState<HrRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory | 'all'>('all');
  const [fieldInput, setFieldInput] = useState('');

  const [form, setForm] = useState<HrRequestTypeFormData>({
    name: '',
    description: '',
    category: 'leave',
    sla_days: 3,
    required_fields: [],
    approval_workflow: 'manager',
    is_active: true,
  });

  useEffect(() => {
    fetchRequestTypes();
  }, []);

  const fetchRequestTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/hr-request-catalogue');
      setRequestTypes(response.data as HrRequestType[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch request types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/hr-request-catalogue/${editingId}`, form);
      } else {
        await api.post('/extra/hr-request-catalogue', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchRequestTypes();
    } catch (err: any) {
      setError(err.message || 'Failed to save request type');
    }
  };

  const handleEdit = (type: HrRequestType) => {
    setForm({
      name: type.name,
      description: type.description,
      category: type.category,
      sla_days: type.sla_days,
      required_fields: type.required_fields || [],
      approval_workflow: type.approval_workflow,
      is_active: type.is_active,
    });
    setEditingId(type.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request type?')) return;
    try {
      await api.delete(`/extra/hr-request-catalogue/${id}`);
      fetchRequestTypes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete request type');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: 'leave',
      sla_days: 3,
      required_fields: [],
      approval_workflow: 'manager',
      is_active: true,
    });
  };

  const addField = () => {
    if (fieldInput && !form.required_fields.includes(fieldInput)) {
      setForm({ ...form, required_fields: [...form.required_fields, fieldInput] });
      setFieldInput('');
    }
  };

  const removeField = (field: string) => {
    setForm({
      ...form,
      required_fields: form.required_fields.filter((f) => f !== field),
    });
  };

  const filteredTypes = requestTypes.filter((type) => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || type.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            HR Request Catalogue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage HR request types and their configurations
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
          New Request Type
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

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search request types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RequestCategory | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
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
              {editingId ? 'Edit Request Type' : 'New Request Type'}
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
                  placeholder="Request type name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as RequestCategory })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SLA (Business Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.sla_days}
                  onChange={(e) =>
                    setForm({ ...form, sla_days: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Workflow
                </label>
                <select
                  value={form.approval_workflow}
                  onChange={(e) =>
                    setForm({ ...form, approval_workflow: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="manager">Manager Approval</option>
                  <option value="hr">HR Approval</option>
                  <option value="auto">Auto Approve</option>
                  <option value="multi">Multi-level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.value === 'active' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Fields
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select field</option>
                    {FIELD_OPTIONS.filter((f) => !form.required_fields.includes(f)).map((f) => (
                      <option key={f} value={f}>
                        {f.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addField}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.required_fields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm flex items-center gap-1"
                    >
                      {field.replace(/_/g, ' ')}
                      <button
                        type="button"
                        onClick={() => removeField(field)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
          <p className="text-gray-500 mt-2">Loading request types...</p>
        </div>
      ) : filteredTypes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || categoryFilter !== 'all'
              ? 'No request types match your filters'
              : 'No request types found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((type) => {
            const categoryConfig = CATEGORY_CONFIG[type.category];
            return (
              <div
                key={type.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{type.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${categoryConfig.bg} ${categoryConfig.color}`}
                  >
                    {categoryConfig.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {type.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    {type.sla_days} days SLA
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4 text-green-500" />
                    {type.usage_count} uses
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>Workflow: {type.approval_workflow}</span>
                  <span>-</span>
                  <span>{type.required_fields?.length || 0} fields</span>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
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
