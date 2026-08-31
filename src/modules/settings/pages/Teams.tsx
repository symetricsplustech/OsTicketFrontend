import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  lead?: { name: string };
  members: Array<{ name: string }>;
  status: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', leadName: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/teams');
      setTeams(res.data.teams || []);
    } catch { setTeams([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/teams', form);
      toast.success('Team created');
      setShowForm(false);
      setForm({ name: '', leadName: '' });
      load();
    } catch { toast.error('Failed to create team'); } finally { setSaving(false); }
  };

  const toggleStatus = async (team: Team) => {
    try {
      await api.put(`/admin/teams/${team._id}`, { status: team.status === 'active' ? 'inactive' : 'active' });
      load();
    } catch { toast.error('Failed to update team'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Team</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Team</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lead Name</label>
              <input type="text" value={form.leadName} onChange={(e) => setForm({ ...form, leadName: e.target.value })} className="mt-1 input-field" placeholder="Team lead name" />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Team'}</button>
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
              <p className="text-sm text-gray-500">Lead: {t.lead?.name || 'Unassigned'}</p>
              <p className="text-sm text-gray-500">{t.members?.length || 0} members</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}
