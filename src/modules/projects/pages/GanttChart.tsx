import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Calendar, BarChart3 } from 'lucide-react';

interface GanttProject {
  _id: string;
  name: string;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
}

interface GanttTask {
  _id: string;
  title?: string;
  name?: string;
  status?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

const DAY = 86400000;
const WEEKS = 12;

export default function GanttChart() {
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setTasks([]);
      return;
    }
    api.get(`/projects/${selectedId}/tasks`)
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => setTasks([]));
  }, [selectedId]);

  const startTimes = projects.map((p) => (p.startDate ? new Date(p.startDate).getTime() : NaN)).filter((t) => !isNaN(t));
  const windowStart = startTimes.length ? Math.min(...startTimes) : Date.now();
  const windowEnd = windowStart + WEEKS * 7 * DAY;
  const pct = (date?: string) => {
    if (!date) return null;
    const t = new Date(date).getTime();
    if (isNaN(t)) return null;
    return Math.max(0, Math.min(100, ((t - windowStart) / (windowEnd - windowStart)) * 100));
  };
  const weeks = Array.from({ length: WEEKS }, (_, i) => new Date(windowStart + i * 7 * DAY));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Calendar className="h-6 w-6 text-brand-500" />Gantt Chart</h1>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-field w-64">
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="card p-5">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading timeline...</p>
        ) : projects.length === 0 ? (
          <p className="text-center py-12 text-gray-500"><BarChart3 className="inline h-5 w-5 mr-1" />No projects to display</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="flex border-b border-gray-200 pb-2 mb-3">
                <div className="w-56 shrink-0 text-xs font-medium text-gray-500 uppercase">Project</div>
                <div className="flex-1 grid grid-cols-12">
                  {weeks.map((d, i) => (
                    <div key={i} className="border-l border-gray-200 pl-1 text-[11px] text-gray-500 truncate">W{i + 1} · {d.getMonth() + 1}/{d.getDate()}</div>
                  ))}
                </div>
              </div>

              {projects.map((p) => {
                const s = pct(p.startDate);
                const e = pct(p.endDate);
                const left = s ?? 2;
                const width = s !== null && e !== null ? Math.max(e - s, 1.5) : 18;
                return (
                  <div key={p._id} className="mb-2">
                    <div className="flex items-center">
                      <div className="w-56 shrink-0 pr-3 truncate text-sm font-medium text-gray-800" title={p.name}>{p.name}</div>
                      <div className="flex-1 relative h-8 bg-gray-50 rounded">
                        <div className="absolute top-1 bottom-1 rounded bg-brand-500 overflow-hidden" style={{ left: `${left}%`, width: `${width}%` }}>
                          <div className="h-full bg-white/25" style={{ width: `${p.progress || 0}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">{p.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                    {selectedId === p._id && tasks.length > 0 && tasks.map((t) => {
                      const ts = pct(t.startDate);
                      const te = pct(t.endDate || t.dueDate);
                      const tl = ts ?? 2;
                      const tw = ts !== null && te !== null ? Math.max(te - ts, 1) : 12;
                      return (
                        <div key={t._id} className="flex items-center mt-1">
                          <div className="w-56 shrink-0 pr-3 pl-6 truncate text-xs text-gray-500" title={t.title || t.name}>{t.title || t.name || 'Task'}</div>
                          <div className="flex-1 relative h-5">
                            <div className="absolute top-0 bottom-0 rounded bg-indigo-400 overflow-hidden" style={{ left: `${tl}%`, width: `${tw}%` }}>
                              <div className="h-full bg-white/25" style={{ width: `${t.progress || 0}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="flex mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div className="w-56 shrink-0">Window: {new Date(windowStart).toLocaleDateString()} – {new Date(windowEnd).toLocaleDateString()}</div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-brand-500 inline-block" />Project</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-indigo-400 inline-block" />Task</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
