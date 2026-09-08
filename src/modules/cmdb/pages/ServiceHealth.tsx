import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ServiceHealthItem {
  _id: string;
  name: string;
  serviceType: string;
  criticality: string;
  healthScore: number;
  ciCount: number;
  firingAlertCount: number;
  status: 'healthy' | 'degraded' | 'critical';
}

interface Overview {
  healthy: number;
  degraded: number;
  critical: number;
  monitoredCis: number;
  firingAlerts: number;
}

interface HealthResponse {
  services: ServiceHealthItem[];
  overview: Overview;
}

const STATUS_BADGES: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700',
  degraded: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const CRITICALITY_BADGES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

function ServiceHealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/enterprise/cmdb/services/health');
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await api.post('/enterprise/cmdb/services/health/recompute');
      toast.success('Recompute started');
      await load();
    } catch {
      toast.error('Recompute failed');
    } finally {
      setRecomputing(false);
    }
  };

  const sorted = [...(data?.services || [])].sort((a, b) => a.healthScore - b.healthScore);
  const overview = data?.overview;

  const scoreBarColor = (score: number) =>
    score >= 75 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <ModuleGuard module="cmdb">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6" /> Service Health
          </h1>
          <button
            onClick={handleRecompute}
            disabled={recomputing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${recomputing ? 'animate-spin' : ''}`} />
            Recompute
          </button>
        </div>

        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{overview.healthy}</p>
                <p className="text-sm text-gray-500">Healthy</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{overview.degraded}</p>
                <p className="text-sm text-gray-500">Degraded</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{overview.critical}</p>
                <p className="text-sm text-gray-500">Critical</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{overview.monitoredCis}</p>
                <p className="text-sm text-gray-500">Monitored CIs</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{overview.firingAlerts}</p>
                <p className="text-sm text-gray-500">Firing Alerts</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Criticality</th>
                <th className="px-4 py-3">Health Score</th>
                <th className="px-4 py-3">CIs</th>
                <th className="px-4 py-3">Firing Alerts</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(svc => (
                <tr key={svc._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{svc.name}</td>
                  <td className="px-4 py-3">{svc.serviceType}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CRITICALITY_BADGES[svc.criticality] || 'bg-gray-100 text-gray-600'}`}>
                      {svc.criticality}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBarColor(svc.healthScore)}`} style={{ width: `${Math.min(Math.max(svc.healthScore, 0), 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium">{svc.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{svc.ciCount}</td>
                  <td className="px-4 py-3 text-center">{svc.firingAlertCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[svc.status] || 'bg-gray-100 text-gray-600'}`}>
                      {svc.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    <AlertTriangle className="h-5 w-5 inline mr-2" />No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleGuard>
  );
}

export default ServiceHealthPage;
