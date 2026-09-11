import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';
import { useAuth } from '@core/auth/useAuth';

interface Change {
  _id: string;
  title: string;
  description?: string;
  status: string;
  type?: string;
  risk?: string;
  reason?: string;
  plan?: string;
  rollbackPlan?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

const TYPES = ['standard', 'normal', 'emergency'];
const RISKS = ['low', 'medium', 'high', 'critical'];

export default function Changes() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('records.create');
  const canView = hasPermission('records.view');
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'standard', risk: 'medium', reason: '', plan: '', rollbackPlan: '', windowStart: '', windowEnd: '' });
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [loadError, setLoadError] = useState('');

  const checkConflicts = async () => {
    if (!canView) return toast.error('You do not have permission to view change conflicts.');
    if (!form.windowStart || !form.windowEnd) {
      toast.error('Set an implementation window first');
      return;
    }
    setChecking(true);
    try {
      const res = await api.get('/enterprise/changes/conflicts', { params: { start: form.windowStart, end: form.windowEnd } });
      setConflicts(res.data.conflicts);
      const n = (res.data.conflicts?.overlapping?.length || 0) + (res.data.conflicts?.blackouts?.length || 0);
      toast(n ? `⚠️ ${n} conflict(s) found` : 'No conflicts in this window', { icon: n ? '⚠️' : '✅' });
    } catch {
      toast.error('Conflict check failed');
    } finally {
      setChecking(false);
    }
  };

  const load = async () => {
    try {
      const res = await api.get('/enterprise/changes');
      setChanges(res.data.changes || []);
    } catch (error: any) {
      setChanges([]);
      setLoadError(error?.response?.status === 403 ? 'You do not have permission to view changes.' : 'Unable to load changes. Please retry.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return toast.error('You do not have permission to create changes.');
    setSaving(true);
    try {
      const res = await api.post('/enterprise/changes', {
        ...form,
        windowStart: form.windowStart || undefined,
        windowEnd: form.windowEnd || undefined,
      });
      const n = (res.data?.conflicts?.overlapping?.length || 0) + (res.data?.conflicts?.blackouts?.length || 0);
      toast.success(n ? `Change raised (risk ${res.data?.change?.riskScore ?? '—'}) — ${n} conflict(s)!` : 'Change request created');
      setShowForm(false);
      setConflicts(null);
      setForm({ title: '', description: '', type: 'standard', risk: 'medium', reason: '', plan: '', rollbackPlan: '', windowStart: '', windowEnd: '' });
      load();
    } catch { toast.error('Failed to create change'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
        {canCreate && <button onClick={() => setShowForm(true)} className="btn-primary">Request Change</button>}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Change Request</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 input-field">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                <select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} className="mt-1 input-field">
                  {RISKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Change</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="mt-1 input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Implementation Plan</label>
              <textarea value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} rows={3} className="mt-1 input-field" placeholder="Step-by-step implementation plan..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rollback Plan</label>
              <textarea value={form.rollbackPlan} onChange={(e) => setForm({ ...form, rollbackPlan: e.target.value })} rows={3} className="mt-1 input-field" placeholder="Steps to rollback if change fails..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Window start</label>
                <input type="datetime-local" value={form.windowStart} onChange={(e) => setForm({ ...form, windowStart: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Window end</label>
                <input type="datetime-local" value={form.windowEnd} onChange={(e) => setForm({ ...form, windowEnd: e.target.value })} className="mt-1 input-field" />
              </div>
            </div>
            <div>
              <button type="button" onClick={checkConflicts} disabled={checking} className="btn-secondary text-sm disabled:opacity-40">
                {checking ? 'Checking…' : 'Check calendar conflicts'}
              </button>
              {conflicts && (
                <div className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 space-y-1">
                  {(conflicts.overlapping || []).map((c: any) => (
                    <p key={c.id}>⚠️ Overlaps <b>{c.number}</b> — {c.title} ({c.status})</p>
                  ))}
                  {(conflicts.blackouts || []).map((b: any) => (
                    <p key={b.id}>⛔ Blackout <b>{b.name}</b></p>
                  ))}
                  {(conflicts.sharedAssets || []).map((s: any, i: number) => (
                    <p key={i}>🔗 Shared assets with <b>{s.number}</b></p>
                  ))}
                  {!conflicts.overlapping?.length && !conflicts.blackouts?.length && !conflicts.sharedAssets?.length && (
                    <p className="text-green-700">Window is clear.</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Submit Change Request'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loadError && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              changes.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No change requests</td></tr> :
              changes.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{c.title}</p>
                    {c.description && <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{c.type || 'standard'}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    c.status === 'implemented' ? 'bg-green-100 text-green-700' :
                    c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{c.status}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    c.risk === 'critical' ? 'bg-red-100 text-red-700' :
                    c.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                    c.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{c.risk || 'medium'}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.assignedTo?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
