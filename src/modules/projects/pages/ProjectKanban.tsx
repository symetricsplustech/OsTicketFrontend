import api from '@shared/lib/api';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, Play, Activity, CheckCircle } from 'lucide-react';

interface KanbanProject {
  _id: string;
  name: string;
}

interface KanbanTask {
  _id: string;
  title?: string;
  name?: string;
  status: string;
  priority: string;
  assignee?: { name: string };
  dueDate?: string;
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: Clock },
  { id: 'in_progress', label: 'In Progress', icon: Play },
  { id: 'review', label: 'Review', icon: Activity },
  { id: 'done', label: 'Done', icon: CheckCircle },
];

const priorityBadge = (p: string) =>
  p === 'critical' || p === 'high'
    ? 'bg-red-100 text-red-700'
    : p === 'medium'
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-green-100 text-green-700';

export default function ProjectKanban() {
  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [projectId, setProjectId] = useState('');
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState('');

  useEffect(() => {
    api.get('/projects')
      .then((res) => {
        const list: KanbanProject[] = res.data.projects || [];
        setProjects(list);
        if (list.length > 0) setProjectId(list[0]._id);
      })
      .catch(() => setProjects([]));
  }, []);

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDrop = async (columnId: string) => {
    const taskId = dragId;
    setDragId('');
    if (!taskId) return;
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t._id === taskId ? { ...t, status: columnId } : t)));
    try {
      await api.put(`/projects/tasks/${taskId}`, { status: columnId });
      toast.success('Task moved');
      loadTasks();
    } catch {
      setTasks(prev);
      toast.error('Failed to move task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Kanban</h1>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-field w-64">
          <option value="">Select a project</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {!projectId && projects.length === 0 && !loading ? (
        <div className="card p-12 text-center text-gray-500">Create a project first to use the kanban board.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const items = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-64 shrink-0 bg-gray-100 rounded-xl p-3" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(col.id)}>
                <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-gray-200">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Icon className="h-4 w-4" />{col.label}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {loading ? (
                    <p className="text-center text-xs text-gray-400 py-6">Loading...</p>
                  ) : items.map((t) => (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={() => setDragId(t._id)}
                      onDragEnd={() => setDragId('')}
                      className={`bg-white rounded shadow p-2 text-sm cursor-move transition-shadow ${dragId === t._id ? 'opacity-50' : 'hover:shadow-md'}`}
                    >
                      <p className="font-medium text-gray-800 mb-1">{t.title || t.name || 'Untitled task'}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full ${priorityBadge(t.priority)}`}>{t.priority}</span>
                        {t.assignee?.name && <span className="text-[10px] text-gray-400">{t.assignee.name}</span>}
                      </div>
                    </div>
                  ))}
                  {!loading && items.length === 0 && <p className="text-center text-xs text-gray-400 py-6">Drop tasks here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
