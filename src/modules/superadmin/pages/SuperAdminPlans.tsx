import React, { useState } from 'react';
import { useGetSaPlansQuery, useCreateSaPlanMutation, useUpdateSaPlanMutation, useDeleteSaPlanMutation } from '@shared/store/apiEndpoints';
import { Plus, Edit, Trash2, X, CreditCard, Check } from 'lucide-react';

interface PlanForm {
  name: string;
  code: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxAgents: number;
  maxUsers: number;
  maxTickets: number;
  maxStorage: number;
  moduleKeys: string[];
  isActive: boolean;
  isDefault: boolean;
}

const emptyForm: PlanForm = { name: '', code: '', description: '', priceMonthly: 0, priceYearly: 0, trialDays: 14, maxAgents: 0, maxUsers: 0, maxTickets: 0, maxStorage: 0, moduleKeys: [], isActive: true, isDefault: false };

const ALL_MODULES = ['helpdesk', 'crm', 'itam', 'itom', 'projects', 'hr', 'field-service', 'csm', 'cmdb', 'secops', 'grc', 'workplace', 'legal', 'procurement', 'finance', 'esg', 'workflow', 'analytics', 'ai'];

export default function SuperAdminPlans() {
  const { data: plans, isLoading } = useGetSaPlansQuery();
  const [createPlan] = useCreateSaPlanMutation();
  const [updatePlan] = useUpdateSaPlanMutation();
  const [deletePlan] = useDeleteSaPlanMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const startCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const startEdit = (p: any) => { setEditingId(p._id); setForm({ ...emptyForm, ...p }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { await updatePlan({ id: editingId, body: form }); }
    else { await createPlan(form); }
    setShowForm(false);
  };

  const toggleModule = (key: string) => {
    setForm(f => ({ ...f, moduleKeys: f.moduleKeys.includes(key) ? f.moduleKeys.filter(m => m !== key) : [...f.moduleKeys, key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plans & Pricing</h1>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Plan' : 'Create Plan'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. pro" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
                <input type="number" value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
                <input type="number" value={form.priceYearly} onChange={e => setForm({ ...form, priceYearly: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                <input type="number" value={form.trialDays} onChange={e => setForm({ ...form, trialDays: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Agents</label>
                <input type="number" value={form.maxAgents} onChange={e => setForm({ ...form, maxAgents: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
                <input type="number" value={form.maxUsers} onChange={e => setForm({ ...form, maxUsers: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Storage (GB)</label>
                <input type="number" value={form.maxStorage} onChange={e => setForm({ ...form, maxStorage: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Included Modules</label>
              <div className="flex flex-wrap gap-2">
                {ALL_MODULES.map(m => (
                  <button key={m} type="button" onClick={() => toggleModule(m)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${form.moduleKeys.includes(m) ? 'bg-brand-100 border-brand-300 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    {form.moduleKeys.includes(m) && <Check className="inline h-3 w-3 mr-1" />}{m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                Default Plan
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-gray-400">Loading...</div>
        ) : (!plans || plans.length === 0) ? (
          <div className="col-span-full text-center py-10 text-gray-400">No plans yet. Create your first plan.</div>
        ) : plans.map((p: any) => (
          <div key={p._id} className={`bg-white rounded-xl border p-5 ${p.isDefault ? 'ring-2 ring-brand-300' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.code || '-'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm('Delete this plan?')) deletePlan(p._id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {p.description && <p className="text-sm text-gray-600 mb-3">{p.description}</p>}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">${p.priceMonthly || 0}</span>
              <span className="text-sm text-gray-500">/month</span>
              {p.priceYearly > 0 && <span className="text-xs text-gray-400 ml-2">(${p.priceYearly}/yr)</span>}
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              {p.maxAgents > 0 && <p>{p.maxAgents} agents</p>}
              {p.maxUsers > 0 && <p>{p.maxUsers} users</p>}
              {p.maxStorage > 0 && <p>{p.maxStorage} GB storage</p>}
              {p.trialDays > 0 && <p>{p.trialDays}-day free trial</p>}
            </div>
            {p.moduleKeys?.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                  {p.moduleKeys.map((m: string) => <span key={m} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{m}</span>)}
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              {p.isActive ? <span className="text-xs text-green-600">Active</span> : <span className="text-xs text-gray-400">Inactive</span>}
              {p.isDefault && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded">Default</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
