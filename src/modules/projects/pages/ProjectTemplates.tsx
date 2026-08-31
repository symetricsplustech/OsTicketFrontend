import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  CheckSquare,
  Flag,
  Copy,
} from 'lucide-react';

interface TemplateTask {
  id?: number;
  name: string;
  description: string;
  estimated_hours: number;
  order: number;
}

interface TemplateMilestone {
  id?: number;
  name: string;
  due_days: number;
  tasks: TemplateTask[];
}

interface ProjectTemplate {
  id: number;
  name: string;
  description: string;
  milestones: TemplateMilestone[];
  created: string;
  project_count: number;
}

interface TemplateFormData {
  name: string;
  description: string;
  milestones: TemplateMilestone[];
}

export default function ProjectTemplates() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState<TemplateFormData>({
    name: '',
    description: '',
    milestones: [],
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/project-templates');
      setTemplates(response.data as ProjectTemplate[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/project-templates/${editingId}`, form);
      } else {
        await api.post('/extra/project-templates', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    }
  };

  const handleEdit = (template: ProjectTemplate) => {
    setForm({
      name: template.name,
      description: template.description,
      milestones: template.milestones.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) => ({ ...t })),
      })),
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/extra/project-templates/${id}`);
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.post(`/extra/project-templates/${id}/duplicate`);
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate template');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', milestones: [] });
  };

  const addMilestone = () => {
    setForm({
      ...form,
      milestones: [...form.milestones, { name: '', due_days: 7, tasks: [] }],
    });
  };

  const removeMilestone = (index: number) => {
    setForm({
      ...form,
      milestones: form.milestones.filter((_, i) => i !== index),
    });
  };

  const updateMilestone = (index: number, field: string, value: string | number) => {
    const updated = [...form.milestones];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, milestones: updated });
  };

  const addTask = (milestoneIndex: number) => {
    const updated = [...form.milestones];
    updated[milestoneIndex].tasks.push({
      name: '',
      description: '',
      estimated_hours: 0,
      order: updated[milestoneIndex].tasks.length,
    });
    setForm({ ...form, milestones: updated });
  };

  const removeTask = (milestoneIndex: number, taskIndex: number) => {
    const updated = [...form.milestones];
    updated[milestoneIndex].tasks.splice(taskIndex, 1);
    setForm({ ...form, milestones: updated });
  };

  const updateTask = (
    milestoneIndex: number,
    taskIndex: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...form.milestones];
    updated[milestoneIndex].tasks[taskIndex] = {
      ...updated[milestoneIndex].tasks[taskIndex],
      [field]: value,
    };
    setForm({ ...form, milestones: updated });
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalTasks = (milestones: TemplateMilestone[]) =>
    milestones.reduce((acc, m) => acc + m.tasks.length, 0);

  const getTotalHours = (milestones: TemplateMilestone[]) =>
    milestones.reduce(
      (acc, m) => acc + m.tasks.reduce((tacc, t) => tacc + t.estimated_hours, 0),
      0
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Project Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reusable project templates with tasks and milestones
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
          New Template
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
            placeholder="Search templates..."
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
              {editingId ? 'Edit Template' : 'New Template'}
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
                  placeholder="Template name"
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
                  <Flag className="inline h-4 w-4 mr-1" />
                  Milestones
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-4">
                {form.milestones.map((milestone, mIndex) => (
                  <div key={mIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Flag className="h-4 w-4 text-yellow-500" />
                      <input
                        type="text"
                        placeholder="Milestone name"
                        value={milestone.name}
                        onChange={(e) => updateMilestone(mIndex, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={milestone.due_days}
                          onChange={(e) =>
                            updateMilestone(mIndex, 'due_days', parseInt(e.target.value))
                          }
                          className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(mIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2 ml-6">
                      {milestone.tasks.map((task, tIndex) => (
                        <div key={tIndex} className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Task name"
                            value={task.name}
                            onChange={(e) => updateTask(mIndex, tIndex, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={task.estimated_hours}
                              onChange={(e) =>
                                updateTask(
                                  mIndex,
                                  tIndex,
                                  'estimated_hours',
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-xs text-gray-500">hrs</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTask(mIndex, tIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTask(mIndex)}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Task
                      </button>
                    </div>
                  </div>
                ))}
                {form.milestones.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    No milestones added. Click "Add Milestone" to start building your template.
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
          <p className="text-gray-500 mt-2">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No templates match your search' : 'No templates found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{template.name}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {template.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  {template.milestones?.length || 0} milestones
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  {getTotalTasks(template.milestones)} tasks
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>Total: {getTotalHours(template.milestones)} hours estimated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{template.project_count} projects created</span>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => handleEdit(template)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
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
