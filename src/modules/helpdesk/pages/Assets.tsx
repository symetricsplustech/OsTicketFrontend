import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';
import { Server } from 'lucide-react';

interface Asset {
  _id: string;
  assetId: string;
  name: string;
  type: string;
  status: string;
  ipAddress?: string;
  environment?: string;
  location?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

const ASSET_TYPES = ['Server', 'Desktop', 'Laptop', 'Network Device', 'Storage', 'Printer', 'Mobile', 'Other'];
const STATUSES = ['in_stock', 'deployed', 'maintenance', 'retired', 'missing'];

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', assetId: '', type: 'Server', status: 'in_stock', ipAddress: '', location: '', environment: 'production' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/enterprise/assets', { params });
      setAssets(res.data.assets || []);
    } catch { setAssets([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/assets', form);
      toast.success('Asset created');
      setShowForm(false);
      setForm({ name: '', assetId: '', type: 'Server', status: 'in_stock', ipAddress: '', location: '', environment: 'production' });
      load();
    } catch { toast.error('Failed to create asset'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Asset</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Asset</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Asset ID *</label>
              <input type="text" required value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} className="mt-1 input-field" placeholder="e.g. SRV-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 input-field">
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Address</label>
              <input type="text" value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} className="mt-1 input-field" placeholder="192.168.1.1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 input-field" placeholder="Data Center A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} className="mt-1 input-field">
                <option>production</option><option>staging</option><option>development</option><option>testing</option>
              </select>
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Asset'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4">
        <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 max-w-md input-field" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-48">
          <option value="">All Types</option>
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              assets.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No assets found</td></tr> :
              assets.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">
                    <Link to={`/assets/${a._id}`} className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.assetId}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.type}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{a.ipAddress || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    a.status === 'deployed' ? 'bg-green-100 text-green-700' :
                    a.status === 'in_stock' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{a.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.environment || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.location || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
