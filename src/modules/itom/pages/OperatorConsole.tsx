import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage } from '@shared/components/EntityPage';
import { Activity, Server, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@shared/components/RecordTable';
import { Link } from 'react-router-dom';

export default function OperatorConsole() {
  const { data: cisData } = useGetRecordsQuery({ entity: 'ci', limit: 20 });
  const { data: alertsData } = useGetRecordsQuery({ entity: 'alert', limit: 20 });
  const { data: resourcesData } = useGetRecordsQuery({ entity: 'resource', limit: 20 });
  const cis = cisData?.records || [];
  const alerts = alertsData?.records || [];
  const resources = resourcesData?.records || [];

  // Calculate health counts
  const activeAlerts = alerts.filter((a: any) => !['resolved', 'closed'].includes(a.status));
  const criticalCIs = cis.filter((c: any) => c.criticality === 'critical');
  const degradedResources = resources.filter((r: any) => r.status === 'degraded' || r.status === 'down');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" /> Operator Console</h1>

      {/* Health KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Active Alerts</p>
          <p className="text-3xl font-bold text-red-600">{activeAlerts.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Critical CIs</p>
          <p className="text-3xl font-bold text-orange-600">{criticalCIs.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Degraded Services</p>
          <p className="text-3xl font-bold text-yellow-600">{degradedResources.length}</p>
        </div>
      </div>

      {/* Service Map summary + link */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><Server className="h-4 w-4" /> Service Topology</h3>
          <Link to="/service-map" className="text-xs text-brand-600 hover:underline">Open full map →</Link>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cis.slice(0, 8).map((ci: any) => (
            <div key={ci._id} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm">
              <span className="font-medium">{ci.name}</span>
              <StatusBadge status={ci.status || 'operational'} />
            </div>
          ))}
          {!cis.length && <p className="text-sm text-gray-400">No CIs registered</p>}
        </div>
      </div>

      {/* Alert timeline */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4" /> Alert Timeline (last 24h)</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.slice(0, 10).map((a: any) => (
            <div key={a._id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
              <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
              <StatusBadge status={a.severity || 'medium'} />
              <span className="text-sm truncate">{a.title || a.type}</span>
            </div>
          ))}
          {!alerts.length && <p className="text-sm text-gray-400">No alerts — system healthy</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/incidents" className="btn-primary text-xs">Create Incident from Alert</Link>
            <Link to="/kb" className="btn-secondary text-xs">Search Knowledge</Link>
            <Link to="/discovery-schedules" className="btn-secondary text-xs">Run Discovery</Link>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Link to Detail</h3>
          <p className="text-xs text-gray-500">Click any CI or alert title in the sections above. Detail drawers open on every related entity page via the generic CRUD system.</p>
        </div>
      </div>
    </div>
  );
}
