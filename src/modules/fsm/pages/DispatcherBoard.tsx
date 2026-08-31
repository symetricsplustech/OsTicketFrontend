import { useGetDispatcherBoardQuery, useRouteSequenceMutation, useGeofenceCheckinMutation, useConsumePartMutation, useGetFtfRateQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { MapPinned, Send, XCircle, CheckCircle } from 'lucide-react';

interface Stop { lat: number; lng: number; label: string }
interface WorkOrder {
  _id: string;
  number?: string;
  status?: string;
  scheduledDate?: string;
  priority?: string;
}

export default function DispatcherBoard() {
  const { data, isLoading } = useGetDispatcherBoardQuery();
  const [routeSequence] = useRouteSequenceMutation();
  const [geofenceCheckin] = useGeofenceCheckinMutation();
  const [consumePart] = useConsumePartMutation();
  const { data: ftf } = useGetFtfRateQuery();

  const [stopsText, setStopsText] = useState('[{"lat":12.97,"lng":77.59,"label":"Site A"}]');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [checkin, setCheckin] = useState({ woId: '', lat: '', lng: '' });
  const [part, setPart] = useState({ woId: '', productId: '', qty: '1' });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 3000); };

  const handleRoute = async () => {
    setErr(null); setOk(null); setRouteResult(null);
    try {
      const stops: Stop[] = JSON.parse(stopsText);
      const res = await routeSequence({ stops }).unwrap();
      setRouteResult(res);
      flash('Route computed');
    } catch (e: any) {
      setErr(e instanceof SyntaxError ? 'Invalid stops JSON' : (e?.data?.message || 'Failed to compute route'));
    }
  };

  const handleCheckin = async () => {
    setErr(null); setOk(null);
    try {
      await geofenceCheckin({ id: checkin.woId, lat: Number(checkin.lat), lng: Number(checkin.lng) }).unwrap();
      flash('Technician checked in');
    } catch (e: any) { setErr(e?.data?.message || 'Check-in failed'); }
  };

  const handleConsume = async () => {
    setErr(null); setOk(null);
    try {
      await consumePart({ id: part.woId, productId: part.productId, qty: Number(part.qty) }).unwrap();
      flash('Part consumed');
    } catch (e: any) { setErr(e?.data?.message || 'Failed to consume part'); }
  };

  if (isLoading) return <div className="p-6 text-gray-500">Loading dispatcher board...</div>;

  const columns: any[] = data?.columns || [];
  const wos: WorkOrder[] = data?.workOrders || data?.items || [];
  const technicians: any[] = data?.technicians || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MapPinned className="h-6 w-6" /> Dispatcher Board</h1>
        {(err || ok) && (
          err ? (
            <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> {err}</div>
          ) : (
            <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {ok}</div>
          )
        )}
      </div>

      {/* Tools row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Route sequence */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Route Sequence</h2>
          <textarea rows={4} value={stopsText} onChange={(e) => setStopsText(e.target.value)} className="w-full input-field font-mono text-xs" />
          <button onClick={handleRoute} className="btn-primary inline-flex items-center gap-2"><Send className="h-4 w-4" /> Optimize Route</button>
          {routeResult && (() => {
            const ordered: any[] = routeResult.stops || routeResult.route || routeResult.orderedStops || [];
            const totalKm = routeResult.totalKm ?? routeResult.distanceKm ?? routeResult.totalKm ?? 0;
            return (
              <div className="rounded-lg bg-gray-50 border p-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Total distance: <span className="font-semibold">{totalKm} km</span></p>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {ordered.map((s: any, i: number) => (
                    <li key={i}>
                      {s.label || `Stop ${i + 1}`}
                      {s.eta != null && <span className="text-gray-500"> · ETA {s.eta}{typeof s.eta === 'number' ? ' min' : ''}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}
        </div>

        {/* Geofence check-in */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Geofence Check-in</h2>
          <input type="text" placeholder="Work Order ID" value={checkin.woId} onChange={(e) => setCheckin({ ...checkin, woId: e.target.value })} className="input-field" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Lat" value={checkin.lat} onChange={(e) => setCheckin({ ...checkin, lat: e.target.value })} className="input-field" />
            <input type="text" placeholder="Lng" value={checkin.lng} onChange={(e) => setCheckin({ ...checkin, lng: e.target.value })} className="input-field" />
          </div>
          <button onClick={handleCheckin} disabled={!checkin.woId || !checkin.lat || !checkin.lng} className="btn-primary disabled:opacity-50">Check In</button>
        </div>

        {/* Consume part + FTF */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Consume Part</h2>
          <input type="text" placeholder="Work Order ID" value={part.woId} onChange={(e) => setPart({ ...part, woId: e.target.value })} className="input-field" />
          <input type="text" placeholder="Product ID" value={part.productId} onChange={(e) => setPart({ ...part, productId: e.target.value })} className="input-field" />
          <input type="number" min={1} placeholder="Qty" value={part.qty} onChange={(e) => setPart({ ...part, qty: e.target.value })} className="input-field" />
          <button onClick={handleConsume} disabled={!part.woId || !part.productId} className="btn-primary disabled:opacity-50">Consume</button>
          {ftf && (
            <div className="pt-3 mt-1 border-t">
              <p className="text-xs uppercase tracking-wide text-gray-500">First-Time-Fix Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{(ftf as any).rate ?? (ftf as any).ftfRate ?? JSON.stringify(ftf)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kanban + technicians */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col: any) => {
            const keyName = col.key || col.status || col._id || '';
            const colWos = wos.filter((w) => (w.status || '').toLowerCase().includes(String(keyName).toLowerCase()));
            return (
              <div key={keyName} className="bg-gray-100 rounded-xl p-3 space-y-3">
                <p className="text-sm font-semibold text-gray-700 px-1">
                  {col.name || col.title || String(keyName)} <span className="text-gray-400">({colWos.length})</span>
                </p>
                {colWos.map((w) => (
                  <div key={w._id} className="card p-3 space-y-1 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{w.number || w._id}</p>
                    <p className="text-xs text-gray-500">{w.scheduledDate ? new Date(w.scheduledDate).toLocaleString() : 'Unscheduled'}</p>
                    {w.priority && (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        w.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        w.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        w.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
                      }`}>{w.priority}</span>
                    )}
                  </div>
                ))}
                {!colWos.length && <p className="text-xs text-gray-400 px-1 py-2">Empty</p>}
              </div>
            );
          })}
          {!columns.length && <p className="text-sm text-gray-500">No columns returned.</p>}
        </div>

        {/* Technicians sidebar */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-3">Technicians</h2>
          <ul className="space-y-3">
            {technicians.map((t: any) => {
              const slots = t.slotCount ?? t.slots ?? (t.slotsAvailable != null ? `${t.slotsAvailable}/${t.slotsTotal}` : 0);
              return (
                <li key={t._id || t.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800">{t.name || t.email || t._id}</span>
                  <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium">{slots} slots</span>
                </li>
              );
            })}
            {!technicians.length && <li className="text-sm text-gray-500">No technicians.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
