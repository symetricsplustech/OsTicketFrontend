import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface SlaPlan {
  _id: string;
  name: string;
  gracePeriod: number;
  schedule?: string;
  status: string;
  notes?: string;
}

export default function SlaPlans() {
  const [plans, setPlans] = useState<SlaPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', gracePeriod: '4', schedule: '24/7', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/sla-plans');
      setPlans(res.data.plans || []);
    } catch { setPlans([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/sla-plans', { ...form, gracePeriod: Number(form.gracePeriod) });
      toast.success('SLA plan created');
      setShowForm(false);
      setForm({ name: '', gracePeriod: '4', schedule: '24/7', notes: '' });
      load();
    } catch { toast.error('Failed to create SLA plan'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">SLA Plans</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add SLA Plan</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New SLA Plan</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grace Period (hours) *</label>
              <input type="number" required value={form.gracePeriod} onChange={(e) => setForm({ ...form, gracePeriod: e.target.value })} className="mt-1 input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <select value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="mt-1 input-field">
                <option>24/7</option>
                <option>Business Hours</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 input-field" />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create SLA Plan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grace Period (hrs)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              plans.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm">{p.gracePeriod}h</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.schedule || '24/7'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
