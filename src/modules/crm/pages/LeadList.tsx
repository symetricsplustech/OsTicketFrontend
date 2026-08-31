import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  score?: number;
  assignedTo?: { name: string };
  createdAt: string;
}

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/crm/leads', { params });
      setLeads(res.data.leads || []);
    } catch { setLeads([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/crm/leads', form);
      toast.success('Lead created');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', company: '', source: '' });
      load();
    } catch { toast.error('Failed to create lead'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Lead</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Lead</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-1 input-field">
                <option value="">Select source</option>
                <option>Website</option><option>Referral</option><option>Cold Call</option><option>Advertisement</option><option>Social Media</option><option>Other</option>
              </select>
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Lead'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md input-field" />

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              leads.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leads found</td></tr> :
              leads.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4"><Link to={`/leads/${l._id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">{l.name}</Link></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.company || '—'}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{l.status}</span></td>
                  <td className="px-6 py-4 text-sm">{l.score ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
