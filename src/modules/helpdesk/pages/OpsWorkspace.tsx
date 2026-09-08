import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import toast from 'react-hot-toast';
import { LayoutDashboard, AlertTriangle, Layers, Clock, Shield } from 'lucide-react';

interface Alert {
  _id: string;
  title: string;
  severity: string;
  status: string;
  source?: string;
  resource?: { name: string; type: string };
  count: number;
  createdAt: string;
}

interface Incident {
  _id: string;
  title: string;
  status: string;
  priority?: string;
  severity?: string;
  commander?: { name?: string } | string;
  team?: string;
  createdAt: string;
}

interface Change {
  _id: string;
  title: string;
  status: string;
  riskScore?: number;
  risk?: string;
  windowStart?: string;
  windowEnd?: string;
  createdAt: string;
}

interface Prediction {
  ticketId: string;
  number: string;
  subject: string;
  priority: string;
  etaLabel: string;
  risk: number;
  category: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-900',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  at_risk: 'bg-red-100 text-red-700',
  watching: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
};

const CHANGE_ACTIVE = ['for_approval', 'approved', 'scheduled', 'implementing', 'validating'];

function OpsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [atRisk, setAtRisk] = useState<Prediction[]>([]);
  const [watching, setWatching] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get('/enterprise/itom/alerts', { params: { status: 'firing' } });
      setAlerts(res.data.alerts || []);
    } catch { setAlerts([]); }

    try {
      const res = await api.get('/enterprise/incidents');
      const all: Incident[] = res.data.incidents || res.data.items || [];
      setIncidents(all.filter((i) =>
        ['open', 'new', 'in_progress', 'acknowledged'].includes(i.status) &&
        (i.severity === 'critical' || i.priority === 'critical' || i.severity === 'Sev1')
      ));
    } catch { setIncidents([]); }

    try {
      const res = await api.get('/enterprise/changes');
      const all: Change[] = res.data.changes || [];
      setChanges(all.filter((c) => CHANGE_ACTIVE.includes(c.status)));
    } catch { setChanges([]); }

    try {
      const res = await api.get('/agent/tickets/sla/predictions');
      setAtRisk(res.data.atRisk || []);
      setWatching(res.data.watching || []);
    } catch { setAtRisk([]); setWatching([]); }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  const ackAlert = async (id: string) => {
    try {
      await api.put(`/enterprise/itom/alerts/${id}`, { status: 'acknowledged' });
      toast.success('Alert acknowledged');
      load();
    } catch { toast.error('Failed to acknowledge alert'); }
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleString() : '—';

  const activeIncidentCount = incidents.length;
  const activeChangeCount = changes.length;
  const fireAlertCount = alerts.length;
  const slaAtRiskCount = atRisk.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Service Operations Workspace</h1>
        </div>
        <span className="text-sm text-gray-500">Auto-refreshes every 15 s</span>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Layers size={14} /> Active Incidents
          </div>
          <p className="text-3xl font-bold text-red-600">{activeIncidentCount}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Clock size={14} /> Changes In-Flight
          </div>
          <p className="text-3xl font-bold text-blue-600">{activeChangeCount}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <AlertTriangle size={14} /> Fire Alerts
          </div>
          <p className="text-3xl font-bold text-orange-600">{fireAlertCount}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
            <Shield size={14} /> SLA At-Risk
          </div>
          <p className="text-3xl font-bold text-amber-600">{slaAtRiskCount}</p>
        </div>
      </div>

      {/* Alerts + Incidents side-by-side */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Alerts — 40% */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" /> Firing Alerts
            </h2>
            <span className="text-xs text-gray-400">{fireAlertCount} active</span>
          </div>
          {loading && alerts.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">Loading…</p>
          ) : alerts.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No firing alerts.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[a.severity] || 'bg-gray-100 text-gray-700'}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{a.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.resource?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-center font-mono">{a.count}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => ackAlert(a._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded hover:bg-yellow-100 transition"
                      >
                        Ack
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Incidents — 60% */}
        <div className="card overflow-hidden lg:col-span-3">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Layers size={14} className="text-red-500" /> Critical Incidents
            </h2>
            <span className="text-xs text-gray-400">{activeIncidentCount} open</span>
          </div>
          {loading && incidents.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">Loading…</p>
          ) : incidents.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No open critical incidents.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {incidents.map((inc) => (
                <Link
                  key={inc._id}
                  to="/incidents"
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inc.team || 'Unassigned'} · {fmt(inc.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[inc.priority || inc.severity || 'medium'] || 'bg-gray-100 text-gray-700'}`}>
                      {inc.priority || inc.severity || '—'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {inc.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Changes in-flight */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Clock size={14} className="text-blue-500" /> Changes In-Flight
          </h2>
          <span className="text-xs text-gray-400">{activeChangeCount} active</span>
        </div>
        {loading && changes.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">Loading…</p>
        ) : changes.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No in-flight changes.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {changes.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to="/changes-crud" className="text-sm font-medium text-indigo-600 hover:underline">{c.title}</Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm">
                    {c.riskScore != null ? (
                      <span className="font-mono text-xs">{c.riskScore}</span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.risk === 'critical' ? 'bg-red-100 text-red-700' :
                        c.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                        c.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>{c.risk || '—'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {fmt(c.windowStart)} — {fmt(c.windowEnd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SLA at-risk */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Shield size={14} className="text-amber-500" /> SLA At-Risk Tickets
          </h2>
          <span className="text-xs text-gray-400">{slaAtRiskCount} at risk · {watching.length} watching</span>
        </div>
        {loading && atRisk.length === 0 && watching.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">Loading…</p>
        ) : atRisk.length === 0 && watching.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No SLA tickets at risk.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk %</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...atRisk, ...watching].map((p) => (
                <tr key={p.ticketId || p.number} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/tickets/${p.number}`} className="text-sm font-medium text-indigo-600 hover:underline">#{p.number}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm truncate max-w-xs">{p.subject}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[p.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 font-mono">{p.etaLabel}</td>
                  <td className="px-5 py-3 text-sm font-mono">{Math.round(p.risk * 100)}%</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-700'}`}>
                      {p.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function OpsWorkspace() {
  return (
    <ModuleGuard module="itom">
      <OpsPage />
    </ModuleGuard>
  );
}
