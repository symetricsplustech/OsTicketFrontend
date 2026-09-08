import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import { AlertTriangle, CheckCircle, Shield, Eye } from 'lucide-react';

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

const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-red-100 text-red-700',
  emergency: 'bg-red-200 text-red-900',
};
const STATUS_COLORS: Record<string, string> = {
  firing: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  silenced: 'bg-gray-100 text-gray-600',
};

function AlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/enterprise/itom/alerts', { params });
      setAlerts(res.data.alerts || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [severityFilter, statusFilter]);

  useEffect(() => {
    const interval = setInterval(() => { load(); }, 10000);
    return () => clearInterval(interval);
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.put(`/enterprise/itom/alerts/${id}`, { status: 'acknowledged' });
      toast.success('Alert acknowledged');
      load();
    } catch {
      toast.error('Failed to acknowledge');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/enterprise/itom/alerts/${id}`, { status: 'resolved' });
      toast.success('Alert resolved');
      load();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <span className="text-sm text-gray-500">Auto-refreshes every 10s</span>
      </div>

      <div className="flex gap-4">
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input-field w-44">
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="emergency">Emergency</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-44">
          <option value="">All Status</option>
          <option value="firing">Firing</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="silenced">Silenced</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
            ) : alerts.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No alerts found</td></tr>
            ) : alerts.map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{a.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${SEVERITY_COLORS[a.severity] || 'bg-gray-100 text-gray-700'}`}>{a.severity}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{a.source || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{a.resource?.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-center font-mono">{a.count}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(a.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {a.status === 'firing' && (
                      <button onClick={() => handleAcknowledge(a._id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded hover:bg-yellow-100 transition">
                        <Eye size={12} /> Ack
                      </button>
                    )}
                    {a.status !== 'resolved' && (
                      <button onClick={() => handleResolve(a._id)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition">
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Alerts() {
  return (
    <ModuleGuard module="itom">
      <AlertPage />
    </ModuleGuard>
  );
}
