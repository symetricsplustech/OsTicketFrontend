import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Incident {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  impact?: string;
  commander?: { name: string };
  linkedTickets?: string[];
  createdAt: string;
  resolvedAt?: string;
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const IMPACTS = ['low', 'medium', 'high', 'enterprise'];

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', impact: 'medium' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/enterprise/incidents');
      setIncidents(res.data.incidents || []);
    } catch { setIncidents([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/incidents', form);
      toast.success('Incident created');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', impact: 'medium' });
      load();
    } catch { toast.error('Failed to create incident'); } finally { setSaving(false); }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/enterprise/incidents/${id}`, { status: 'resolved', resolvedAt: new Date().toISOString() });
      toast.success('Incident resolved');
      load();
    } catch { toast.error('Failed to resolve'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Report Incident</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Incident</h2>
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
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 input-field">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Impact</label>
                <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="mt-1 input-field">
                  {IMPACTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Incident'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commander</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              incidents.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No incidents</td></tr> :
              incidents.map((inc) => (
                <tr key={inc._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{inc.title}</p>
                    {inc.description && <p className="text-xs text-gray-500 line-clamp-1">{inc.description}</p>}
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    inc.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{inc.status}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    inc.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    inc.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{inc.priority}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inc.impact || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inc.commander?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(inc.createdAt)}</td>
                  <td className="px-6 py-4">
                    {inc.status !== 'resolved' && (
                      <button onClick={() => handleResolve(inc._id)} className="text-xs text-green-600 hover:text-green-700">Resolve</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
