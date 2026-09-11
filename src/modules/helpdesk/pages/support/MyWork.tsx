import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import { formatRelativeTime } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-15 — Service Desk Workspace: agent queues (My / Team / Unassigned /
// Overdue / Escalated) + saved queues. Buckets are derived client-side from
// GET /agent/tickets so queue counts always match record-level visibility.
interface Ticket {
  _id: string;
  number: string;
  title?: string;
  subject?: string;
  status: string;
  priority: string;
  agent?: { _id?: string; name?: string } | string;
  assignedTo?: { _id?: string; name?: string } | string;
  dueDate?: string;
  resolutionDue?: string;
  createdAt: string;
}

type QueueKey = 'mine' | 'team' | 'unassigned' | 'overdue' | 'all';

const QUEUES: Array<{ key: QueueKey; label: string; hint: string }> = [
  { key: 'mine', label: 'My Tickets', hint: 'Assigned to me' },
  { key: 'team', label: 'Team Tickets', hint: 'Assigned, not to me' },
  { key: 'unassigned', label: 'Unassigned', hint: 'Needs an owner' },
  { key: 'overdue', label: 'Overdue', hint: 'Past due, still open' },
  { key: 'all', label: 'All Open', hint: 'Everything open' },
];

const agentIdOf = (t: Ticket): string => {
  const a: any = t.agent ?? t.assignedTo;
  if (!a) return '';
  return typeof a === 'string' ? a : a._id || '';
};

export default function MyWork() {
  const { user } = useAuth();
  const myId = String((user as any)?._id || (user as any)?.id || '');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueKey>('mine');
  const [saved, setSaved] = useState<any[]>([]);
  const [savedName, setSavedName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, qRes] = await Promise.all([
        api.get('/agent/tickets', { params: { limit: 100 } }),
        api.get('/agent/queues/saved').catch(() => ({ data: { queues: [] } })),
      ]);
      setTickets(tRes.data.tickets || []);
      setSaved(qRes.data.queues || qRes.data || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const buckets = useMemo(() => {
    const open = tickets.filter((t) => !['closed', 'resolved', 'archived'].includes(t.status));
    const isOverdue = (t: Ticket) => {
      const due = t.resolutionDue || t.dueDate;
      return !!due && new Date(due).getTime() < Date.now();
    };
    return {
      mine: open.filter((t) => agentIdOf(t) === myId),
      team: open.filter((t) => agentIdOf(t) && agentIdOf(t) !== myId),
      unassigned: open.filter((t) => !agentIdOf(t)),
      overdue: open.filter(isOverdue),
      all: open,
    };
  }, [tickets, myId]);

  const rows = buckets[queue];

  const saveCurrentQueue = async () => {
    if (!savedName.trim()) return toast.error('Name the view first');
    try {
      await api.post('/agent/queues/saved', { name: savedName.trim(), queue });
      toast.success('View saved');
      setSavedName('');
      load();
    } catch {
      toast.error('Failed to save view');
    }
  };

  const deleteSaved = async (id: string) => {
    try {
      await api.delete(`/agent/queues/saved/${id}`);
      load();
    } catch {
      toast.error('Failed to delete view');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work</h1>
          <p className="text-sm text-gray-500">Service desk workspace queues</p>
        </div>
        <Link to="/tickets/new" className="btn-primary text-sm">+ New Ticket</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {QUEUES.map((q) => (
          <button
            key={q.key}
            onClick={() => setQueue(q.key)}
            className={`text-left rounded-xl border p-4 transition-colors ${
              queue === q.key ? 'border-brand-500 bg-brand-50' : 'bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{buckets[q.key].length}</p>
            <p className="text-sm font-medium">{q.label}</p>
            <p className="text-xs text-gray-400">{q.hint}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">{QUEUES.find((q) => q.key === queue)?.label}</h2>
          <div className="flex items-center gap-2">
            <input
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="Save current view as…"
              className="input-field text-xs py-1.5 w-48"
            />
            <button onClick={saveCurrentQueue} className="btn-secondary text-xs py-1.5">Save view</button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Queue is clear 🎉</td></tr>
            ) : (
              rows.map((t) => {
                const assignee: any = t.agent ?? t.assignedTo;
                return (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link to={`/tickets/${t.number}`} className="text-sm font-medium text-brand-700 hover:underline">
                        #{t.number} — {t.title || (t as any).subject || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3"><StatusBadge status={t.priority} /></td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {typeof assignee === 'string' ? assignee : assignee?.name || 'Unassigned'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">{formatRelativeTime(t.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {saved.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-3">Saved views</h2>
          <div className="flex flex-wrap gap-2">
            {saved.map((s: any) => (
              <span key={s._id || s.name} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded-full text-xs">
                <button
                  className="font-medium text-gray-700 hover:text-brand-700"
                  onClick={() => s.queue && setQueue(s.queue)}
                >
                  {s.name}
                </button>
                {s._id && (
                  <button onClick={() => deleteSaved(s._id)} className="text-gray-300 hover:text-red-500">✕</button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
