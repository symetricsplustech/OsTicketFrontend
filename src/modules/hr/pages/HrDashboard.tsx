import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';

interface HrCase {
  _id: string;
  number: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  employee?: { name: string; email: string };
  assignedTo?: { name: string };
  createdAt: string;
}

interface Leave {
  _id: string;
  employee?: { name: string; email: string };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
}

interface Claim {
  _id: string;
  employee?: { name: string; email: string };
  title: string;
  category: string;
  amount: number;
  status: string;
  expenseDate: string;
}

type Tab = 'cases' | 'leave' | 'claims';
const CATEGORIES = ['leave', 'payroll', 'benefits', 'onboarding', 'offboarding', 'grievance', 'policy', 'training', 'other'];

export default function HrDashboard() {
  const [tab, setTab] = useState<Tab>('cases');
  const [cases, setCases] = useState<HrCase[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Case form
  const [caseForm, setCaseForm] = useState({ title: '', description: '', category: 'other', priority: 'medium' });
  // Leave form
  const [leaveForm, setLeaveForm] = useState({ type: 'annual', startDate: '', endDate: '', days: '1', reason: '' });
  // Claim form
  const [claimForm, setClaimForm] = useState({ title: '', category: 'travel', amount: '', expenseDate: '', description: '' });

  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [casesRes, leavesRes, claimsRes] = await Promise.all([
        api.get('/hr/cases').catch(() => ({ data: { cases: [] } })),
        api.get('/hr/leave').catch(() => ({ data: { leaves: [] } })),
        api.get('/hr/claims').catch(() => ({ data: { claims: [] } })),
      ]);
      setCases(casesRes.data.cases || []);
      setLeaves(leavesRes.data.leaves || []);
      setClaims(claimsRes.data.claims || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/hr/cases', caseForm);
      toast.success('HR case created');
      setShowForm(false);
      setCaseForm({ title: '', description: '', category: 'other', priority: 'medium' });
      load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/hr/leave', { ...leaveForm, days: Number(leaveForm.days) });
      toast.success('Leave request submitted');
      setShowForm(false);
      setLeaveForm({ type: 'annual', startDate: '', endDate: '', days: '1', reason: '' });
      load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/hr/claims', { ...claimForm, amount: Number(claimForm.amount) });
      toast.success('Claim submitted');
      setShowForm(false);
      setClaimForm({ title: '', category: 'travel', amount: '', expenseDate: '', description: '' });
      load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const approveLeave = async (id: string, status: string) => {
    try { await api.put(`/hr/leave/${id}`, { status }); toast.success(`Leave ${status}`); load(); } catch { toast.error('Failed'); }
  };

  const approveClaim = async (id: string, status: string) => {
    try { await api.put(`/hr/claims/${id}`, { status }); toast.success(`Claim ${status}`); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">HR Service Desk</h1>

      <div className="flex gap-4 border-b border-gray-200 pb-2">
        {(['cases', 'leave', 'claims'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`text-sm font-medium pb-2 border-b-2 capitalize ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'}`}>{t}</button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {tab === 'cases' ? 'New HR Case' : tab === 'leave' ? 'Request Leave' : 'Submit Claim'}
        </button>
      </div>

      {showForm && tab === 'cases' && (
        <div className="card p-6">
          <form onSubmit={handleCreateCase} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Title *</label><input type="text" required value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={caseForm.description} onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })} rows={3} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Category</label><select value={caseForm.category} onChange={(e) => setCaseForm({ ...caseForm, category: e.target.value })} className="mt-1 input-field">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">Priority</label><select value={caseForm.priority} onChange={(e) => setCaseForm({ ...caseForm, priority: e.target.value })} className="mt-1 input-field"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {showForm && tab === 'leave' && (
        <div className="card p-6">
          <form onSubmit={handleCreateLeave} className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Leave Type</label><select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="mt-1 input-field"><option>annual</option><option>sick</option><option>personal</option><option>maternity</option><option>paternity</option><option>bereavement</option><option>unpaid</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Days *</label><input type="number" required value={leaveForm.days} onChange={(e) => setLeaveForm({ ...leaveForm, days: e.target.value })} className="mt-1 input-field" min="1" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Start Date *</label><input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">End Date *</label><input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="mt-1 input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Reason</label><textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={2} className="mt-1 input-field" /></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {showForm && tab === 'claims' && (
        <div className="card p-6">
          <form onSubmit={handleCreateClaim} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Title *</label><input type="text" required value={claimForm.title} onChange={(e) => setClaimForm({ ...claimForm, title: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Category</label><select value={claimForm.category} onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value })} className="mt-1 input-field"><option>travel</option><option>meals</option><option>office</option><option>training</option><option>medical</option><option>other</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Amount ($) *</label><input type="number" required value={claimForm.amount} onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })} className="mt-1 input-field" min="0" step="0.01" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Expense Date *</label><input type="date" required value={claimForm.expenseDate} onChange={(e) => setClaimForm({ ...claimForm, expenseDate: e.target.value })} className="mt-1 input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={claimForm.description} onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })} rows={2} className="mt-1 input-field" /></div>
            <div className="col-span-2 flex gap-2"><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <>
          {tab === 'cases' && (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {cases.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No HR cases</td></tr> :
                    cases.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><p className="text-sm font-medium">{c.number}</p><p className="text-xs text-gray-500">{c.title}</p></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{c.category}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.employee?.name || '—'}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                        <td className="px-6 py-4 text-sm">{c.priority}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'leave' && (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leave requests</td></tr> :
                    leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{l.employee?.name || '—'}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{l.type}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">{l.days}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span></td>
                        <td className="px-6 py-4">
                          {l.status === 'pending' && <div className="flex gap-2">
                            <button onClick={() => approveLeave(l._id, 'approved')} className="text-xs text-green-600 hover:text-green-700">Approve</button>
                            <button onClick={() => approveLeave(l._id, 'rejected')} className="text-xs text-red-600 hover:text-red-700">Reject</button>
                          </div>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'claims' && (
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {claims.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No claims</td></tr> :
                    claims.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{c.employee?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm font-medium">{c.title}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{c.category}</span></td>
                        <td className="px-6 py-4 text-sm">${c.amount.toLocaleString()}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'approved' || c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                        <td className="px-6 py-4">
                          {c.status === 'submitted' && <div className="flex gap-2">
                            <button onClick={() => approveClaim(c._id, 'approved')} className="text-xs text-green-600 hover:text-green-700">Approve</button>
                            <button onClick={() => approveClaim(c._id, 'rejected')} className="text-xs text-red-600 hover:text-red-700">Reject</button>
                          </div>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
