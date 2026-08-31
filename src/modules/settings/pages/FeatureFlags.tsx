import { useState, useEffect } from 'react';
import { Flag, Plus, ToggleLeft, ToggleRight, Users, Percent, Hash } from 'lucide-react';
import api from '@shared/lib/api';

interface FeatureFlag {
  _id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: string;
  percentage: number;
  module: string;
  allowedUsers: string[];
  createdAt: string;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'boolean', percentage: 50, module: '' });

  useEffect(() => { loadFlags(); }, []);

  const loadFlags = async () => {
    try { const { data } = await api.get('/platform/feature-flags'); setFlags(data); } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/platform/feature-flags', form); setShowForm(false); setForm({ name: '', description: '', type: 'boolean', percentage: 50, module: '' }); loadFlags(); } catch {}
  };

  const handleToggle = async (id: string) => {
    try { await api.post(`/platform/feature-flags/${id}/toggle`); loadFlags(); } catch {}
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'boolean': return <Flag className="h-4 w-4" />;
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'user_list': return <Users className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Flag className="h-6 w-6" /> Feature Flags</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Flag
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Flag Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Module (optional)" value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-3 py-2 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="boolean">Boolean (On/Off)</option>
              <option value="percentage">Percentage Rollout</option>
              <option value="user_list">User List</option>
            </select>
            {form.type === 'percentage' && (
              <input type="number" placeholder="Percentage" value={form.percentage} onChange={e => setForm({ ...form, percentage: +e.target.value })} className="border rounded-lg px-3 py-2" min={0} max={100} />
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {flags.map(flag => (
          <div key={flag._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {typeIcon(flag.type)}
                <div>
                  <h3 className="font-semibold">{flag.name}</h3>
                  <p className="text-sm text-gray-500">{flag.description || 'No description'}</p>
                </div>
              </div>
              <button onClick={() => handleToggle(flag._id)} className="flex-shrink-0">
                {flag.enabled ? <ToggleRight className="h-8 w-8 text-green-500" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">{flag.type}</span>
              {flag.type === 'percentage' && <span>{flag.percentage}% rollout</span>}
              {flag.module && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{flag.module}</span>}
              <span className={flag.enabled ? 'text-green-600 font-medium' : 'text-gray-400'}>{flag.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
