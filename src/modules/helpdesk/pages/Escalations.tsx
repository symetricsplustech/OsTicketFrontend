import React, { useEffect, useState } from 'react';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-13 — Escalation Rules: priority / SLA / functional escalation rules
// evaluated by the background engine (escalation.service). A rule that
// reassigns to a team routes ownerless tickets to the TEAM LEAD and always
// notifies them (hierarchy enforcement, backend).
interface Rule {
  _id: string;
  name: string;
  department?: { _id: string; name: string } | string;
  priority?: string;
  statuses?: string[];
  overdueMinutes?: number;
  action?: {
    raisePriorityTo?: string;
    reassignAgent?: { _id: string; name: string } | string;
    reassignTeam?: { _id: string; name: string } | string;
    notifyAgent?: { _id: string; name: string } | string;
  };
  isActive?: boolean;
  createdAt: string;
}

const STATUSES = ['open', 'assigned', 'overdue'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Emergency'];
const idOf = (v: any): string => (!v ? '' : typeof v === 'string' ? v : v._id || '');
const nameOf = (v: any): string => (!v ? '—' : typeof v === 'string' ? v : v.name || '—');

const emptyForm = {
  name: '',
  department: '',
  priority: '',
  statuses: ['open', 'assigned', 'overdue'] as string[],
  overdueMinutes: 0,
  raisePriorityTo: '',
  reassignAgent: '',
  reassignTeam: '',
  notifyAgent: '',
  isActive: true,
};

export default function Escalations() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('escalations.manage');
  const [items, setItems] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [agents, setAgents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, aRes, tRes, dRes] = await Promise.all([
        api.get('/agent/escalations'),
        api.get('/admin/agents').catch(() => ({ data: {} })),
        api.get('/admin/teams').catch(() => ({ data: {} })),
        api.get('/admin/departments').catch(() => ({ data: {} })),
      ]);
      const rules = rRes.data.rules || rRes.data.items || (Array.isArray(rRes.data) ? rRes.data : []);
      setItems(rules);
      setAgents(aRes.data.items || aRes.data.agents || []);
      setTeams(tRes.data.teams || tRes.data.items || []);
      setDepartments(dRes.data.departments || dRes.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (rule: Rule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      department: idOf(rule.department),
      priority: rule.priority || '',
      statuses: rule.statuses?.length ? rule.statuses : ['open', 'assigned', 'overdue'],
      overdueMinutes: rule.overdueMinutes || 0,
      raisePriorityTo: rule.action?.raisePriorityTo || '',
      reassignAgent: idOf(rule.action?.reassignAgent),
      reassignTeam: idOf(rule.action?.reassignTeam),
      notifyAgent: idOf(rule.action?.notifyAgent),
      isActive: rule.isActive !== false,
    });
    setShowForm(true);
  };

  const toggleStatus = (s: string) => {
    setForm((f) => ({
      ...f,
      statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s],
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        department: form.department || null,
        priority: form.priority || null,
        statuses: form.statuses,
        overdueMinutes: Number(form.overdueMinutes) || 0,
        action: {
          raisePriorityTo: form.raisePriorityTo || null,
          reassignAgent: form.reassignAgent || null,
          reassignTeam: form.reassignTeam || null,
          notifyAgent: form.notifyAgent || null,
        },
        isActive: form.isActive,
      };
      if (editing) await api.put(`/agent/escalations/${editing._id}`, body);
      else await api.post('/agent/escalations', body);
      toast.success(editing ? 'Rule updated' : 'Rule created');
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this escalation rule?')) return;
    try {
      await api.delete(`/agent/escalations/${id}`);
      toast.success('Rule deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const sel = 'input-field text-sm w-full';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalation Rules</h1>
          <p className="text-sm text-gray-500">Priority, SLA &amp; functional escalation — evaluated by the engine</p>
        </div>
        {canManage ? (
          <button onClick={openCreate} className="btn-primary text-sm">New Rule</button>
        ) : (
          <span className="text-xs text-gray-400" title="Requires escalations.manage">Read-only (no escalations.manage)</span>
        )}
      </div>

      {showForm && canManage && (
        <form onSubmit={save} className="card p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit rule' : 'New escalation rule'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rule name *" className="input-field text-sm" />
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={sel}>
              <option value="">All departments</option>
              {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={sel}>
              <option value="">Any priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Overdue after (min):</span>
              <input type="number" min={0} value={form.overdueMinutes}
                onChange={(e) => setForm({ ...form, overdueMinutes: Number(e.target.value) })}
                className="input-field text-sm w-28" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Applies to:</span>
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.statuses.includes(s)} onChange={() => toggleStatus(s)} className="rounded" />
                {s}
              </label>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 bg-gray-50 border rounded-lg p-4">
            <select value={form.raisePriorityTo} onChange={(e) => setForm({ ...form, raisePriorityTo: e.target.value })} className={sel}>
              <option value="">No priority change</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>Raise to {p}</option>)}
            </select>
            <select value={form.reassignAgent} onChange={(e) => setForm({ ...form, reassignAgent: e.target.value })} className={sel}>
              <option value="">No agent reassignment</option>
              {agents.map((a: any) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
            <select value={form.reassignTeam} onChange={(e) => setForm({ ...form, reassignTeam: e.target.value })} className={sel}>
              <option value="">No team reassignment</option>
              {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name} (lead notified)</option>)}
            </select>
            <select value={form.notifyAgent} onChange={(e) => setForm({ ...form, notifyAgent: e.target.value })} className={sel}>
              <option value="">No extra notification</option>
              {agents.map((a: any) => <option key={a._id} value={a._id}>Notify {a.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            Rule active
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              {canManage && <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Manage</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No escalation rules</td></tr>
            ) : items.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-gray-400">{nameOf(r.department)}{r.overdueMinutes ? ` · overdue > ${r.overdueMinutes}m` : ''}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(r.statuses || []).map((s) => <StatusBadge key={s} status={s} />)}
                    {r.priority && <StatusBadge status={r.priority} />}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {[
                    r.action?.raisePriorityTo && `↑ ${r.action.raisePriorityTo}`,
                    r.action?.reassignAgent && `→ ${nameOf(r.action.reassignAgent)}`,
                    r.action?.reassignTeam && `→ team ${nameOf(r.action.reassignTeam)}`,
                    r.action?.notifyAgent && `🔔 ${nameOf(r.action.notifyAgent)}`,
                  ].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-5 py-3"><StatusBadge status={r.isActive !== false ? 'active' : 'disabled'} /></td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(r.createdAt)}</td>
                {canManage && (
                  <td className="px-5 py-3">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => openEdit(r)} className="text-brand-600 hover:underline">Edit</button>
                      <button onClick={() => remove(r._id)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
