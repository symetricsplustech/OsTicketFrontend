import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  Workflow,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Mail,
  CheckSquare,
  Clock,
  GripVertical,
  Play,
  Pause,
} from 'lucide-react';

type StepType = 'email' | 'task' | 'wait';

interface SequenceStep {
  id?: number;
  type: StepType;
  subject?: string;
  body?: string;
  description?: string;
  wait_days?: number;
  order: number;
}

interface ActivitySequence {
  id: number;
  name: string;
  description: string;
  steps: SequenceStep[];
  is_active: boolean;
  created: string;
}

interface SequenceFormData {
  name: string;
  description: string;
  steps: SequenceStep[];
  is_active: boolean;
}

const STEP_ICONS: Record<StepType, typeof Mail> = {
  email: Mail,
  task: CheckSquare,
  wait: Clock,
};

const STEP_COLORS: Record<StepType, string> = {
  email: 'bg-blue-100 text-blue-700',
  task: 'bg-green-100 text-green-700',
  wait: 'bg-yellow-100 text-yellow-700',
};

export default function ActivitySequences() {
  const [sequences, setSequences] = useState<ActivitySequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState<SequenceFormData>({
    name: '',
    description: '',
    steps: [],
    is_active: true,
  });

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/activity-sequences');
      setSequences(response.data as ActivitySequence[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/activity-sequences/${editingId}`, form);
      } else {
        await api.post('/extra/activity-sequences', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchSequences();
    } catch (err: any) {
      setError(err.message || 'Failed to save sequence');
    }
  };

  const handleEdit = (seq: ActivitySequence) => {
    setForm({
      name: seq.name,
      description: seq.description,
      steps: seq.steps.map((s, i) => ({ ...s, order: i })),
      is_active: seq.is_active,
    });
    setEditingId(seq.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return;
    try {
      await api.delete(`/extra/activity-sequences/${id}`);
      fetchSequences();
    } catch (err: any) {
      setError(err.message || 'Failed to delete sequence');
    }
  };

  const toggleActive = async (seq: ActivitySequence) => {
    try {
      await api.put(`/extra/activity-sequences/${seq.id}`, {
        is_active: !seq.is_active,
      });
      fetchSequences();
    } catch (err: any) {
      setError(err.message || 'Failed to update sequence');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', steps: [], is_active: true });
  };

  const addStep = (type: StepType) => {
    const newStep: SequenceStep = {
      type,
      order: form.steps.length,
      ...(type === 'email' ? { subject: '', body: '' } : {}),
      ...(type === 'task' ? { description: '' } : {}),
      ...(type === 'wait' ? { wait_days: 1 } : {}),
    };
    setForm({ ...form, steps: [...form.steps, newStep] });
  };

  const removeStep = (index: number) => {
    const updated = form.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setForm({ ...form, steps: updated });
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    const updated = [...form.steps];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, steps: updated });
  };

  const filteredSequences = sequences.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Activity Sequences
          </h1>
          <p className="text-sm text-gray-500 mt-1">Automate your sales and follow-up activities</p>
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
          New Sequence
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
            placeholder="Search sequences..."
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
              {editingId ? 'Edit Sequence' : 'New Sequence'}
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
                  placeholder="Sequence name"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => addStep('email')}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => addStep('task')}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1"
                >
                  <CheckSquare className="h-4 w-4" />
                  Task
                </button>
                <button
                  type="button"
                  onClick={() => addStep('wait')}
                  className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  Wait
                </button>
              </div>

              <div className="space-y-3">
                {form.steps.map((step, index) => {
                  const StepIcon = STEP_ICONS[step.type];
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${STEP_COLORS[step.type]}`}
                      >
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        {step.type === 'email' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Subject"
                              value={step.subject || ''}
                              onChange={(e) => updateStep(index, 'subject', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <textarea
                              placeholder="Email body"
                              value={step.body || ''}
                              onChange={(e) => updateStep(index, 'body', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}
                        {step.type === 'task' && (
                          <input
                            type="text"
                            placeholder="Task description"
                            value={step.description || ''}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                        {step.type === 'wait' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Wait</span>
                            <input
                              type="number"
                              min="1"
                              value={step.wait_days || 1}
                              onChange={(e) =>
                                updateStep(index, 'wait_days', parseInt(e.target.value))
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-sm text-gray-600">days</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {form.steps.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No steps added. Add email, task, or wait steps above.
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
          <p className="text-gray-500 mt-2">Loading sequences...</p>
        </div>
      ) : filteredSequences.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No sequences match your search' : 'No sequences found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSequences.map((seq) => (
            <div key={seq.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{seq.name}</h3>
                <button
                  onClick={() => toggleActive(seq)}
                  className={`p-1 rounded ${seq.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                  title={seq.is_active ? 'Active' : 'Inactive'}
                >
                  {seq.is_active ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">{seq.description || 'No description'}</p>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    seq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {seq.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">
                  {seq.steps?.length || 0} steps
                </span>
              </div>
              <div className="flex gap-1 mb-3">
                {seq.steps?.slice(0, 5).map((step, i) => {
                  const StepIcon = STEP_ICONS[step.type];
                  return (
                    <div
                      key={i}
                      className={`px-1.5 py-0.5 rounded ${STEP_COLORS[step.type]}`}
                      title={`${step.type}${step.type === 'wait' ? ` (${step.wait_days}d)` : ''}`}
                    >
                      <StepIcon className="h-3 w-3" />
                    </div>
                  );
                })}
                {(seq.steps?.length || 0) > 5 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{(seq.steps?.length || 0) - 5}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => handleEdit(seq)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(seq.id)}
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
