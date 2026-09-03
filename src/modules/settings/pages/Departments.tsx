import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Department {
  _id: string;
  name: string;
  email?: string;
  manager?: { name: string };
  sla?: { name: string };
  isPublic: boolean;
  autoAssign: boolean;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', managerName: '', slaName: '', isPublic: true, autoAssign: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments || []);
    } catch { setDepartments([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/departments', form);
      toast.success('Department created');
      setShowForm(false);
      setForm({ name: '', email: '', managerName: '', slaName: '', isPublic: true, autoAssign: false });
      load();
    } catch { toast.error('Failed to create department'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Department</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Department</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inbox email (mailbox routing)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="billing@company.com" className="mt-1 input-field" />
              <p className="text-xs text-gray-400 mt-1">Mail sent here routes to this dept (+ its SLA).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manager</label>
              <input type="text" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} className="mt-1 input-field" placeholder="Manager name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SLA Plan</label>
              <input type="text" value={form.slaName} onChange={(e) => setForm({ ...form, slaName: e.target.value })} className="mt-1 input-field" placeholder="SLA plan name" />
            </div>
            <div className="flex items-center gap-6 col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="rounded border-gray-300 text-brand-600" />
                Public department
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.autoAssign} onChange={(e) => setForm({ ...form, autoAssign: e.target.checked })} className="rounded border-gray-300 text-brand-600" />
                Auto-assign tickets
              </label>
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Department'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Public</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Assign</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              departments.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{d.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.manager?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.sla?.name || '—'}</td>
                  <td className="px-6 py-4">{d.isPublic ? <span className="text-green-600 text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  <td className="px-6 py-4">{d.autoAssign ? <span className="text-green-600 text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
