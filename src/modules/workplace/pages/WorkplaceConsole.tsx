import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface Building { _id: string; name: string; address?: string; }
interface Space {
  _id: string;
  name: string;
  buildingId: string | { _id: string; name: string };
  spaceType: string;
  capacity: number;
  accessibility: boolean;
}
interface Reservation {
  _id: string;
  spaceId: string | { _id: string; name: string };
  date: string;
  startSlot: string;
  endSlot: string;
  status: string;
  bookedBy?: { name: string };
}
interface Visitor {
  _id: string;
  fullName: string;
  company: string;
  visitDate: string;
  purpose: string;
  status: string;
}
interface WorkplaceCase {
  _id: string;
  title: string;
  caseType: string;
  priority: string;
  status: string;
}

const SPACE_TYPES = ['desk', 'room', 'parking', 'locker', 'amenity'];
const CASE_TYPES = ['maintenance', 'cleaning', 'inspection', 'health_safety', 'catering', 'security', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
type Tab = 'spaces' | 'reservations' | 'visitors' | 'cases' | 'utilisation';

export default function WorkplaceConsole() {
  const [tab, setTab] = useState<Tab>('spaces');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cases, setCases] = useState<WorkplaceCase[]>([]);
  const [utilisation, setUtilisation] = useState<Record<string, number> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [buildingForm, setBuildingForm] = useState({ name: '', address: '' });

  useEffect(() => { load(); }, [tab]);

  const loadBuildings = async () => {
    try { const { data } = await api.get('/em/workplace/buildings'); setBuildings(data); } catch {}
  };

  const load = async () => {
    try {
      await loadBuildings();
      if (tab === 'spaces') { const { data } = await api.get('/em/workplace/spaces'); setSpaces(data); }
      if (tab === 'reservations') { const { data } = await api.get('/em/workplace/reservations'); setReservations(data); }
      if (tab === 'visitors') { const { data } = await api.get('/em/workplace/visitors'); setVisitors(data); }
      if (tab === 'cases') { const { data } = await api.get('/em/workplace/cases'); setCases(data); }
      if (tab === 'utilisation') { const { data } = await api.get('/em/workplace/utilisation'); setUtilisation(data); }
    } catch {}
  };

  const createBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/workplace/buildings', buildingForm);
      setBuildingForm({ name: '', address: '' });
      loadBuildings();
    } catch {}
  };

  const submit = (url: string) => async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(url, form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const checkinReservation = async (id: string) => {
    try { await api.post(`/em/workplace/reservations/${id}/checkin`); load(); } catch {}
  };

  const checkinVisitor = async (id: string) => {
    try { await api.post(`/em/workplace/visitors/${id}/checkin`); load(); } catch {}
  };

  const spaceName = (s: Reservation['spaceId']) => typeof s === 'object' && s !== null ? s.name : spaces.find(x => x._id === s)?.name || String(s ?? '');
  const priorityBadge = (p: string) => {
    const cls = p === 'urgent' ? 'bg-red-100 text-red-700'
      : p === 'high' ? 'bg-orange-100 text-orange-700'
      : p === 'medium' ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-600';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{p}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6" /> Workplace</h1>
        {tab !== 'utilisation' && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        )}
      </div>

      {buildings.length === 0 && (
        <form onSubmit={createBuilding} className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
          <p className="text-sm text-blue-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> No buildings yet — add your first building to get started.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Building name" value={buildingForm.name} onChange={e => setBuildingForm({ ...buildingForm, name: e.target.value })} className="border rounded-lg px-3 py-2 bg-white" required />
            <input placeholder="Address" value={buildingForm.address} onChange={e => setBuildingForm({ ...buildingForm, address: e.target.value })} className="border rounded-lg px-3 py-2 bg-white md:col-span-2" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add Building</button>
        </form>
      )}

      <div className="flex gap-1 border-b overflow-x-auto">
        {(['spaces', 'reservations', 'visitors', 'cases', 'utilisation'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'spaces' && (
        <form onSubmit={submit('/em/workplace/spaces')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            <input placeholder="Space name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.buildingId || ''} onChange={e => setForm({ ...form, buildingId: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Building</option>
              {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            <select value={form.spaceType || ''} onChange={e => setForm({ ...form, spaceType: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Space Type</option>
              {SPACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min={0} placeholder="Capacity" value={form.capacity ?? ''} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="border rounded-lg px-3 py-2" />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={!!form.accessibility} onChange={e => setForm({ ...form, accessibility: e.target.checked })} /> Accessibility
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Space</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'reservations' && (
        <form onSubmit={submit('/em/workplace/reservations')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={form.spaceId || ''} onChange={e => setForm({ ...form, spaceId: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Space</option>
              {spaces.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="time" placeholder="Start slot" value={form.startSlot || ''} onChange={e => setForm({ ...form, startSlot: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="time" placeholder="End slot" value={form.endSlot || ''} onChange={e => setForm({ ...form, endSlot: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Reserve</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'visitors' && (
        <form onSubmit={submit('/em/workplace/visitors')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Full name" value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Company" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="date" value={form.visitDate || ''} onChange={e => setForm({ ...form, visitDate: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Purpose" value={form.purpose || ''} onChange={e => setForm({ ...form, purpose: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Register Visitor</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'cases' && (
        <form onSubmit={submit('/em/workplace/cases')} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.caseType || ''} onChange={e => setForm({ ...form, caseType: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Case Type</option>
              {CASE_TYPES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <select value={form.priority || ''} onChange={e => setForm({ ...form, priority: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Open Case</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'spaces' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Building</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Accessibility</th>
              </tr>
            </thead>
            <tbody>
              {spaces.map(s => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{typeof s.buildingId === 'object' ? s.buildingId?.name : buildings.find(b => b._id === s.buildingId)?.name || '-'}</td>
                  <td className="px-4 py-3 capitalize">{s.spaceType}</td>
                  <td className="px-4 py-3">{s.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${s.accessibility ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="h-4 w-4" /> {s.accessibility ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
              {spaces.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No spaces created yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Space</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Booked By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{spaceName(r.spaceId)}</td>
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.startSlot} – {r.endSlot}</td>
                  <td className="px-4 py-3">{r.bookedBy?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${r.status === 'checked_in' ? 'text-green-600' : 'text-gray-600'}`}>
                      {r.status === 'checked_in' && <CheckCircle className="h-4 w-4" />} {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status !== 'checked_in' && r.status !== 'cancelled' && (
                      <button onClick={() => checkinReservation(r._id)} className="text-blue-600 hover:underline">Check-in</button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No reservations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'visitors' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Visit Date</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.fullName}</td>
                  <td className="px-4 py-3">{v.company}</td>
                  <td className="px-4 py-3">{new Date(v.visitDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">{v.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${v.status === 'checked_in' ? 'text-green-600' : 'text-gray-600'}`}>
                      {v.status === 'checked_in' && <CheckCircle className="h-4 w-4" />} {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.status !== 'checked_in' && (
                      <button onClick={() => checkinVisitor(v._id)} className="text-blue-600 hover:underline">Check-in</button>
                    )}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No visitors expected</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'cases' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 capitalize">{(c.caseType || '').replace('_', ' ')}</td>
                  <td className="px-4 py-3">{priorityBadge(c.priority)}</td>
                  <td className="px-4 py-3">{c.status}</td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400"><CheckCircle className="h-5 w-5 inline mr-2" />No open workplace cases</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'utilisation' && utilisation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(utilisation)
            .filter(([, v]) => typeof v === 'number')
            .slice(0, 3)
            .map(([k, v]) => (
              <div key={k} className="bg-white p-6 rounded-lg border flex items-center gap-4">
                <Activity className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-3xl font-bold text-gray-800">{typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(1) : String(v)}</p>
                  <p className="text-sm text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
