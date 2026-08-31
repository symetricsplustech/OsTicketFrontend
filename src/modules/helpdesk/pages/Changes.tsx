import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Change {
  _id: string;
  title: string;
  description?: string;
  status: string;
  type?: string;
  risk?: string;
  reason?: string;
  plan?: string;
  rollbackPlan?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

const TYPES = ['standard', 'normal', 'emergency'];
const RISKS = ['low', 'medium', 'high', 'critical'];

export default function Changes() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'standard', risk: 'medium', reason: '', plan: '', rollbackPlan: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/enterprise/changes');
      setChanges(res.data.changes || []);
    } catch { setChanges([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/changes', form);
      toast.success('Change request created');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'standard', risk: 'medium', reason: '', plan: '', rollbackPlan: '' });
      load();
    } catch { toast.error('Failed to create change'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Request Change</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Change Request</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                <select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} className="mt-1 input-field">
                  {RISKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Change</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Implementation Plan</label>
              <textarea value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} rows={3} className="mt-1 input-field" placeholder="Step-by-step implementation plan..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rollback Plan</label>
              <textarea value={form.rollbackPlan} onChange={(e) => setForm({ ...form, rollbackPlan: e.target.value })} rows={3} className="mt-1 input-field" placeholder="Steps to rollback if change fails..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Submit Change Request'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              changes.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No change requests</td></tr> :
              changes.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{c.title}</p>
                    {c.description && <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{c.type || 'standard'}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    c.status === 'implemented' ? 'bg-green-100 text-green-700' :
                    c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{c.status}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    c.risk === 'critical' ? 'bg-red-100 text-red-700' :
                    c.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                    c.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{c.risk || 'medium'}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.assignedTo?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
