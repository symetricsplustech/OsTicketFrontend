import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Network, Server, Activity } from 'lucide-react';

interface MapResource {
  _id: string;
  name: string;
  type: string;
  status: string;
  environment?: string;
  ipAddress?: string;
  metrics?: { cpu?: number; memory?: number; disk?: number };
  dependencies?: string[];
}

const statusFill = (s: string) =>
  s === 'active' || s === 'healthy'
    ? '#22c55e'
    : s === 'degraded'
    ? '#eab308'
    : s === 'down'
    ? '#ef4444'
    : '#9ca3af';

const statusChip = (s: string) =>
  s === 'active' || s === 'healthy'
    ? 'bg-green-100 text-green-700'
    : s === 'degraded'
    ? 'bg-yellow-100 text-yellow-700'
    : s === 'down'
    ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-700';

export default function ServiceMap() {
  const [resources, setResources] = useState<MapResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapResource | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/itom/resources');
        setResources(res.data.resources || []);
      } catch {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = resources.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const rows = Math.max(1, Math.ceil(total / cols));
  const cellW = (800 - 80) / cols;
  const cellH = (500 - 110) / rows;
  const posOf = (i: number) => ({ x: 40 + (i % cols) * cellW + cellW / 2, y: 50 + Math.floor(i / cols) * cellH + cellH / 2 });

  const indexById: Record<string, number> = {};
  resources.forEach((r, i) => { indexById[r._id] = i; });
  const edges: { from: number; to: number }[] = [];
  resources.forEach((r, i) => {
    (r.dependencies || []).forEach((d) => {
      const j = indexById[String(d)];
      if (j !== undefined && j !== i) edges.push({ from: i, to: j });
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Network className="h-6 w-6 text-brand-500" />Service Map</h1>
        <p className="text-sm text-gray-500">{total} resources · {edges.length} dependencies</p>
      </div>

      <div className="flex gap-4">
        <div className="card flex-1 min-w-0 p-4">
          {loading ? (
            <p className="text-center py-20 text-gray-500">Loading map...</p>
          ) : total === 0 ? (
            <p className="text-center py-20 text-gray-500"><Server className="inline h-5 w-5 mr-1" />No resources to map</p>
          ) : (
            <svg viewBox="0 0 800 500" className="w-full">
              {edges.map((e, i) => {
                const a = posOf(e.from);
                const b = posOf(e.to);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />;
              })}
              {resources.map((r, i) => {
                const p = posOf(i);
                const isSel = selected?._id === r._id;
                return (
                  <g key={r._id} onClick={() => setSelected(r)} className="cursor-pointer">
                    <circle cx={p.x} cy={p.y} r={isSel ? 26 : 21} fill={statusFill(r.status)} fillOpacity={0.85} stroke={isSel ? '#1e293b' : '#ffffff'} strokeWidth={isSel ? 3 : 2} />
                    <text x={p.x} y={p.y + 36} textAnchor="middle" fontSize={10} fill="#374151">{r.name.length > 14 ? `${r.name.slice(0, 13)}…` : r.name}</text>
                  </g>
                );
              })}
            </svg>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-500" />Active / Healthy</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-yellow-500" />Degraded</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500" />Down</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gray-400" />Other</span>
            <span className="flex items-center gap-1.5"><svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" /></svg>Dependency edge</span>
          </div>
        </div>

        <aside className="w-72 shrink-0">
          {selected ? (
            <div className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 break-all">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">Close</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${statusChip(selected.status)}`}>{selected.status}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{selected.type}</span>
              </div>
              {selected.environment && <p className="text-sm text-gray-600">Environment: {selected.environment}</p>}
              {selected.ipAddress && <p className="text-sm text-gray-600">IP: {selected.ipAddress}</p>}
              <p className="flex items-center gap-1 text-sm font-medium text-gray-700 pt-2"><Activity className="h-4 w-4 text-brand-500" />Metrics</p>
              {[['CPU', selected.metrics?.cpu], ['Memory', selected.metrics?.memory], ['Disk', selected.metrics?.disk]].map(([label, val]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{val != null ? `${val}%` : '—'}</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${Number(val ?? 0) > 90 ? 'bg-red-500' : Number(val ?? 0) > 75 ? 'bg-yellow-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(Number(val ?? 0), 100)}%` }} /></div>
                </div>
              ))}
              <p className="text-xs text-gray-500 pt-1">{(selected.dependencies || []).length} upstream dependencies</p>
            </div>
          ) : (
            <div className="card p-5 text-sm text-gray-500">Click a node to inspect its details.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
