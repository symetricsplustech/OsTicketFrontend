import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Problem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  impact?: string;
  rootCause?: string;
  workaround?: string;
  assignedTo?: { name: string };
  linkedIncidents?: string[];
  createdAt: string;
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', rootCause: '', workaround: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/enterprise/problems');
      setProblems(res.data.problems || []);
    } catch { setProblems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/problems', form);
      toast.success('Problem created');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', rootCause: '', workaround: '' });
      load();
    } catch { toast.error('Failed to create problem'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Create Problem</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Problem</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 input-field">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Root Cause</label>
              <textarea value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} rows={2} className="mt-1 input-field" placeholder="Known root cause analysis..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Workaround</label>
              <textarea value={form.workaround} onChange={(e) => setForm({ ...form, workaround: e.target.value })} rows={2} className="mt-1 input-field" placeholder="Temporary workaround..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Problem'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Problem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Root Cause</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              problems.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No problems</td></tr> :
              problems.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{p.title}</p>
                    {p.description && <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>}
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    p.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    p.status === 'identified' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{p.status}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    p.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    p.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{p.priority}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500 line-clamp-1">{p.rootCause || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.assignedTo?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
