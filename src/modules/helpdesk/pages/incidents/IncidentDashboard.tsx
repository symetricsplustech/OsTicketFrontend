import React, { useState, useEffect } from 'react';
import { incidentApi, Incident } from '@modules/helpdesk/services/incidents/incidentApi';
import { formatDate } from '@shared/lib/format';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  on_hold_caller: 'bg-orange-100 text-orange-800',
  on_hold_change: 'bg-orange-100 text-orange-800',
  on_hold_problem: 'bg-orange-100 text-orange-800',
  on_hold_vendor: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
};

export default function IncidentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, onHold: 0, resolved: 0, major: 0 });
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allRes, majorRes] = await Promise.all([
          incidentApi.list({ limit: 10 }),
          incidentApi.listMajorIncidents({ limit: 5 }),
        ]);

        const items = allRes.data.items || [];
        setRecentIncidents(items);
        setStats({
          total: allRes.data.total || 0,
          open: items.filter((i: Incident) => ['new', 'in_progress'].includes(i.status)).length,
          onHold: items.filter((i: Incident) => i.status.startsWith('on_hold_')).length,
          resolved: items.filter((i: Incident) => i.status === 'resolved').length,
          major: majorRes.data.total || 0,
        });
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Incident Dashboard</h1>
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Open', value: stats.open, color: 'text-blue-600' },
          { label: 'On Hold', value: stats.onHold, color: 'text-orange-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
          { label: 'Major', value: stats.major, color: 'text-red-600' },
        ].map(card => (
          <div key={card.label} className="card p-4 text-center">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Recent Incidents</h2>
        <div className="space-y-2">
          {recentIncidents.map(inc => (
            <div key={inc._id} className="flex items-center justify-between border rounded p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/incidents/${inc._id}`)}>
              <div>
                <span className="font-medium">{inc.number}: {inc.title}</span>
                <span className="ml-2 text-xs text-gray-500">{formatDate(inc.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[inc.status] || 'bg-gray-100'}`}>{inc.status}</span>
                <span className="text-xs text-gray-500">{inc.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
