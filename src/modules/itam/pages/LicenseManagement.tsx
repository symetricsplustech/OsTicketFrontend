import { useState, useEffect } from 'react';
import { Search, Plus, Shield, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import api from '@shared/lib/api';

interface License {
  _id: string;
  name: string;
  vendor: string;
  type: string;
  totalSeats: number;
  usedSeats: number;
  status: string;
  expiryDate: string;
  cost: number;
}

interface ComplianceReport {
  summary: {
    totalLicenses: number;
    totalSeats: number;
    usedSeats: number;
    expiringIn30Days: number;
    overAllocated: number;
  };
  licenses: Array<{
    name: string;
    vendor: string;
    type: string;
    totalSeats: number;
    usedSeats: number;
    utilizationPercent: number;
    expiryDate: string;
    daysUntilExpiry: number;
    compliance: string;
  }>;
}

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', vendor: '', type: 'per_user', totalSeats: 1, expiryDate: '', cost: 0, key: '' });

  useEffect(() => { loadLicenses(); loadCompliance(); }, []);

  const loadLicenses = async () => {
    try {
      const { data } = await api.get('/licenses', { params: { search: search || undefined } });
      setLicenses(data);
    } catch {}
  };

  const loadCompliance = async () => {
    try {
      const { data } = await api.get('/licenses/compliance');
      setCompliance(data);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/licenses', form);
      setShowForm(false);
      setForm({ name: '', vendor: '', type: 'per_user', totalSeats: 1, expiryDate: '', cost: 0, key: '' });
      loadLicenses();
      loadCompliance();
    } catch {}
  };

  const handleAllocate = async (licenseId: string) => {
    try {
      await api.post(`/licenses/${licenseId}/allocate`, { user: 'current' });
      loadLicenses();
      loadCompliance();
    } catch {}
  };

  const handleDeactivate = async (allocationId: string) => {
    try {
      await api.delete(`/licenses/allocations/${allocationId}`);
      loadLicenses();
      loadCompliance();
    } catch {}
  };

  const filtered = licenses.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> License Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add License
        </button>
      </div>

      {compliance && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Total Licenses</p>
            <p className="text-2xl font-bold">{compliance.summary.totalLicenses}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Total Seats</p>
            <p className="text-2xl font-bold">{compliance.summary.totalSeats}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Used Seats</p>
            <p className="text-2xl font-bold">{compliance.summary.usedSeats}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Expiring in 30 Days</p>
            <p className="text-2xl font-bold text-orange-600">{compliance.summary.expiringIn30Days}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Over-Allocated</p>
            <p className="text-2xl font-bold text-red-600">{compliance.summary.overAllocated}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="License Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Vendor" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="per_user">Per User</option>
              <option value="per_device">Per Device</option>
              <option value="site">Site License</option>
              <option value="concurrent">Concurrent</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Total Seats" value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: +e.target.value })} className="border rounded-lg px-3 py-2" min={1} />
            <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="Cost" value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} className="border rounded-lg px-3 py-2" step="0.01" />
          </div>
          <input placeholder="License Key" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className="border rounded-lg px-3 py-2 w-full" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); }} placeholder="Search licenses..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">License</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Seats</th>
              <th className="text-left px-4 py-3 font-medium">Utilization</th>
              <th className="text-left px-4 py-3 font-medium">Expiry</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(license => {
              const utilization = license.totalSeats > 0 ? Math.round((license.usedSeats / license.totalSeats) * 100) : 0;
              const daysUntilExpiry = Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <tr key={license._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{license.name}</td>
                  <td className="px-4 py-3">{license.vendor}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{license.type}</span></td>
                  <td className="px-4 py-3">{license.usedSeats}/{license.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                      </div>
                      <span className="text-xs">{utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${daysUntilExpiry <= 30 ? 'text-orange-600 font-medium' : ''}`}>
                      {new Date(license.expiryDate).toLocaleDateString()}
                      {daysUntilExpiry <= 30 && ` (${daysUntilExpiry}d)`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${license.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {license.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {license.usedSeats < license.totalSeats && (
                        <button onClick={() => handleAllocate(license._id)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded">Allocate</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
