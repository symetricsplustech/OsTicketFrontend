import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

// ITSM-18 — ITSM Reporting: resolution overview, MTTA/MTTR, knowledge gaps
// and realtime platform snapshot. All queries remain tenant-scoped.
export default function HelpdeskReports() {
  const [overview, setOverview] = useState<any>(null);
  const [mtt, setMtt] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, m, g, r] = await Promise.all([
          api.get('/enterprise/reports/overview').catch(() => ({ data: {} })),
          api.get('/gaps2/mtt-metrics').catch(() => ({ data: null })),
          api.get('/gaps3/kb/gap-analysis').catch(() => ({ data: null })),
          api.get('/enterprise/realtime').catch(() => ({ data: null })),
        ]);
        setOverview(o.data.overview || null);
        setMtt(m.data);
        setGaps(g.data);
        setRealtime(r.data?.stats || null);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total tickets', value: overview?.total ?? '—', tone: 'text-gray-900' },
    { label: 'Resolved', value: overview?.resolved ?? '—', tone: 'text-green-600' },
    { label: 'Open', value: overview?.open ?? realtime?.openTickets ?? '—', tone: 'text-blue-600' },
    { label: 'Resolution rate', value: overview ? `${overview.resolutionRate}%` : '—', tone: 'text-brand-600' },
    { label: 'Open incidents', value: realtime?.openIncidents ?? '—', tone: 'text-red-600' },
    { label: 'Pending changes', value: realtime?.pendingChanges ?? '—', tone: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk Reports</h1>
          <p className="text-sm text-gray-500">Backlog, resolution, response times &amp; knowledge gaps</p>
        </div>
        <Link to="/reports" className="btn-secondary text-sm">Advanced Reports</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border p-4">
            <p className={`text-2xl font-bold ${c.tone}`}>{loading ? '…' : c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Response &amp; resolution time</h2>
          {mtt ? (
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-gray-500">Alerts tracked</dt><dd className="font-medium">{mtt.alertsTracked ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Mean time to acknowledge</dt><dd className="font-medium">{mtt.mttAckMinutes != null ? `${Math.round(mtt.mttAckMinutes)} min` : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Mean time to resolve</dt><dd className="font-medium">{mtt.mtrMinutes != null ? `${Math.round(mtt.mtrMinutes)} min` : '—'}</dd></div>
              {mtt.note && <p className="text-xs text-gray-400 pt-1">{mtt.note}</p>}
            </dl>
          ) : (
            <p className="text-xs text-gray-400">No MTT metrics available yet.</p>
          )}
          <Link to="/knowledge-insights" className="text-xs text-brand-600 hover:underline mt-3 inline-block">Open KB insights →</Link>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Knowledge gaps</h2>
          {gaps ? (
            <pre className="text-xs bg-gray-50 border rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {typeof gaps === 'string' ? gaps : JSON.stringify(gaps, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-gray-400">No gap analysis available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
