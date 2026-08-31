import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { Users as UsersIcon, UserCheck, Building2, Plus, Trash2, Edit } from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  role?: { name: string; isAdmin?: boolean };
  departments?: { department?: { name: string } }[];
  teams?: { name: string }[];
  lastLogin?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  organization?: { name: string };
  role?: string;
  createdAt: string;
}

type Tab = 'agents' | 'customers';

export default function Users() {
  const [tab, setTab] = useState<Tab>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agentForm, setAgentForm] = useState({
    name: '', email: '', password: '', phone: '', isAdmin: false, department: '',
  });
  const [customerForm, setCustomerForm] = useState({
    name: '', email: '', password: '', phone: '', organization: '',
  });

  const loadAgents = async () => {
    try {
      const res = await api.get('/admin/agents', { params: { search } });
      setAgents(res.data.items || []);
      setTotal(res.data.items?.length || 0);
    } catch { setAgents([]); } finally { setLoading(false); }
  };

  const loadCustomers = async () => {
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      setCustomers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch { setCustomers([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    setLoading(true);
    if (tab === 'agents') loadAgents();
    else loadCustomers();
  }, [tab, search, page]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/agents', {
        name: agentForm.name,
        email: agentForm.email,
        password: agentForm.password,
        isAdmin: agentForm.isAdmin,
        isActive: true,
        permissions: agentForm.isAdmin ? ['admin.manage', 'access.manage', 'tickets.manage', 'users.manage'] : ['tickets.view'],
      });
      toast.success('Agent created');
      setShowForm(false);
      setAgentForm({ name: '', email: '', password: '', phone: '', isAdmin: false, department: '' });
      loadAgents();
    } catch { toast.error('Failed to create agent'); } finally { setSaving(false); }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/users', {
        name: customerForm.name,
        email: customerForm.email,
        password: customerForm.password,
        phone: customerForm.phone,
        status: 'active',
      });
      toast.success('Customer created');
      setShowForm(false);
      setCustomerForm({ name: '', email: '', password: '', phone: '', organization: '' });
      loadCustomers();
    } catch { toast.error('Failed to create customer'); } finally { setSaving(false); }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Delete this agent?')) return;
    try {
      await api.delete(`/admin/agents/${id}`);
      toast.success('Agent deleted');
      loadAgents();
    } catch { toast.error('Failed to delete agent'); }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Customer deleted');
      loadCustomers();
    } catch { toast.error('Failed to delete customer'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add {tab === 'agents' ? 'Agent' : 'Customer'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => { setTab('agents'); setShowForm(false); setSearch(''); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'agents' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <UserCheck className="h-4 w-4" /> Agents
          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{agents.length}</span>
        </button>
        <button onClick={() => { setTab('customers'); setShowForm(false); setSearch(''); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'customers' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <UsersIcon className="h-4 w-4" /> Customers
          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{total}</span>
        </button>
      </div>

      {/* Create Agent Form */}
      {showForm && tab === 'agents' && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">New Agent</h2>
          <form onSubmit={handleCreateAgent} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input type="email" required value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="john@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input type="password" required value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={agentForm.isAdmin} onChange={(e) => setAgentForm({ ...agentForm, isAdmin: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600" />
                <span className="text-sm text-gray-700">Admin (can access Settings & manage users)</span>
              </label>
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Agent'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Customer Form */}
      {showForm && tab === 'customers' && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">New Customer</h2>
          <form onSubmit={handleCreateCustomer} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input type="email" required value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input type="password" required value={customerForm.password} onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Customer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-md border rounded-lg px-3 py-2 text-sm" />

      {/* Agents Table */}
      {tab === 'agents' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
                agents.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No agents found. Create your first agent to get started.</td></tr> :
                agents.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{a.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.email}</td>
                    <td className="px-6 py-4">
                      {a.isAdmin ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">Admin</span>
                      ) : a.role ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{a.role.name}</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Agent</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteAgent(a._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers Table */}
      {tab === 'customers' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
                customers.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No customers found. Customers can submit tickets through the portal.</td></tr> :
                customers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.organization?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteCustomer(u._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {total > 20 && (
            <div className="px-6 py-3 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-xs hover:bg-gray-50">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1 border rounded text-xs hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
