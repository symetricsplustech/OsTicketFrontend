import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface Team {
  _id: string;
  name: string;
  lead?: { _id?: string; name: string };
  leadTitle?: string;
  members: Array<{ _id?: string; name: string }>;
  status: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', lead: '', leadTitle: 'Team Lead' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/teams');
      setTeams(res.data.items || res.data.teams || []);
    } catch { setTeams([]); } finally { setLoading(false); }
  };

  const loadAgents = async () => {
    try {
      const res = await api.get('/admin/agents');
      setAgents(res.data.items || []);
    } catch { setAgents([]); }
  };

  useEffect(() => {
    load();
    loadAgents();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', lead: '', leadTitle: 'Team Lead' });
    setShowForm(true);
  };

  const openEdit = (t: Team) => {
    setEditId(t._id);
    setForm({ name: t.name, lead: (t.lead as any)?._id || '', leadTitle: t.leadTitle || 'Team Lead' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      lead: form.lead || null,
      leadTitle: form.leadTitle.trim() || 'Team Lead',
    };
    try {
      if (editId) {
        await api.put(`/admin/teams/${editId}`, payload);
        toast.success('Team updated');
      } else {
        await api.post('/admin/teams', payload);
        toast.success('Team created');
      }
      setShowForm(false);
      load();
    } catch { toast.error(editId ? 'Failed to update team' : 'Failed to create team'); } finally { setSaving(false); }
  };

  const toggleStatus = async (team: Team) => {
    try {
      await api.put(`/admin/teams/${team._id}`, { status: team.status === 'active' ? 'disabled' : 'active' });
      load();
    } catch { toast.error('Failed to update team'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button onClick={openCreate} className="btn-primary">Add Team</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{editId ? 'Edit Team' : 'New Team'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designated Member ({form.lead ? 'selected' : 'unassigned'})</label>
              <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="mt-1 input-field">
                <option value="">— Unassigned —</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation Title</label>
              <input type="text" value={form.leadTitle} onChange={(e) => setForm({ ...form, leadTitle: e.target.value })} className="mt-1 input-field" placeholder="Team Lead, Coordinator, Manager, ..." />
              <p className="text-xs text-gray-400 mt-1">Any title you call the designated member — it is not a fixed position.</p>
            </div>
            <div className="flex items-end gap-2 col-span-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Save' : 'Create Team'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-12 text-gray-500">Loading...</div> :
          teams.length === 0 ? <div className="col-span-3 text-center py-12 text-gray-500">No teams yet</div> :
          teams.map((t) => (
            <div key={t._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t.name}</h3>
                <button onClick={() => toggleStatus(t)} className={`px-2 py-1 text-xs rounded-full cursor-pointer ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {t.status}
                </button>
              </div>
              <p className="text-sm text-gray-500">{t.leadTitle || 'Team Lead'}: <span className="font-medium text-gray-700">{t.lead?.name || 'Unassigned'}</span></p>
              <p className="text-sm text-gray-500">{t.members?.length || 0} members</p>
              <div className="mt-3 flex justify-end">
                <button onClick={() => openEdit(t)} className="text-sm text-brand-600 hover:underline">Edit lead & designation</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}