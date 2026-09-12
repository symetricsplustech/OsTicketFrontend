import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import ItsmPermissionPicker from '@modules/settings/components/ItsmPermissionPicker';

interface Role {
  _id: string;
  name: string;
  isAdmin: boolean;
  permissions: string[];
  moduleKeys?: string[];
  notes?: string;
  category?: string;
  recordScopes?: string[];
  approvalLimit?: number | null;
}

const ALL_MODULES = ['helpdesk', 'crm', 'csm', 'itam', 'itom', 'projects', 'hr', 'field-service', 'workflow', 'analytics', 'ai', 'settings'];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', notes: '', category: 'operational', recordScopes: ['own'], approvalLimit: '' });
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/roles');
      setRoles(res.data.items || []);
    } catch { setRoles([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/roles', { ...form, approvalLimit: form.approvalLimit ? Number(form.approvalLimit) : null, permissions: selectedPerms });
      toast.success('Role created');
      setShowForm(false);
      setForm({ name: '', notes: '', category: 'operational', recordScopes: ['own'], approvalLimit: '' });
      setSelectedPerms([]);
      load();
    } catch { toast.error('Failed to create role'); } finally { setSaving(false); }
  };

  const [scopeEditing, setScopeEditing] = useState<string | null>(null);
  const [scopeSelection, setScopeSelection] = useState<string[]>([]);
  const [permissionEditing, setPermissionEditing] = useState<string | null>(null);
  const [permissionSelection, setPermissionSelection] = useState<string[]>([]);

  const openScope = (role: Role) => {
    setScopeEditing(role._id);
    setScopeSelection(role.moduleKeys || []);
  };
  const saveScope = async (roleId: string) => {
    try {
      await api.put(`/admin/roles/${roleId}`, { moduleKeys: scopeSelection });
      toast.success('Module scope saved');
      setScopeEditing(null);
      load();
    } catch { toast.error('Failed to save module scope'); }
  };
  const openPermissions = (role: Role) => {
    setPermissionEditing(role._id);
    setPermissionSelection(role.permissions || []);
  };
  const savePermissions = async (roleId: string) => {
    try {
      await api.put(`/admin/roles/${roleId}`, { permissions: permissionSelection });
      toast.success('Granular permissions saved');
      setPermissionEditing(null);
      load();
    } catch { toast.error('Failed to save permissions'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-sm text-gray-500 mt-1">Tenant roles only. Platform roles are managed separately and can never be assigned here.</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Role</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Role</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 input-field">
                  <option value="organization">Organisation</option><option value="administrative">Administrative</option><option value="module">Module</option><option value="operational">Operational</option><option value="auditor">Auditor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Record scope</label>
                <select value={form.recordScopes[0]} onChange={(e) => setForm({ ...form, recordScopes: [e.target.value] })} className="mt-1 input-field">
                  {['own', 'assigned', 'team', 'department', 'location', 'business_unit', 'organization'].map(scope => <option key={scope} value={scope}>{scope.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approval limit</label>
                <input type="number" min="0" value={form.approvalLimit} onChange={(e) => setForm({ ...form, approvalLimit: e.target.value })} className="mt-1 input-field" placeholder="No approval authority" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <ItsmPermissionPicker value={selectedPerms} onChange={setSelectedPerms} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Role'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category / scope</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module Scope</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              roles.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{r.category || 'operational'} · {(r.recordScopes || ['own']).join(', ')}</td>
                  <td className="px-6 py-4">{r.isAdmin ? <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Admin</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {permissionEditing === r._id ? (
                      <div className="min-w-[48rem] space-y-2">
                        <ItsmPermissionPicker value={permissionSelection} onChange={setPermissionSelection} />
                        <div className="flex gap-2">
                          <button onClick={() => savePermissions(r._id)} className="btn-primary text-xs px-2 py-1">Save</button>
                          <button onClick={() => setPermissionEditing(null)} className="btn-secondary text-xs px-2 py-1">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openPermissions(r)} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100">{r.permissions?.length || 0} permissions · Edit</button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {scopeEditing === r._id ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {ALL_MODULES.map(m => (
                            <label key={m} className={`text-xs px-2 py-1 rounded cursor-pointer border ${scopeSelection.includes(m) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                              <input type="checkbox" className="hidden" checked={scopeSelection.includes(m)} onChange={() => setScopeSelection(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} />
                              {m}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => saveScope(r._id)} className="btn-primary text-xs px-2 py-1">Save</button>
                          <button onClick={() => setScopeEditing(null)} className="btn-secondary text-xs px-2 py-1">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {(r.moduleKeys?.length ? r.moduleKeys.map(m => <span key={m} className="px-2 py-0.5 text-xs rounded bg-gray-100">{m}</span>) : <span className="text-xs text-gray-400">All modules</span>)}
                        {!r.isAdmin && (
                          <button onClick={() => openScope(r)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Edit scope</button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.notes || '—'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
