import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import api from '@shared/lib/api';

interface Outage { _id: string; title: string; status: string; severity: string; startedAt: string; resolvedAt: string; timeline: Array<{status: string; message: string; createdAt: string}>; impact: string; rootCause: string; }

export default function OutageTracking() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Outage | null>(null);
  const [form, setForm] = useState({ title: '', description: '', severity: 'minor', impact: '' });
  const [timelineMsg, setTimelineMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => { try { const { data } = await api.get('/extra/outages'); setOutages(data); } catch {} };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/extra/outages', form); setShowForm(false); setForm({ title: '', description: '', severity: 'minor', impact: '' }); load(); } catch {}
  };

  const handleTimeline = async (id: string) => {
    if (!timelineMsg.trim()) return;
    try { await api.post(`/extra/outages/${id}/timeline`, { status: selected?.status, message: timelineMsg }); setTimelineMsg(''); load(); const { data } = await api.get('/extra/outages'); setSelected(data.find((o: Outage) => o._id === id) || null); } catch {}
  };

  const handleUpdate = async (id: string, status: string) => {
    try { await api.put(`/extra/outages/${id}`, { status, resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined }); load(); } catch {}
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'investigating': return 'bg-yellow-100 text-yellow-700';
      case 'identified': return 'bg-orange-100 text-orange-700';
      case 'monitoring': return 'bg-blue-100 text-blue-700';
      case 'resolved': case 'closed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const sevColor = (s: string) => {
    switch (s) { case 'critical': return 'bg-red-100 text-red-700'; case 'major': return 'bg-orange-100 text-orange-700'; default: return 'bg-yellow-100 text-yellow-700'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6" /> Service Outage Tracking</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Report Outage</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Outage Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2" required />
            <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="border rounded-lg px-3 py-2">
              <option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
            </select>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border rounded-lg px-3 py-2 w-full h-20" />
          <input placeholder="Impact" value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} className="border rounded-lg px-3 py-2 w-full" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {outages.map(o => (
            <div key={o._id} className={`bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${selected?._id === o._id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelected(o)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{o.title}</h3>
                  <p className="text-sm text-gray-500">Started {new Date(o.startedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${sevColor(o.severity)}`}>{o.severity}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                </div>
              </div>
              {o.timeline?.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">{o.timeline.length} updates</div>
              )}
            </div>
          ))}
        </div>
        {selected && (
          <div className="w-96 bg-white rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${statusColor(selected.status)}`}>{selected.status}</span></div>
              {selected.impact && <div><span className="text-gray-500">Impact:</span> {selected.impact}</div>}
              {selected.rootCause && <div><span className="text-gray-500">Root Cause:</span> {selected.rootCause}</div>}
            </div>
            <div className="flex gap-1 flex-wrap">
              {['investigating','identified','monitoring','resolved','closed'].map(s => (
                <button key={s} onClick={() => handleUpdate(selected._id, s)} className={`text-xs px-2 py-1 rounded ${selected.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{s}</button>
              ))}
            </div>
            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Timeline</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selected.timeline?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((t,i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Clock className="h-3 w-3 mt-0.5 text-gray-400" />
                    <div><span className={`px-1 rounded ${statusColor(t.status)}`}>{t.status}</span> {t.message} <span className="text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</span></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input placeholder="Add update..." value={timelineMsg} onChange={e => setTimelineMsg(e.target.value)} className="border rounded px-2 py-1 text-sm flex-1" />
                <button onClick={() => handleTimeline(selected._id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
