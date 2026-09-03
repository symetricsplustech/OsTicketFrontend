import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-05 — Change Advisory Board: pending approvals, emergency approvals,
// blackout windows, and change-calendar linkage.
interface Change {
  _id: string;
  title: string;
  description?: string;
  status: string;
  type?: string;
  risk?: string;
  riskLevel?: string;
  createdAt: string;
}

interface Blackout {
  _id: string;
  name?: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  reason?: string;
}

export default function CabBoard() {
  const [pending, setPending] = useState<Change[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<Record<string, string>>({});
  const [showBlackout, setShowBlackout] = useState(false);
  const [bForm, setBForm] = useState({ name: '', startsAt: '', endsAt: '', reason: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/enterprise/changes'),
        api.get('/gaps2/blackout-windows').catch(() => ({ data: [] })),
      ]);
      const all: Change[] = cRes.data.changes || [];
      setPending(all.filter((c) => c.status === 'pending_approval'));
      setBlackouts(Array.isArray(bRes.data) ? bRes.data : bRes.data?.records || []);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (id: string, verdict: 'approved' | 'rejected') => {
    try {
      await api.put(`/enterprise/changes/${id}`, {
        status: verdict === 'approved' ? 'approved' : 'rejected',
        cabDecision: verdict,
        decidedAt: new Date().toISOString(),
      });
      toast.success(`Change ${verdict}`);
      load();
    } catch {
      toast.error('CAB decision failed');
    }
  };

  const emergencyApprove = async (id: string) => {
    const reason = decision[id] || window.prompt('Emergency justification (required):') || '';
    if (!reason.trim()) return toast.error('Justification required for emergency approval');
    try {
      await api.put(`/enterprise/changes/${id}`, {
        status: 'approved',
        type: 'emergency',
        emergencyJustification: reason,
        decidedAt: new Date().toISOString(),
      });
      toast.success('Emergency change approved');
      load();
    } catch {
      toast.error('Emergency approval failed');
    }
  };

  const createBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/gaps2/blackout-windows', bForm);
      toast.success('Blackout window created');
      setShowBlackout(false);
      setBForm({ name: '', startsAt: '', endsAt: '', reason: '' });
      load();
    } catch {
      toast.error('Failed to create blackout window');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAB Board</h1>
          <p className="text-sm text-gray-500">Change approvals, emergency path &amp; blackout windows</p>
        </div>
        <div className="flex gap-2">
          <Link to="/changes" className="btn-secondary text-sm">All Changes</Link>
          <Link to="/change-calendar" className="btn-secondary text-sm">Change Calendar</Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold text-sm">Awaiting CAB decision ({pending.length})</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Raised</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : pending.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No changes awaiting approval</td></tr>
            ) : pending.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 align-top">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{c.title}</p>
                  {c.description && <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{c.description}</p>}
                </td>
                <td className="px-5 py-3"><StatusBadge status={c.type || 'normal'} /></td>
                <td className="px-5 py-3"><StatusBadge status={c.risk || c.riskLevel || 'medium'} /></td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => decide(c._id, 'approved')} className="px-2.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => decide(c._id, 'rejected')} className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </div>
                    <div className="flex gap-1">
                      <input
                        value={decision[c._id] || ''}
                        onChange={(e) => setDecision((d) => ({ ...d, [c._id]: e.target.value }))}
                        placeholder="Emergency justification…"
                        className="input-field text-xs py-1 w-44"
                      />
                      <button onClick={() => emergencyApprove(c._id)} className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded hover:bg-orange-50">⚡</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Blackout windows</h2>
          <button onClick={() => setShowBlackout(!showBlackout)} className="btn-secondary text-xs">+ Add window</button>
        </div>
        {showBlackout && (
          <form onSubmit={createBlackout} className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 border rounded-lg p-4">
            <input required value={bForm.name} onChange={(e) => setBForm({ ...bForm, name: e.target.value })} placeholder="Name *" className="input-field text-sm" />
            <input value={bForm.reason} onChange={(e) => setBForm({ ...bForm, reason: e.target.value })} placeholder="Reason" className="input-field text-sm" />
            <input type="datetime-local" value={bForm.startsAt} onChange={(e) => setBForm({ ...bForm, startsAt: e.target.value })} className="input-field text-sm" />
            <input type="datetime-local" value={bForm.endsAt} onChange={(e) => setBForm({ ...bForm, endsAt: e.target.value })} className="input-field text-sm" />
            <div className="col-span-2"><button type="submit" className="btn-primary text-xs">Create window</button></div>
          </form>
        )}
        {blackouts.length === 0 ? (
          <p className="text-xs text-gray-400">No blackout windows configured.</p>
        ) : (
          <ul className="divide-y text-sm">
            {blackouts.map((b) => (
              <li key={b._id} className="py-2 flex items-center justify-between">
                <span className="font-medium">{b.name || b.title}</span>
                <span className="text-xs text-gray-500">
                  {b.startsAt ? formatDate(b.startsAt) : '—'} → {b.endsAt ? formatDate(b.endsAt) : '—'}
                  {b.reason ? ` · ${b.reason}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
