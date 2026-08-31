import React, { useState, useEffect } from 'react';
import { useGetSaAdminsQuery, useCreateSaAdminMutation, useUpdateSaAdminMutation, useDeleteSaAdminMutation } from '@shared/store/apiEndpoints';
import { Plus, Trash2, Edit, Shield, X, CheckCircle } from 'lucide-react';

interface AdminForm {
  name: string;
  email: string;
  password: string;
  platformRole: string;
  permissions: string[];
}

const PLATFORM_ROLES = [
  { value: 'platform_owner', label: 'Platform Owner' },
  { value: 'platform_administrator', label: 'Platform Administrator' },
  { value: 'platform_support_administrator', label: 'Support Administrator' },
  { value: 'platform_security_administrator', label: 'Security Administrator' },
  { value: 'platform_auditor', label: 'Platform Auditor' },
];

const emptyForm: AdminForm = { name: '', email: '', password: '', platformRole: 'platform_administrator', permissions: [] };

export default function SuperAdminAdmins() {
  const { data, isLoading } = useGetSaAdminsQuery();
  const [createAdmin] = useCreateSaAdminMutation();
  const [updateAdmin] = useUpdateSaAdminMutation();
  const [deleteAdmin] = useDeleteSaAdminMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminForm>(emptyForm);

  const admins = data?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await updateAdmin({ id: editingId, body: form }); }
      else { await createAdmin(form); }
      setForm(emptyForm); setEditingId(null); setShowForm(false);
    } catch { /* toast */ }
  };

  const startEdit = (admin: any) => {
    setEditingId(admin._id);
    setForm({ name: admin.name, email: admin.email, password: '', platformRole: admin.platformRole || 'platform_administrator', permissions: admin.permissions || [] });
    setShowForm(true);
  };

  const roleLabel = (r: string) => PLATFORM_ROLES.find(pr => pr.value === r)?.label || r;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Operators</h1>
          <p className="text-sm text-gray-500 mt-1">Manage SaaS super admin accounts and platform roles</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Add Operator
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Operator' : 'Create Operator'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password {!editingId && '*'}</label>
              <input type="password" required={!editingId} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={editingId ? 'Leave blank to keep' : ''} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Role *</label>
              <select value={form.platformRole} onChange={e => setForm({ ...form, platformRole: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {PLATFORM_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading operators...</div>
        ) : admins.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No operators found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Operator</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Platform Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Last Login</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin: any) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{roleLabel(admin.platformRole || 'platform_owner')}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {admin.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(admin)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('Delete this operator?')) deleteAdmin(admin._id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
