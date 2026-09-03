import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-04 + ITSM-08 — Problem RCA, known errors & workarounds: publish a
// problem's workaround to the knowledge base, or raise a permanent-fix
// change straight from the problem record.
interface Problem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  rootCause?: string;
  workaround?: string;
  assignedTo?: { name?: string };
  createdAt: string;
}

export default function KnownErrors() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'with-workaround' | 'no-rca'>('all');
  const [busy, setBusy] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enterprise/problems');
      setProblems(res.data.problems || []);
    } catch {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const publishKb = async (id: string) => {
    setBusy(id);
    try {
      await api.post(`/ops/problems/${id}/publish-kb`, {});
      toast.success('Workaround published to knowledge base');
    } catch {
      toast.error('Publish failed');
    } finally {
      setBusy('');
    }
  };

  const generateChange = async (id: string) => {
    setBusy(id);
    try {
      await api.post(`/gaps2/problems/${id}/generate-change`, {});
      toast.success('Permanent-fix change raised (pending CAB)');
    } catch {
      toast.error('Failed to raise change');
    } finally {
      setBusy('');
    }
  };

  const rows = problems.filter((p) => {
    if (filter === 'with-workaround') return !!p.workaround;
    if (filter === 'no-rca') return !p.rootCause;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Known Errors &amp; RCA</h1>
          <p className="text-sm text-gray-500">Root cause, workarounds, KB publishing &amp; permanent fixes</p>
        </div>
        <div className="flex gap-2">
          <Link to="/problems" className="btn-secondary text-sm">All Problems</Link>
          <Link to="/kb" className="btn-secondary text-sm">Knowledge Base</Link>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        {(['all', 'with-workaround', 'no-rca'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg border ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600'}`}
          >
            {f === 'all' ? 'All' : f === 'with-workaround' ? 'Has workaround' : 'Missing RCA'}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="card p-10 text-center text-gray-400">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">No problems match this filter</div>
        ) : rows.map((p) => (
          <div key={p._id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{p.title}</p>
                  <StatusBadge status={p.status} />
                  <StatusBadge status={p.priority} />
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm">
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Root cause</p>
                    <p className="text-gray-700">{p.rootCause || <span className="text-gray-400">RCA pending — five-whys analysis needed</span>}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 uppercase mb-1">Workaround</p>
                    <p className="text-gray-700">{p.workaround || <span className="text-gray-400">No workaround documented</span>}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {p.assignedTo?.name ? `Owner: ${p.assignedTo.name} · ` : ''}Opened {formatDate(p.createdAt)}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => publishKb(p._id)}
                  disabled={busy === p._id || !p.workaround}
                  title={!p.workaround ? 'Add a workaround before publishing' : 'Publish workaround to KB'}
                  className="btn-secondary text-xs disabled:opacity-40"
                >
                  {busy === p._id ? 'Working…' : 'Publish to KB'}
                </button>
                <button
                  onClick={() => generateChange(p._id)}
                  disabled={busy === p._id}
                  className="btn-secondary text-xs disabled:opacity-40"
                >
                  Raise fix change
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
