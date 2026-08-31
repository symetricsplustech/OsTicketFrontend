import { useGetFloorPlanQuery, useSaveFloorPlanMutation, useGetOccupancyLiveQuery, useIngestOccupancyMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { MapPin, Plus, CheckCircle } from 'lucide-react';

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface Placement {
  spaceId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name?: string;
}

export default function FloorPlanViewer() {
  const [buildingInput, setBuildingInput] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: plan, refetch: refetchPlan } = useGetFloorPlanQuery(buildingId || undefined, { skip: !loaded });
  const { data: occupancy, refetch: refetchOccupancy } = useGetOccupancyLiveQuery();

  const [saveFloorPlan] = useSaveFloorPlanMutation();
  const [ingestOccupancy] = useIngestOccupancyMutation();

  const spaces: any[] = plan?.spaces ?? [];
  const nameBySpaceId: Record<string, string> = {};
  spaces.forEach((s) => {
    const key = s.spaceId ?? s._id ?? s.id;
    if (key) nameBySpaceId[String(key)] = s.name || s.spaceName || '';
  });

  const placements: Placement[] = plan?.placements ?? plan?.spaces ?? [];

  const emptyForm = { spaceId: '', x: '0', y: '0', w: '80', h: '60' };
  const [placementForm, setPlacementForm] = useState(emptyForm);
  const [localPlacements, setLocalPlacements] = useState<Placement[]>([]);
  const allPlacements = localPlacements.length > 0 ? [...placements, ...localPlacements] : placements;

  const [occForm, setOccForm] = useState({ spaceId: '', count: '1', capacity: '10' });
  const [saveErr, setSaveErr] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [occErr, setOccErr] = useState('');
  const [occMsg, setOccMsg] = useState('');

  const loadPlan = () => {
    setBuildingId(buildingInput.trim());
    setLoaded(true);
    setLocalPlacements([]);
    setSaveMsg('');
    setSaveErr('');
  };

  const addPlacement = () => {
    if (!placementForm.spaceId.trim()) return;
    setLocalPlacements((prev) => [
      ...prev,
      {
        spaceId: placementForm.spaceId.trim(),
        x: Number(placementForm.x) || 0,
        y: Number(placementForm.y) || 0,
        w: Number(placementForm.w) || 40,
        h: Number(placementForm.h) || 40,
      },
    ]);
    setPlacementForm(emptyForm);
  };

  const savePlan = async () => {
    setSaveErr('');
    setSaveMsg('');
    try {
      await saveFloorPlan({ buildingId: buildingId || undefined, placements: allPlacements }).unwrap();
      setSaveMsg('Floor plan saved.');
      setLocalPlacements([]);
      refetchPlan();
    } catch (err: any) {
      setSaveErr(err?.data?.error || err?.data?.message || 'Failed to save floor plan.');
    }
  };

  const submitOcc = async (e: React.FormEvent) => {
    e.preventDefault();
    setOccErr('');
    setOccMsg('');
    try {
      await ingestOccupancy({
        spaceId: occForm.spaceId.trim(),
        count: Number(occForm.count) || 0,
        capacity: Number(occForm.capacity) || 0,
      }).unwrap();
      setOccMsg('Occupancy ingested.');
      setOccForm({ spaceId: '', count: '1', capacity: '10' });
      refetchOccupancy();
    } catch (err: any) {
      setOccErr(err?.data?.error || err?.data?.message || 'Failed to ingest occupancy.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Floor Plan Viewer</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Building ID"
            value={buildingInput}
            onChange={(e) => setBuildingInput(e.target.value)}
            className={inputCls}
          />
          <button onClick={loadPlan} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            Load
          </button>
        </div>

        {loaded && (
          <>
            <svg viewBox="0 0 600 400" className="w-full border border-gray-200 rounded-lg bg-gray-50">
              {allPlacements.length === 0 && (
                <text x="300" y="200" textAnchor="middle" className="fill-gray-400" fontSize="14">
                  No placements yet.
                </text>
              )}
              {allPlacements.map((p, i) => (
                <g key={`${p.spaceId}-${i}`}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill={`hsl(${(i * 47) % 360}, 65%, 82%)`}
                    stroke={`hsl(${(i * 47) % 360}, 55%, 45%)`}
                    rx="3"
                  />
                  {(p.name || nameBySpaceId[p.spaceId]) && (
                    <text
                      x={p.x + p.w / 2}
                      y={p.y + p.h / 2 + 4}
                      textAnchor="middle"
                      fontSize="11"
                      className="fill-gray-800"
                    >
                      {p.name || nameBySpaceId[p.spaceId]}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            <div className="flex flex-wrap items-end gap-2">
              <input
                placeholder="spaceId"
                value={placementForm.spaceId}
                onChange={(e) => setPlacementForm({ ...placementForm, spaceId: e.target.value })}
                className={inputCls}
              />
              {(['x', 'y', 'w', 'h'] as const).map((k) => (
                <input
                  key={k}
                  type="number"
                  placeholder={k}
                  value={placementForm[k]}
                  onChange={(e) => setPlacementForm({ ...placementForm, [k]: e.target.value })}
                  className={`${inputCls} w-20`}
                />
              ))}
              <button onClick={addPlacement} className="inline-flex items-center gap-1 px-3 py-2 border border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 text-sm font-medium">
                <Plus className="h-4 w-4" /> Add
              </button>
              <button onClick={savePlan} className="inline-flex items-center gap-1 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
                <CheckCircle className="h-4 w-4" /> Save Floor Plan
              </button>
            </div>
            {saveErr && <p className="text-sm text-red-600">{saveErr}</p>}
            {!saveErr && saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Live Occupancy</h2>
        {(occupancy ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No live occupancy data.</p>
        ) : (
          <div className="space-y-3">
            {(occupancy ?? []).map((o: any, i: number) => {
              const pct = Number(o.occupancyPct ?? o.pct ?? 0);
              return (
                <div key={o.spaceId ?? o.space ?? i}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{o.spaceName || o.space || o.spaceId || `Space ${i + 1}`}</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={submitOcc} className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-4">
          <input
            placeholder="spaceId"
            required
            value={occForm.spaceId}
            onChange={(e) => setOccForm({ ...occForm, spaceId: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="count"
            required
            value={occForm.count}
            onChange={(e) => setOccForm({ ...occForm, count: e.target.value })}
            className={`${inputCls} w-24`}
          />
          <input
            type="number"
            placeholder="capacity"
            required
            value={occForm.capacity}
            onChange={(e) => setOccForm({ ...occForm, capacity: e.target.value })}
            className={`${inputCls} w-28`}
          />
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            Ingest
          </button>
          {occErr && <p className="text-sm text-red-600">{occErr}</p>}
          {!occErr && occMsg && <p className="text-sm text-green-600">{occMsg}</p>}
        </form>
      </div>
    </div>
  );
}
