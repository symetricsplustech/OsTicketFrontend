import React, { useState } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

// ITSM-17 — Satisfaction: per-ticket survey lookup, negative-feedback
// recovery sweep (auto-creates follow-up tasks) and score summary.
interface Survey {
  _id: string;
  score?: number;
  rating?: number;
  comment?: string;
  feedback?: string;
  createdAt: string;
}

export default function CsatDashboard() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [sweepResult, setSweepResult] = useState<any>(null);

  const lookup = async () => {
    if (!ticketNumber.trim()) return toast.error('Enter a ticket number');
    setLoading(true);
    try {
      const res = await api.get(`/public/csat/ticket/${ticketNumber.trim()}`);
      setSurveys(res.data.surveys || res.data.responses || (Array.isArray(res.data) ? res.data : []));
    } catch {
      setSurveys([]);
      toast.error('No surveys found');
    } finally {
      setLoading(false);
    }
  };

  const runSweep = async () => {
    try {
      const res = await api.post('/gaps2/csat-negative-recovery-sweep', {});
      setSweepResult(res.data);
      toast.success(`Recovery sweep: ${res.data?.created ?? 0} follow-up task(s)`);
    } catch {
      toast.error('Sweep failed');
    }
  };

  const scores = surveys.map((s) => s.score ?? s.rating ?? 0).filter(Boolean);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Satisfaction (CSAT)</h1>
          <p className="text-sm text-gray-500">Surveys, negative-feedback recovery &amp; scores</p>
        </div>
        <button onClick={runSweep} className="btn-secondary text-sm">Run recovery sweep</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{avg}</p>
          <p className="text-sm text-gray-500">Average score (lookup)</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{surveys.length}</p>
          <p className="text-sm text-gray-500">Responses found</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{sweepResult?.created ?? '—'}</p>
          <p className="text-sm text-gray-500">Recovery tasks created (last sweep)</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-3">Survey lookup by ticket</h2>
        <div className="flex gap-2 mb-4">
          <input value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="Ticket number" className="input-field text-sm flex-1 max-w-xs" />
          <button onClick={lookup} disabled={loading} className="btn-primary text-sm">
            {loading ? 'Searching…' : 'Lookup'}
          </button>
        </div>
        {surveys.length === 0 ? (
          <p className="text-xs text-gray-400">No responses loaded. Low scores (≤ 2) trigger follow-up tasks via the recovery sweep.</p>
        ) : (
          <ul className="divide-y">
            {surveys.map((s) => (
              <li key={s._id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                    (s.score ?? s.rating ?? 0) <= 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {s.score ?? s.rating ?? '?'} / 5
                  </span>
                  {(s.comment || s.feedback) && <p className="text-sm text-gray-600 mt-1">{s.comment || s.feedback}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(s.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
