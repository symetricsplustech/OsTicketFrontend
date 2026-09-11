import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { taskApi } from '@modules/tasks/services/taskApi';
import type { Task, TaskStats } from '@shared/types/task';

const STATE_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending_customer: 'bg-orange-100 text-orange-700',
  pending_vendor: 'bg-orange-100 text-orange-700',
  pending_approval: 'bg-purple-100 text-purple-700',
  on_hold: 'bg-gray-100 text-gray-600',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
  planning: 'bg-gray-100 text-gray-600',
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  useEffect(() => {
    taskApi.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (stateFilter) params.state = stateFilter;
        if (typeFilter) params.type = typeFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (search) params.search = search;
        const res = await taskApi.list(params);
        setTasks(res.data.tasks);
        setTotal(res.data.total);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stateFilter, typeFilter, priorityFilter, search, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          {stats && (
            <div className="flex gap-3 mt-2 text-sm text-gray-500">
              {stats.byState.map((s) => (
                <span key={s._id} className="cursor-pointer hover:text-gray-800" onClick={() => setStateFilter(s._id === stateFilter ? '' : s._id)}>
                  {s._id}: {s.count}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link to="/tasks/new" className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Task
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All States</option>
          {['new', 'open', 'in_progress', 'pending_customer', 'pending_vendor', 'pending_approval', 'on_hold', 'resolved', 'closed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Types</option>
          {['task', 'incident', 'problem', 'change', 'request', 'subtask'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Priorities</option>
          {['critical', 'high', 'medium', 'low', 'planning'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No tasks found</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">State</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <Link to={`/tasks/${task._id}`} className="text-brand-600 font-medium hover:underline">{task.number}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{task.title}</td>
                  <td className="px-4 py-3 text-gray-600">{task.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATE_COLORS[task.state] || 'bg-gray-100'}`}>
                      {task.state.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{task.assignedTo?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
