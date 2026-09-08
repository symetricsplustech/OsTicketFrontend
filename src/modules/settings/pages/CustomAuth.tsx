import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

/* ── Types ── */
interface Perm {
  _id: string;
  key: string;
  name: string;
  description?: string;
  module: string;
  resource: string;
  action: string;
  effect: 'allow' | 'deny';
  scope?: string;
  status: string;
}
interface Role {
  _id: string;
  key: string;
  name: string;
  description?: string;
  module: string;
  permissions: string[];
  deniedPermissions: string[];
  agentMembers: string[];
  recordScopes?: string[];
  effectiveFrom?: string;
  effectiveUntil?: string;
  status: string;
}

const emptyPerm = { key: '', name: '', description: '', module: '', resource: '', action: '', effect: 'allow' as 'allow' | 'deny', scope: '' };
const emptyRole = { key: '', name: '', description: '', module: '', permissions: '', deniedPermissions: '', recordScopes: '', effectiveFrom: '', effectiveUntil: '' };

export default function CustomAuth() {
  const [tab, setTab] = useState<'perms' | 'roles'>('perms');

  /* ── Permissions state ── */
  const [perms, setPerms] = useState<Perm[]>([]);
  const [permLoading, setPermLoading] = useState(true);
  const [showPermForm, setShowPermForm] = useState(false);
  const [permForm, setPermForm] = useState(emptyPerm);
  const [editingPerm, setEditingPerm] = useState<string | null>(null);
  const [permSaving, setPermSaving] = useState(false);

  const loadPerms = async () => {
    try {
      const res = await api.get('/admin/custom-auth');
      setPerms(res.data.permissions || []);
    } catch { setPerms([]); } finally { setPermLoading(false); }
  };

  useEffect(() => { if (tab === 'perms') loadPerms(); }, [tab]);

  const handlePermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermSaving(true);
    try {
      const payload = { ...permForm, scope: permForm.scope || undefined };
      if (editingPerm) {
        await api.put(`/admin/custom-auth/${editingPerm}`, payload);
        toast.success('Permission updated');
      } else {
        await api.post('/admin/custom-auth', payload);
        toast.success('Permission created');
      }
      setShowPermForm(false);
      setPermForm(emptyPerm);
      setEditingPerm(null);
      loadPerms();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed');
    } finally { setPermSaving(false); }
  };

  const deletePerm = async (id: string) => {
    if (!confirm('Delete this permission?')) return;
    try {
      await api.delete(`/admin/custom-auth/${id}`);
      toast.success('Deleted');
      loadPerms();
    } catch { toast.error('Failed to delete'); }
  };

  const editPerm = (p: Perm) => {
    setEditingPerm(p._id);
    setPermForm({ key: p.key, name: p.name, description: p.description || '', module: p.module, resource: p.resource, action: p.action, effect: p.effect, scope: p.scope || '' });
    setShowPermForm(true);
  };

  /* ── Roles state ── */
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  const loadRoles = async () => {
    try {
      const res = await api.get('/admin/custom-auth/roles');
      setRoles(res.data.roles || []);
    } catch { setRoles([]); } finally { setRoleLoading(false); }
  };

  useEffect(() => { if (tab === 'roles') loadRoles(); }, [tab]);

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleSaving(true);
    try {
      const payload: any = {
        key: roleForm.key,
        name: roleForm.name,
        description: roleForm.description || undefined,
        module: roleForm.module,
        permissions: roleForm.permissions ? roleForm.permissions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        deniedPermissions: roleForm.deniedPermissions ? roleForm.deniedPermissions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        recordScopes: roleForm.recordScopes ? roleForm.recordScopes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      };
      if (roleForm.effectiveFrom) payload.effectiveFrom = roleForm.effectiveFrom;
      if (roleForm.effectiveUntil) payload.effectiveUntil = roleForm.effectiveUntil;

      if (editingRole) {
        await api.put(`/admin/custom-auth/roles/${editingRole}`, payload);
        toast.success('Role updated');
      } else {
        await api.post('/admin/custom-auth/roles', payload);
        toast.success('Role created');
      }
      setShowRoleForm(false);
      setRoleForm(emptyRole);
      setEditingRole(null);
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed');
    } finally { setRoleSaving(false); }
  };

  const deleteRole = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    try {
      await api.delete(`/admin/custom-auth/roles/${id}`);
      toast.success('Deleted');
      loadRoles();
    } catch { toast.error('Failed to delete'); }
  };

  const editRole = (r: Role) => {
    setEditingRole(r._id);
    setRoleForm({
      key: r.key, name: r.name, description: r.description || '', module: r.module,
      permissions: (r.permissions || []).join(', '),
      deniedPermissions: (r.deniedPermissions || []).join(', '),
      recordScopes: (r.recordScopes || []).join(', '),
      effectiveFrom: r.effectiveFrom ? r.effectiveFrom.slice(0, 10) : '',
      effectiveUntil: r.effectiveUntil ? r.effectiveUntil.slice(0, 10) : '',
    });
    setShowRoleForm(true);
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Custom Authentication</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab('perms')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${tab === 'perms' ? 'bg-white border border-b-0 border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Custom Permissions
        </button>
        <button onClick={() => setTab('roles')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${tab === 'roles' ? 'bg-white border border-b-0 border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Custom Roles
        </button>
      </div>

      {/* ── Permissions Tab ── */}
      {tab === 'perms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{perms.length} permission(s)</p>
            <button onClick={() => { setEditingPerm(null); setPermForm(emptyPerm); setShowPermForm(true); }} className="btn-primary flex items-center gap-1"><Plus size={16} /> Add Permission</button>
          </div>

          {showPermForm && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">{editingPerm ? 'Edit Permission' : 'New Permission'}</h2>
              <form onSubmit={handlePermSubmit} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key *</label>
                  <input required value={permForm.key} onChange={e => setPermForm({ ...permForm, key: e.target.value })} className="mt-1 input-field" placeholder="e.g. tickets.create" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input required value={permForm.name} onChange={e => setPermForm({ ...permForm, name: e.target.value })} className="mt-1 input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input value={permForm.description} onChange={e => setPermForm({ ...permForm, description: e.target.value })} className="mt-1 input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Module *</label>
                  <input required value={permForm.module} onChange={e => setPermForm({ ...permForm, module: e.target.value })} className="mt-1 input-field" placeholder="helpdesk" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource *</label>
                  <input required value={permForm.resource} onChange={e => setPermForm({ ...permForm, resource: e.target.value })} className="mt-1 input-field" placeholder="ticket" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action *</label>
                  <input required value={permForm.action} onChange={e => setPermForm({ ...permForm, action: e.target.value })} className="mt-1 input-field" placeholder="create" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Effect *</label>
                  <select required value={permForm.effect} onChange={e => setPermForm({ ...permForm, effect: e.target.value as 'allow' | 'deny' })} className="mt-1 input-field">
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scope</label>
                  <input value={permForm.scope} onChange={e => setPermForm({ ...permForm, scope: e.target.value })} className="mt-1 input-field" placeholder="Optional scope" />
                </div>
                <div className="flex items-end gap-2 col-span-3">
                  <button type="submit" disabled={permSaving} className="btn-primary">{permSaving ? 'Saving...' : editingPerm ? 'Update Permission' : 'Create Permission'}</button>
                  <button type="button" onClick={() => { setShowPermForm(false); setEditingPerm(null); }} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effect</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permLoading ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : perms.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No permissions configured</td></tr>
                ) : perms.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{p.key}</td>
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.module}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.resource}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.action}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.effect === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.effect}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => editPerm(p)} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={14} /></button>
                        <button onClick={() => deletePerm(p._id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Roles Tab ── */}
      {tab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{roles.length} role(s)</p>
            <button onClick={() => { setEditingRole(null); setRoleForm(emptyRole); setShowRoleForm(true); }} className="btn-primary flex items-center gap-1"><Plus size={16} /> Add Role</button>
          </div>

          {showRoleForm && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">{editingRole ? 'Edit Role' : 'New Role'}</h2>
              <form onSubmit={handleRoleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key *</label>
                  <input required value={roleForm.key} onChange={e => setRoleForm({ ...roleForm, key: e.target.value })} className="mt-1 input-field" placeholder="e.g. senior_agent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input required value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="mt-1 input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} className="mt-1 input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Module *</label>
                  <input required value={roleForm.module} onChange={e => setRoleForm({ ...roleForm, module: e.target.value })} className="mt-1 input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Permissions (comma-separated keys)</label>
                  <textarea rows={2} value={roleForm.permissions} onChange={e => setRoleForm({ ...roleForm, permissions: e.target.value })} className="mt-1 input-field" placeholder="tickets.create, tickets.view, tickets.update" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Denied Permissions (comma-separated keys)</label>
                  <textarea rows={2} value={roleForm.deniedPermissions} onChange={e => setRoleForm({ ...roleForm, deniedPermissions: e.target.value })} className="mt-1 input-field" placeholder="admin.settings" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Record Scopes (comma-separated)</label>
                  <textarea rows={2} value={roleForm.recordScopes} onChange={e => setRoleForm({ ...roleForm, recordScopes: e.target.value })} className="mt-1 input-field" placeholder="own, team, department" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Effective From</label>
                  <input type="date" value={roleForm.effectiveFrom} onChange={e => setRoleForm({ ...roleForm, effectiveFrom: e.target.value })} className="mt-1 input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Effective Until</label>
                  <input type="date" value={roleForm.effectiveUntil} onChange={e => setRoleForm({ ...roleForm, effectiveUntil: e.target.value })} className="mt-1 input-field" />
                </div>
                <div className="flex items-end gap-2 col-span-2">
                  <button type="submit" disabled={roleSaving} className="btn-primary">{roleSaving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}</button>
                  <button type="button" onClick={() => { setShowRoleForm(false); setEditingRole(null); }} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Permissions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Denied</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roleLoading ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No roles configured</td></tr>
                ) : roles.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{r.key}</td>
                    <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.module}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{(r.permissions || []).length}</span></td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">{(r.deniedPermissions || []).length}</span></td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{(r.agentMembers || []).length}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => editRole(r)} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={14} /></button>
                        <button onClick={() => deleteRole(r._id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
