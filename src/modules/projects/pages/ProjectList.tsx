import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { FolderKanban, Calendar, BarChart3 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  spent: number;
  startDate?: string;
  endDate?: string;
  owner?: { name: string };
  manager?: { name: string };
  createdAt: string;
}

const STATUSES = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', startDate: '', endDate: '', budget: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || []);
    } catch { setProjects([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', { ...form, budget: form.budget ? Number(form.budget) : 0 });
      toast.success('Project created');
      setShowForm(false);
      setForm({ name: '', description: '', priority: 'medium', startDate: '', endDate: '', budget: '' });
      load();
    } catch { toast.error('Failed to create project'); } finally { setSaving(false); }
  };

  const statusColor = (s: string) => s === 'active' ? 'bg-green-100 text-green-700' : s === 'completed' ? 'bg-blue-100 text-blue-700' : s === 'on_hold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">New Project</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Project</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Name *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 input-field"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Budget ($)</label><input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Project'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md input-field" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40"><option value="">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-12 text-gray-500">Loading...</div> :
          projects.length === 0 ? <div className="col-span-3 text-center py-12 text-gray-500">No projects yet</div> :
          projects.map((p) => (
            <div key={p._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-brand-500" /><h3 className="font-semibold text-sm">{p.name}</h3></div>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColor(p.status)}`}>{p.status.replace('_', ' ')}</span>
              </div>
              {p.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{p.progress}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-brand-500 h-2 rounded-full" style={{ width: `${p.progress}%` }} /></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Owner: {p.owner?.name || '—'}</span>
                {p.budget > 0 && <span>Budget: ${p.budget.toLocaleString()}</span>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
