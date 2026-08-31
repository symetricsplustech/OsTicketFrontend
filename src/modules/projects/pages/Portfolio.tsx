import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, CheckCircle, Plus, Settings } from 'lucide-react';

interface Portfolio {
  _id: string;
  name: string;
  description?: string;
  status: string;
}

interface DemandItem {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  score?: number;
  estimatedCost?: number;
  expectedBenefit?: number;
}

const portfolioBadge = (s: string) =>
  s === 'active'
    ? 'bg-green-100 text-green-700'
    : s === 'planning'
    ? 'bg-blue-100 text-blue-700'
    : s === 'closed' || s === 'archived'
    ? 'bg-gray-100 text-gray-600'
    : 'bg-yellow-100 text-yellow-700';

const demandBadge = (s: string) =>
  s === 'approved'
    ? 'bg-green-100 text-green-700'
    : s === 'rejected'
    ? 'bg-red-100 text-red-700'
    : 'bg-blue-100 text-blue-700';

export default function Portfolio() {
  const [tab, setTab] = useState<'portfolios' | 'demand'>('portfolios');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [demand, setDemand] = useState<DemandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pfForm, setPfForm] = useState({ name: '', description: '' });
  const [dmForm, setDmForm] = useState({ title: '', description: '', priority: 'medium', estimatedCost: '', expectedBenefit: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pfRes, dmRes] = await Promise.all([api.get('/ops/portfolios'), api.get('/ops/demand')]);
      setPortfolios(pfRes.data.portfolios || []);
      const items: DemandItem[] = dmRes.data.demand || dmRes.data.items || [];
      setDemand([...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)));
    } catch {
      setPortfolios([]);
      setDemand([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const switchTab = (t: 'portfolios' | 'demand') => {
    setTab(t);
    setShowForm(false);
  };

  const createPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ops/portfolios', pfForm);
      toast.success('Portfolio created');
      setShowForm(false);
      setPfForm({ name: '', description: '' });
      load();
    } catch {
      toast.error('Failed to create portfolio');
    } finally {
      setSaving(false);
    }
  };

  const createDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ops/demand', {
        title: dmForm.title,
        description: dmForm.description,
        priority: dmForm.priority,
        estimatedCost: Number(dmForm.estimatedCost) || 0,
        expectedBenefit: Number(dmForm.expectedBenefit) || 0,
      });
      toast.success('Demand submitted');
      setShowForm(false);
      setDmForm({ title: '', description: '', priority: 'medium', estimatedCost: '', expectedBenefit: '' });
      load();
    } catch {
      toast.error('Failed to submit demand');
    } finally {
      setSaving(false);
    }
  };

  const approveDemand = async (id: string) => {
    try {
      await api.post(`/ops/demand/${id}/approve`);
      toast.success('Demand approved');
      load();
    } catch {
      toast.error('Failed to approve demand');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio &amp; Demand Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" />{tab === 'portfolios' ? 'New Portfolio' : 'New Demand'}</button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => switchTab('portfolios')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'portfolios' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Portfolios</button>
        <button onClick={() => switchTab('demand')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'demand' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Demand Intake</button>
      </div>

      {showForm && tab === 'portfolios' && (
        <form onSubmit={createPortfolio} className="card p-6 space-y-4">
          <h2 className="font-semibold">New Portfolio</h2>
          <div><label className="block text-sm font-medium text-gray-700">Name *</label><input type="text" required value={pfForm.name} onChange={(e) => setPfForm({ ...pfForm, name: e.target.value })} className="mt-1 input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea rows={3} value={pfForm.description} onChange={(e) => setPfForm({ ...pfForm, description: e.target.value })} className="mt-1 input-field" /></div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Portfolio'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'demand' && (
        <form onSubmit={createDemand} className="card p-6 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 font-semibold">New Demand Request</h2>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Title *</label><input type="text" required value={dmForm.title} onChange={(e) => setDmForm({ ...dmForm, title: e.target.value })} className="mt-1 input-field" /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Description</label><textarea rows={3} value={dmForm.description} onChange={(e) => setDmForm({ ...dmForm, description: e.target.value })} className="mt-1 input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Priority</label><select value={dmForm.priority} onChange={(e) => setDmForm({ ...dmForm, priority: e.target.value })} className="mt-1 input-field"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">Estimated Cost ($)</label><input type="number" min="0" value={dmForm.estimatedCost} onChange={(e) => setDmForm({ ...dmForm, estimatedCost: e.target.value })} className="mt-1 input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Expected Benefit ($)</label><input type="number" min="0" value={dmForm.expectedBenefit} onChange={(e) => setDmForm({ ...dmForm, expectedBenefit: e.target.value })} className="mt-1 input-field" /></div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit Demand'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card p-12 text-center text-gray-500">Loading...</div>
      ) : tab === 'portfolios' ? (
        portfolios.length === 0 ? (
          <div className="card p-12 text-center text-gray-500"><Settings className="inline h-5 w-5 mr-1" />No portfolios yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((p) => (
              <div key={p._id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full capitalize ${portfolioBadge(p.status)}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-3">{p.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )
      ) : demand.length === 0 ? (
        <div className="card p-12 text-center text-gray-500"><BarChart3 className="inline h-5 w-5 mr-1" />No demand requests yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demand.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm">{d.title}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">Score {d.score ?? '—'}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${demandBadge(d.status)}`}>{d.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{d.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Priority: <span className="capitalize font-medium text-gray-700">{d.priority}</span></span>
                <span>Cost ${Number(d.estimatedCost || 0).toLocaleString()} · Benefit ${Number(d.expectedBenefit || 0).toLocaleString()}</span>
              </div>
              {d.status === 'submitted' && (
                <button onClick={() => approveDemand(d._id)} className="mt-3 btn-secondary inline-flex items-center gap-1 text-sm"><CheckCircle className="h-4 w-4 text-green-600" />Approve</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
