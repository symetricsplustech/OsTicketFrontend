import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { Server, Database, Globe, Cloud, Wifi, HardDrive } from 'lucide-react';

interface Resource {
  _id: string;
  name: string;
  type: string;
  status: string;
  environment?: string;
  ipAddress?: string;
  hostname?: string;
  location?: string;
  provider?: string;
  owner?: { name: string };
  metrics?: { cpu: number; memory: number; disk: number };
}

const TYPES = ['server', 'vm', 'database', 'application', 'network', 'cloud', 'storage', 'container', 'service', 'other'];
const STATUSES = ['healthy', 'degraded', 'down', 'maintenance', 'unknown'];
const TYPE_ICONS: Record<string, typeof Server> = { server: Server, database: Database, application: Globe, cloud: Cloud, network: Wifi, storage: HardDrive };

export default function ResourceRegistry() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'server', environment: 'production', ipAddress: '', hostname: '', location: '', provider: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/itom/resources', { params });
      setResources(res.data.resources || []);
    } catch { setResources([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, typeFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/itom/resources', form);
      toast.success('Resource created');
      setShowForm(false);
      setForm({ name: '', type: 'server', environment: 'production', ipAddress: '', hostname: '', location: '', provider: '' });
      load();
    } catch { toast.error('Failed to create resource'); } finally { setSaving(false); }
  };

  const statusColor = (s: string) => s === 'healthy' ? 'bg-green-100 text-green-700' : s === 'degraded' ? 'bg-yellow-100 text-yellow-700' : s === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure Resources</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Resource</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Resource</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Name *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 input-field">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">Environment</label><select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} className="mt-1 input-field"><option>production</option><option>staging</option><option>development</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">IP Address</label><input type="text" value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Hostname</label><input type="text" value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Location</label><input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md input-field" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40"><option value="">All Types</option>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40"><option value="">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-12 text-gray-500">Loading...</div> :
          resources.length === 0 ? <div className="col-span-3 text-center py-12 text-gray-500">No resources found</div> :
          resources.map((r) => {
            const Icon = TYPE_ICONS[r.type] || Server;
            return (
              <div key={r._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Icon className="h-5 w-5 text-gray-600" /></div>
                    <div><h3 className="font-semibold text-sm">{r.name}</h3><p className="text-xs text-gray-500">{r.hostname || r.ipAddress || r.type}</p></div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>Type: {r.type}</span><span>Env: {r.environment || '—'}</span>
                  <span>Location: {r.location || '—'}</span><span>Owner: {r.owner?.name || '—'}</span>
                </div>
                {r.metrics && (
                  <div className="mt-3 flex gap-3 text-xs">
                    <span>CPU: {r.metrics.cpu}%</span><span>Mem: {r.metrics.memory}%</span><span>Disk: {r.metrics.disk}%</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
