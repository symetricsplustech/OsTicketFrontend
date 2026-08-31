import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Opportunity {
  _id: string;
  name: string;
  stage: string;
  value?: number;
  account?: { name: string };
  assignedTo?: { name: string };
  closeDate?: string;
  createdAt: string;
}

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function OpportunityList() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', stage: 'Prospecting', value: '', closeDate: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterStage) params.stage = filterStage;
      const res = await api.get('/crm/opportunities', { params });
      setItems(res.data.opportunities || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/crm/opportunities', { ...form, value: form.value ? Number(form.value) : undefined });
      toast.success('Opportunity created');
      setShowForm(false);
      setForm({ name: '', stage: 'Prospecting', value: '', closeDate: '' });
      load();
    } catch { toast.error('Failed to create opportunity'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Opportunity</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Opportunity</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stage</label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="mt-1 input-field">
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Value ($)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Close Date</label>
              <input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} className="mt-1 input-field" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md input-field" />
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="input-field w-48">
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              items.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No opportunities found</td></tr> :
              items.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{o.name}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    o.stage === 'Closed Won' ? 'bg-green-100 text-green-700' :
                    o.stage === 'Closed Lost' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{o.stage}</span></td>
                  <td className="px-6 py-4 text-sm">{o.value ? `$${o.value.toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{o.account?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{o.assignedTo?.name || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
