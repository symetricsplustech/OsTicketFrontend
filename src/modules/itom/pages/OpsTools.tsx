import api from '@shared/lib/api';
import React, { useState } from 'react';
import { Play, Search, Gauge, FileText, BarChart3, Activity, Server, AlertTriangle } from 'lucide-react';

interface CorrelationGroup {
  _id: string;
  count?: number;
  size?: number;
  severity?: string;
  severities?: string[];
}

interface HotResource {
  _id: string;
  name: string;
  type?: string;
  metrics?: { cpu?: number; memory?: number; disk?: number };
}

interface CapacityData {
  cpuAvg?: number;
  memAvg?: number;
  diskAvg?: number;
  hotResources?: HotResource[];
}

interface AvailabilityData {
  availabilityPercent?: number;
  downtimeMinutes?: number;
  outageCount?: number;
}

const TABS = ['Correlate', 'Denoise', 'Discovery', 'Reports'] as const;
type Tab = (typeof TABS)[number];

const sevBadge = (s: string) =>
  s === 'critical' || s === 'emergency'
    ? 'bg-red-100 text-red-700'
    : s === 'warning'
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-blue-100 text-blue-700';

export default function OpsTools() {
  const [tab, setTab] = useState<Tab>('Correlate');
  const [groups, setGroups] = useState<CorrelationGroup[] | null>(null);
  const [correlating, setCorrelating] = useState(false);
  const [suppressedCount, setSuppressedCount] = useState<number | null>(null);
  const [denoising, setDenoising] = useState(false);
  const [subnet, setSubnet] = useState('10.0.0');
  const [newResources, setNewResources] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [capacity, setCapacity] = useState<CapacityData | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingReport, setLoadingReport] = useState('');

  const runCorrelate = async () => {
    setCorrelating(true);
    try {
      const res = await api.post('/ops/itom/correlate', { windowMinutes: 15 });
      setGroups(res.data.groups || []);
    } catch {
      setGroups([]);
    } finally {
      setCorrelating(false);
    }
  };

  const runDenoise = async () => {
    setDenoising(true);
    try {
      const res = await api.post('/ops/itom/denoise');
      setSuppressedCount(res.data.suppressedCount ?? 0);
    } catch {
      setSuppressedCount(null);
    } finally {
      setDenoising(false);
    }
  };

  const runScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    try {
      const res = await api.post('/ops/itom/discovery/scan', { subnet });
      setNewResources(res.data.newResources ?? 0);
    } catch {
      setNewResources(null);
    } finally {
      setScanning(false);
    }
  };

  const loadCapacity = async () => {
    setLoadingReport('capacity');
    try {
      const res = await api.get('/ops/itom/capacity');
      setCapacity(res.data.capacity || res.data);
    } catch {
      setCapacity(null);
    } finally {
      setLoadingReport('');
    }
  };

  const loadAvailability = async () => {
    setLoadingReport('availability');
    try {
      const res = await api.get('/ops/itom/availability?days=30');
      setAvailability(res.data.availability || res.data);
    } catch {
      setAvailability(null);
    } finally {
      setLoadingReport('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ITOM Operations Tools</h1>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Correlate' && (
        <div className="space-y-4">
          <button onClick={runCorrelate} disabled={correlating} className="btn-primary inline-flex items-center gap-2"><Play className="h-4 w-4" />{correlating ? 'Correlating...' : 'Run Correlation'}</button>
          {groups !== null && groups.length === 0 && <div className="card p-8 text-center text-gray-500">No alert groups found</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(groups || []).map((g) => (
              <div key={g._id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-yellow-500" />Alert Group</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{g.count ?? g.size ?? 1} alerts</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(g.severities && g.severities.length ? g.severities : g.severity ? [g.severity] : []).map((s, i) => (
                    <span key={i} className={`px-2 py-0.5 text-xs rounded-full ${sevBadge(s)}`}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Denoise' && (
        <div className="space-y-4">
          <button onClick={runDenoise} disabled={denoising} className="btn-primary inline-flex items-center gap-2"><Play className="h-4 w-4" />{denoising ? 'Denoising...' : 'Run Denoise'}</button>
          {suppressedCount !== null && (
            <div className="card p-4 flex items-center gap-3 border-l-4 border-green-500">
              <Gauge className="h-5 w-5 text-green-600" />
              <p className="text-sm text-gray-700">Denoise complete — <span className="font-semibold">{suppressedCount}</span> noisy alerts suppressed.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Discovery' && (
        <div className="space-y-4">
          <form onSubmit={runScan} className="card p-4 flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subnet</label>
              <input type="text" required value={subnet} onChange={(e) => setSubnet(e.target.value)} placeholder="10.0.0" className="mt-1 input-field w-48" />
            </div>
            <button type="submit" disabled={scanning} className="btn-primary inline-flex items-center gap-2"><Search className="h-4 w-4" />{scanning ? 'Scanning...' : 'Scan Subnet'}</button>
          </form>
          {newResources !== null && (
            <div className="card p-4 flex items-center gap-3 border-l-4 border-blue-500">
              <Server className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-gray-700">Scan finished — <span className="font-semibold">{newResources}</span> new resources discovered in {subnet}.x.x.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Reports' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button onClick={loadCapacity} disabled={loadingReport === 'capacity'} className="btn-secondary inline-flex items-center gap-2"><Gauge className="h-4 w-4" />{loadingReport === 'capacity' ? 'Loading...' : 'Capacity Report'}</button>
            <button onClick={loadAvailability} disabled={loadingReport === 'availability'} className="btn-secondary inline-flex items-center gap-2"><Activity className="h-4 w-4" />{loadingReport === 'availability' ? 'Loading...' : 'Availability Report (30 days)'}</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-semibold mb-4"><BarChart3 className="h-4 w-4 text-brand-500" />Capacity</h3>
              {capacity ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[['CPU Avg', capacity.cpuAvg], ['Mem Avg', capacity.memAvg], ['Disk Avg', capacity.diskAvg]].map(([label, val]) => (
                      <div key={String(label)} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-gray-900">{typeof val === 'number' ? `${val.toFixed(1)}%` : '—'}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Hot Resources</p>
                  {(capacity.hotResources || []).length === 0 ? (
                    <p className="text-sm text-gray-500">None above threshold</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {(capacity.hotResources || []).map((r) => (
                        <li key={r._id} className="py-2 flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2 truncate"><Server className="h-4 w-4 text-gray-400 shrink-0" /><span className="truncate">{r.name}</span><span className="text-xs text-gray-400 shrink-0">{r.type}</span></span>
                          <span className="text-xs text-red-600 font-medium shrink-0">{r.metrics?.cpu != null ? `CPU ${r.metrics.cpu}%` : ''}{r.metrics?.memory != null ? ` · Mem ${r.metrics.memory}%` : ''}{r.metrics?.disk != null ? ` · Disk ${r.metrics.disk}%` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500"><FileText className="inline h-4 w-4 mr-1" />Run the report to view capacity stats</p>
              )}
            </div>
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-semibold mb-4"><Activity className="h-4 w-4 text-brand-500" />Availability (last 30 days)</h3>
              {availability ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-green-600">{availability.availabilityPercent != null ? `${Number(availability.availabilityPercent).toFixed(2)}%` : '—'}</p><p className="text-xs text-gray-500">Availability</p></div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-gray-900">{availability.downtimeMinutes ?? '—'}</p><p className="text-xs text-gray-500">Downtime (min)</p></div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-gray-900">{availability.outageCount ?? '—'}</p><p className="text-xs text-gray-500">Outages</p></div>
                </div>
              ) : (
                <p className="text-sm text-gray-500"><FileText className="inline h-4 w-4 mr-1" />Run the report to view availability stats</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
