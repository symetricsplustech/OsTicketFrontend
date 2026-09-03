import React, { useEffect, useState } from 'react';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-13 — Escalation Management: priority / SLA / functional / hierarchical
// escalations with rules, history and override.
interface Escalation {
  _id: string;
  ticketNumber?: string;
  ticket?: string;
  type?: string;
  kind?: string;
  reason?: string;
  from?: string;
  to?: string;
  toAgent?: { name?: string };
  toGroup?: string;
  status?: string;
  createdAt: string;
}

const TYPES = ['priority', 'sla', 'functional', 'hierarchical', 'manager', 'vip', 'unassigned', 'overdue'];

export default function Escalations() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('escalations.manage');
  const [items, setItems] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticketNumber: '', type: 'priority', reason: '', to: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agent/escalations');
      setItems(res.data.escalations || res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/agent/escalations', form);
      toast.success('Escalation raised');
      setShowForm(false);
      setForm({ ticketNumber: '', type: 'priority', reason: '', to: '' });
      load();
    } catch {
      toast.error('Failed to raise escalation');
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, status: string) => {
    try {
      await api.put(`/agent/escalations/${id}`, { status });
      toast.success(`Escalation ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Withdraw this escalation?')) return;
    try {
      await api.delete(`/agent/escalations/${id}`);
      toast.success('Escalation withdrawn');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
          <p className="text-sm text-gray-500">Priority, SLA, functional &amp; hierarchical escalations</p>
        </div>
        {canManage ? (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Raise Escalation</button>
        ) : (
          <span className="text-xs text-gray-400" title="Requires escalations.manage">Read-only (no escalations.manage)</span>
        )}
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <h2 className="font-semibold">New escalation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input required value={form.ticketNumber} onChange={(e) => setForm({ ...form, ticketNumber: e.target.value })}
              placeholder="Ticket number *" className="input-field" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="Escalate to (agent / group / manager)" className="input-field w-full" />
          <textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2} placeholder="Reason *" className="input-field w-full" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Raising…' : 'Raise'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Raised</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No escalations</td></tr>
            ) : items.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium">{e.ticketNumber || e.ticket || '—'}</td>
                <td className="px-5 py-3"><StatusBadge status={e.type || e.kind || 'priority'} /></td>
                <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{e.reason || '—'}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{e.to || (e as any).toAgent?.name || e.toGroup || '—'}</td>
                <td className="px-5 py-3"><StatusBadge status={e.status || 'open'} /></td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(e.createdAt)}</td>
                <td className="px-5 py-3">
                  {canManage ? (
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => update(e._id, 'acknowledged')} className="text-brand-600 hover:underline">Ack</button>
                      <button onClick={() => update(e._id, 'resolved')} className="text-green-600 hover:underline">Resolve</button>
                      <button onClick={() => remove(e._id)} className="text-red-500 hover:underline">Withdraw</button>
                    </div>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
