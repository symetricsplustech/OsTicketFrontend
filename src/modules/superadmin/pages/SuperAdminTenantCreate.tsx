import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateTenantMutation, useGetSaPlansQuery } from '@shared/store/apiEndpoints';
import { ArrowLeft, Layers } from 'lucide-react';

const ALL_MODULES = [
  { key: 'helpdesk', label: 'Helpdesk (Tickets)' },
  { key: 'crm', label: 'CRM' },
  { key: 'itam', label: 'IT Asset Management' },
  { key: 'itom', label: 'IT Operations' },
  { key: 'cmdb', label: 'CMDB' },
  { key: 'projects', label: 'Projects' },
  { key: 'hr', label: 'HR' },
  { key: 'field-service', label: 'Field Service' },
  { key: 'workflow', label: 'Workflows' },
  { key: 'analytics', label: 'Analytics & Reports' },
  { key: 'ai', label: 'AI / Otto' },
  { key: 'csm', label: 'Customer Service' },
  { key: 'secops', label: 'Security Operations' },
  { key: 'grc', label: 'GRC' },
  { key: 'workplace', label: 'Workplace' },
  { key: 'legal', label: 'Legal' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'finance', label: 'Finance' },
  { key: 'esg', label: 'ESG' },
  { key: 'settings', label: 'Settings & Admin' },
];

export default function SuperAdminTenantCreate() {
  const navigate = useNavigate();
  const [createTenant, { isLoading }] = useCreateTenantMutation();
  const { data: plans } = useGetSaPlansQuery();
  const [form, setForm] = useState({
    name: '', email: '', domain: '', plan: '', billingCycle: 'monthly', trialDays: 14, adminEmail: '', adminPassword: '',
  });
  const [selectedModules, setSelectedModules] = useState<string[]>(['helpdesk', 'settings']);
  const [error, setError] = useState('');

  const toggleModule = (key: string) => {
    setSelectedModules(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await createTenant({ ...form, modules: selectedModules }).unwrap();
      navigate(`/superadmin/tenants/${result.data?._id || ''}`);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create tenant');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/superadmin/tenants" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold">Create New Tenant</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Acme Corp" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="admin@acme.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="acme.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select plan</option>
              {(plans || []).map((p: any) => <option key={p._id} value={p._id}>{p.name} - ${p.priceMonthly}/mo</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
          <input type="number" value={form.trialDays} onChange={e => setForm({ ...form, trialDays: parseInt(e.target.value) || 0 })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="border-t pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-brand-600" />
            <h3 className="font-medium text-gray-700">Modules to Activate</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">Select which modules this tenant will have access to. You can change this later.</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_MODULES.map(m => (
              <label key={m.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${selectedModules.includes(m.key) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                <input type="checkbox" checked={selectedModules.includes(m.key)} onChange={() => toggleModule(m.key)} className="rounded text-brand-600" />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-5">
          <h3 className="font-medium text-gray-700 mb-3">Admin Account (optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="admin@acme.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
              <input type="password" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Min 6 characters" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Link to="/superadmin/tenants" className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
            {isLoading ? 'Creating...' : 'Create Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
}
