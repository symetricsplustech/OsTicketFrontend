import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Bell, BellOff } from 'lucide-react';

interface Alert {
  _id: string;
  title: string;
  message?: string;
  severity: string;
  status: string;
  source?: string;
  resource?: { name: string; type: string };
  service?: string;
  metric?: string;
  currentValue?: number;
  threshold?: number;
  acknowledgedBy?: { name: string };
  acknowledgedAt?: string;
  createdAt: string;
}

const SEVERITIES = ['info', 'warning', 'critical', 'emergency'];

export default function AlertDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const res = await api.get('/itom/alerts', { params });
      setAlerts(res.data.alerts || []);
    } catch { setAlerts([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter, severityFilter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.post(`/itom/alerts/${id}/acknowledge`);
      toast.success('Alert acknowledged');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.post(`/itom/alerts/${id}/resolve`);
      toast.success('Alert resolved');
      load();
    } catch { toast.error('Failed'); }
  };

  const sevColor = (s: string) => s === 'critical' || s === 'emergency' ? 'bg-red-100 text-red-700' : s === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
  const statusColor = (s: string) => s === 'firing' ? 'bg-red-100 text-red-700' : s === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40"><option value="">All Status</option><option value="firing">Firing</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input-field w-40"><option value="">All Severity</option>{SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              alerts.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No alerts</td></tr> :
              alerts.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="text-sm font-medium">{a.title}</p>{a.message && <p className="text-xs text-gray-500 line-clamp-1">{a.message}</p>}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${sevColor(a.severity)}`}>{a.severity}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.resource?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.source || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.status === 'firing' && <button onClick={() => handleAcknowledge(a._id)} className="text-xs text-yellow-600 hover:text-yellow-700">Acknowledge</button>}
                      {a.status !== 'resolved' && <button onClick={() => handleResolve(a._id)} className="text-xs text-green-600 hover:text-green-700">Resolve</button>}
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
