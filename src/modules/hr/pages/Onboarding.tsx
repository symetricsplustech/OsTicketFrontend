import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  UserPlus,
  CheckCircle,
  Circle,
  Search,
  X,
  Calendar,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface OnboardingTask {
  id: number;
  name: string;
  description: string;
  category: string;
  due_days: number;
  is_mandatory: boolean;
  status: TaskStatus;
  completed_at?: string;
}

interface OnboardingChecklist {
  id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  position: string;
  start_date: string;
  progress: number;
  tasks: OnboardingTask[];
  status: 'in_progress' | 'completed';
  created: string;
}

interface NewEmployeeForm {
  employee_name: string;
  employee_email: string;
  department: string;
  position: string;
  start_date: string;
}

const TASK_STATUS_CONFIG: Record<TaskStatus, { icon: typeof CheckCircle; color: string }> = {
  pending: { icon: Circle, color: 'text-gray-400' },
  in_progress: { icon: Clock, color: 'text-yellow-500' },
  completed: { icon: CheckCircle, color: 'text-green-500' },
};

export default function Onboarding() {
  const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState<NewEmployeeForm>({
    employee_name: '',
    employee_email: '',
    department: '',
    position: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/onboarding');
      setChecklists(response.data as OnboardingChecklist[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch onboarding checklists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/extra/onboarding', form);
      setShowForm(false);
      resetForm();
      fetchChecklists();
    } catch (err: any) {
      setError(err.message || 'Failed to create onboarding checklist');
    }
  };

  const handleToggleTask = async (checklistId: number, taskId: number) => {
    try {
      await api.put(`/extra/onboarding/${checklistId}/tasks/${taskId}/toggle`);
      fetchChecklists();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const resetForm = () => {
    setForm({
      employee_name: '',
      employee_email: '',
      department: '',
      position: '',
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const filteredChecklists = checklists.filter((cl) => {
    const matchesSearch =
      cl.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cl.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cl.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Employee Onboarding
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage onboarding checklists for new employees
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Employee
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
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | 'in_progress' | 'completed')
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">New Employee Onboarding</h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  value={form.employee_name}
                  onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.employee_email}
                  onChange={(e) => setForm({ ...form, employee_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="employee@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
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
                <UserPlus className="h-4 w-4" />
                Start Onboarding
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading onboarding checklists...</p>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No checklists match your filters'
              : 'No onboarding checklists found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChecklists.map((checklist) => {
            const isExpanded = expandedId === checklist.id;
            const completedTasks =
              checklist.tasks?.filter((t) => t.status === 'completed').length || 0;
            const totalTasks = checklist.tasks?.length || 0;

            return (
              <div
                key={checklist.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(checklist.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-semibold">{checklist.employee_name}</h3>
                        <p className="text-sm text-gray-500">{checklist.employee_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {checklist.department}
                        </div>
                        <div className="text-xs text-gray-500">{checklist.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(checklist.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{completedTasks}/{totalTasks}</span>
                          <span>{Math.round((completedTasks / (totalTasks || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(completedTasks / (totalTasks || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          checklist.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {checklist.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="space-y-2">
                      {checklist.tasks?.map((task) => {
                        const StatusIcon = TASK_STATUS_CONFIG[task.status].icon;
                        const statusColor = TASK_STATUS_CONFIG[task.status].color;
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <button
                              onClick={() => handleToggleTask(checklist.id, task.id)}
                              className={statusColor}
                            >
                              <StatusIcon className="h-5 w-5" />
                            </button>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{task.name}</div>
                              <div className="text-xs text-gray-500">{task.description}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Due: Day {task.due_days}
                            </div>
                            {task.is_mandatory && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                                Required
                              </span>
                            )}
                            {task.completed_at && (
                              <span className="text-xs text-green-600">
                                Completed {new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {(!checklist.tasks || checklist.tasks.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No tasks configured for this checklist
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
