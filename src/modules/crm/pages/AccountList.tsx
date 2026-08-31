import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Account {
  _id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  revenue?: number;
  employees?: number;
  status?: string;
  createdAt: string;
}

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '', email: '', revenue: '', employees: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/crm/accounts', { params });
      setAccounts(res.data.accounts || []);
    } catch { setAccounts([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/crm/accounts', {
        ...form,
        revenue: form.revenue ? Number(form.revenue) : undefined,
        employees: form.employees ? Number(form.employees) : undefined,
      });
      toast.success('Account created');
      setShowForm(false);
      setForm({ name: '', industry: '', website: '', phone: '', email: '', revenue: '', employees: '' });
      load();
    } catch { toast.error('Failed to create account'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Account</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Account</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="mt-1 input-field">
                <option value="">Select industry</option>
                <option>Technology</option><option>Healthcare</option><option>Finance</option><option>Education</option><option>Manufacturing</option><option>Retail</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mt-1 input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Revenue ($)</label>
              <input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employees</label>
              <input type="number" value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} className="mt-1 input-field" />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Account'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md input-field" />

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              accounts.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No accounts found</td></tr> :
              accounts.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><Link to={`/accounts/${a._id}`} className="text-sm font-medium text-brand-600">{a.name}</Link></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.industry || '—'}</td>
                  <td className="px-6 py-4 text-sm">{a.revenue ? `$${a.revenue.toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4 text-sm">{a.employees || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
