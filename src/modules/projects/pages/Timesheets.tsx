import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  Clock,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Check,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface TimesheetEntry {
  id: number;
  project_id: number;
  project_name: string;
  task: string;
  date: string;
  hours: number;
  description: string;
  status: TimesheetStatus;
  user: string;
  created: string;
}

interface TimesheetFormData {
  project_id: number;
  task: string;
  date: string;
  hours: number;
  description: string;
}

interface ProjectsList {
  id: number;
  name: string;
}

const STATUS_CONFIG: Record<TimesheetStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'all'>('all');
  const [projects, setProjects] = useState<ProjectsList[]>([]);

  const [form, setForm] = useState<TimesheetFormData>({
    project_id: 0,
    task: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: '',
  });

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, []);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/timesheets');
      setTimesheets(response.data as TimesheetEntry[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timesheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/extra/projects');
      setProjects(response.data as ProjectsList[]);
    } catch (err: any) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/timesheets/${editingId}`, form);
      } else {
        await api.post('/extra/timesheets', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to save timesheet');
    }
  };

  const handleEdit = (entry: TimesheetEntry) => {
    setForm({
      project_id: entry.project_id,
      task: entry.task,
      date: entry.date,
      hours: entry.hours,
      description: entry.description,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete(`/extra/timesheets/${id}`);
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to delete timesheet');
    }
  };

  const handleSubmitForApproval = async (id: number) => {
    try {
      await api.put(`/extra/timesheets/${id}/submit`);
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to submit timesheet');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/extra/timesheets/${id}/approve`);
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to approve timesheet');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/extra/timesheets/${id}/reject`);
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to reject timesheet');
    }
  };

  const resetForm = () => {
    setForm({
      project_id: 0,
      task: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      description: '',
    });
  };

  const filteredTimesheets = timesheets.filter((ts) => {
    const matchesSearch =
      ts.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ts.project_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ts.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalHours = filteredTimesheets.reduce((acc, ts) => acc + ts.hours, 0);

  const weeklyHours = timesheets
    .filter((ts) => {
      const tsDate = new Date(ts.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return tsDate >= weekAgo && tsDate <= now;
    })
    .reduce((acc, ts) => acc + ts.hours, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Timesheets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage time entries</p>
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
          Log Time
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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold">{weeklyHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Entries</p>
              <p className="text-2xl font-bold">{filteredTimesheets.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search timesheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TimesheetStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
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
              {editingId ? 'Edit Entry' : 'Log Time'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                <input
                  type="text"
                  required
                  value={form.task}
                  onChange={(e) => setForm({ ...form, task: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  required
                  value={form.hours}
                  onChange={(e) =>
                    setForm({ ...form, hours: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What did you work on?"
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
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading timesheets...</p>
        </div>
      ) : filteredTimesheets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No timesheets match your filters'
              : 'No timesheets found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTimesheets.map((entry) => {
                const statusConfig = STATUS_CONFIG[entry.status];
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.project_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.task}</td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.hours}h</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.user}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {entry.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitForApproval(entry.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Submit for approval"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {entry.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(entry.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(entry.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
