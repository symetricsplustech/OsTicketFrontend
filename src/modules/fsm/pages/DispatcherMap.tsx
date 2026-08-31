import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage } from '@shared/components/EntityPage';
import { MapPin, Truck, Navigation, AlertCircle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@shared/components/RecordTable';

export default function DispatcherMap() {
  const { data: assets } = useGetRecordsQuery({ entity: 'asset', limit: 50 });
  const { data: jobs } = useGetRecordsQuery({ entity: 'ticket', limit: 50 });

  const routed = (jobs?.records || []).filter((j: any) => j.assigned_to || j.priority !== 'low');
  const unassigned = routed.filter((j: any) => !j.assigned_to);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6" /> Dispatcher Console</h1>
      <p className="text-sm text-gray-500">Field service routing & van management</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Active Jobs</p>
          <p className="text-3xl font-bold">{routed.length}</p>
          <p className="text-sm text-gray-400 mt-1">of {jobs?.records?.length || 0}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Unassigned Jobs</p>
          <p className="text-3xl font-bold text-red-600">{unassigned.length}</p>
          <p className="text-sm text-gray-400 mt-1">need immediate dispatch</p>
        </div>
      </div>

      {/* Asset locations on map */}
      <div className="bg-white border rounded-lg p-4 h-96">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> Asset Locations</h3>
        {assets?.records?.length > 0 ? (
          assets.records.map((a: any) => (
            <div key={a._id} className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3 text-brand-600" />
              <span>{a.name} @ {a.location || 'unknown'}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No asset locations configured</p>
        )}
      </div>

      {/* Job queue */}
      <div className="bg-white border rounded-lg p-4 h-64 overflow-y-auto">
        <h3 className="font-semibold mb-3">Job Queue</h3>
        {jobs?.records?.map((j: any) => (
          <div key={j._id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
            <div>
              <span className="font-medium">{j.title || j.number || 'Job #' + j._id}</span>
              <span className="text-xs text-gray-400">({j.category} · {j.priority})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={j.status} />
              {j.assigned_to && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        {!jobs?.records?.length && <p className="text-sm text-gray-400">No active jobs</p>}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <button className="flex-1 bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <Truck className="h-5 w-5 text-brand-600 mb-2" /> New Job
        </button>
        <button className="flex-1 bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <Navigation className="h-5 w-5 text-green-500 mb-2" /> Scan Barcode
        </button>
        <button className="flex-1 bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <ShieldCheck className="h-5 w-5 text-green-500 mb-2" /> Allocate Resources
        </button>
      </div>
    </div>
  );
}