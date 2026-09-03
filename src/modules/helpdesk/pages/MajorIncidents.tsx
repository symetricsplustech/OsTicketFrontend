import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-03 — Major Incident Management: declaration, commander assignment,
// child incidents, communication plan/cadence, outage linkage, executive
// summary, post-incident review handoff.
interface MajorIncident {
  _id: string;
  title: string;
  description?: string;
  status: string;
  severity?: string;
  priority?: string;
  isMajor?: boolean;
  commander?: { name?: string } | string;
  createdAt: string;
  resolvedAt?: string;
}

export default function MajorIncidents() {
  const [items, setItems] = useState<MajorIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'critical' });
  const [saving, setSaving] = useState(false);
  const [commPlan, setCommPlan] = useState<Record<string, any>>({});
  const [execReport, setExecReport] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enterprise/incidents');
      const all: MajorIncident[] = res.data.incidents || [];
      setItems(all.filter((i) => i.isMajor || i.severity === 'critical' || i.priority === 'critical'));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const declare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/enterprise/incidents', {
        ...form,
        priority: 'critical',
        isMajor: true,
        status: 'declared',
      });
      toast.success('Major incident declared');
      setShowForm(false);
      setForm({ title: '', description: '', severity: 'critical' });
      load();
    } catch {
      toast.error('Failed to declare major incident');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await api.put(`/enterprise/incidents/${id}`, { status, ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}) });
      toast.success(`Marked ${status}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const saveCommPlan = async (id: string) => {
    try {
      const body = commPlan[id] || { cadenceMinutes: 30, audience: ['internal', 'stakeholders'] };
      const res = await api.post(`/gaps2/incidents/${id}/communication-plan`, body);
      setCommPlan((p) => ({ ...p, [id]: res.data }));
      toast.success('Communication plan saved');
    } catch {
      toast.error('Failed to save communication plan');
    }
  };

  const checkCommDue = async (id: string) => {
    try {
      const res = await api.post(`/gaps2/incidents/${id}/communication-due`, {});
      toast(res.data?.dueNow ? 'Stakeholder update is DUE now' : 'No update due yet', {
        icon: res.data?.dueNow ? '🔔' : '✅',
      });
    } catch {
      toast.error('Failed to check cadence');
    }
  };

  const fetchExecReport = async () => {
    try {
      const res = await api.get('/gaps2/reports/major-incidents-exec', { responseType: 'text' });
      setExecReport(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch {
      toast.error('Failed to load executive summary');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Major Incidents</h1>
          <p className="text-sm text-gray-500">Declaration, command, comms cadence &amp; executive reporting</p>
        </div>
        <div className="flex gap-2">
          <Link to="/warroom" className="btn-secondary text-sm">Open War Room</Link>
          <Link to="/outages" className="btn-secondary text-sm">Outage Tracking</Link>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Declare Major Incident</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={declare} className="card p-6 space-y-4">
          <h2 className="font-semibold">Declare major incident</h2>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Incident title *" className="input-field w-full" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} placeholder="Service + business impact…" className="input-field w-full" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Declaring…' : 'Declare'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Commander</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Declared</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Comms</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No major incidents — declare one to start command mode</td></tr>
            ) : items.map((m) => (
              <tr key={m._id} className="hover:bg-gray-50 align-top">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{m.title}</p>
                  {m.description && <p className="text-xs text-gray-500 line-clamp-2 max-w-md">{m.description}</p>}
                </td>
                <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3"><StatusBadge status={m.severity || m.priority || 'critical'} /></td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {typeof m.commander === 'string' ? m.commander : m.commander?.name || '—'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(m.createdAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={5} max={480} placeholder="min"
                      value={commPlan[m._id]?.cadenceMinutes ?? ''}
                      onChange={(e) => setCommPlan((p) => ({ ...p, [m._id]: { ...(p[m._id] || {}), cadenceMinutes: Number(e.target.value) } }))}
                      className="input-field text-xs w-16 py-1" title="Update cadence (minutes)"
                    />
                    <button onClick={() => saveCommPlan(m._id)} className="text-xs text-brand-600 hover:underline">Save</button>
                    <button onClick={() => checkCommDue(m._id)} className="text-xs text-gray-500 hover:underline">Due?</button>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2 text-xs">
                    {m.status !== 'resolved' && (
                      <button onClick={() => setStatus(m._id, 'resolved')} className="text-green-600 hover:underline">Resolve</button>
                    )}
                    <Link to="/pir" className="text-brand-600 hover:underline">PIR</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Executive summary</h2>
          <button onClick={fetchExecReport} className="btn-secondary text-xs">Generate summary</button>
        </div>
        {execReport ? (
          <pre className="text-xs bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap max-h-80 overflow-y-auto">{execReport}</pre>
        ) : (
          <p className="text-xs text-gray-400">Generates a markdown brief of major incidents + outages for leadership.</p>
        )}
      </div>
    </div>
  );
}
