import { useState, useEffect } from 'react';
import { FileText, Plus, Play, Pause, Clock, Mail } from 'lucide-react';
import api from '@shared/lib/api';

interface ScheduledReport {
  _id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  schedule: { frequency: string; time: string; dayOfWeek?: number; dayOfMonth?: number };
  recipients: Array<{ email: string }>;
  status: string;
  lastRunAt: string;
  nextRunAt: string;
  runCount: number;
}

export default function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', type: 'tickets', format: 'csv',
    schedule: { frequency: 'weekly', time: '09:00', dayOfWeek: 1, dayOfMonth: 1 },
    recipients: [] as Array<{ email: string }>,
  });
  const [email, setEmail] = useState('');

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try { const { data } = await api.get('/platform/scheduled-reports'); setReports(data); } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/platform/scheduled-reports', form); setShowForm(false); loadReports(); } catch {}
  };

  const handleRun = async (id: string) => {
    try { await api.post(`/platform/scheduled-reports/${id}/run`); loadReports(); } catch {}
  };

  const addRecipient = () => {
    if (email && !form.recipients.find(r => r.email === email)) {
      setForm({ ...form, recipients: [...form.recipients, { email }] });
      setEmail('');
    }
  };

  const frequencyLabel = (f: string) => {
    switch (f) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return f;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Scheduled Reports</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Schedule Report
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Report Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="tickets">Tickets</option><option value="crm">CRM</option><option value="analytics">Analytics</option><option value="hr">HR</option><option value="projects">Projects</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="csv">CSV</option><option value="excel">Excel</option><option value="pdf">PDF</option>
            </select>
            <select value={form.schedule.frequency} onChange={e => setForm({ ...form, schedule: { ...form.schedule, frequency: e.target.value } })} className="border rounded-lg px-3 py-2">
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={form.schedule.time} onChange={e => setForm({ ...form, schedule: { ...form.schedule, time: e.target.value } })} className="border rounded-lg px-3 py-2" />
            {form.schedule.frequency === 'weekly' && (
              <select value={form.schedule.dayOfWeek} onChange={e => setForm({ ...form, schedule: { ...form.schedule, dayOfWeek: +e.target.value } })} className="border rounded-lg px-3 py-2">
                <option value={0}>Sunday</option><option value={1}>Monday</option><option value={2}>Tuesday</option><option value={3}>Wednesday</option><option value={4}>Thursday</option><option value={5}>Friday</option><option value={6}>Saturday</option>
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="email" placeholder="Add recipient email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded-lg px-3 py-2 flex-1" />
            <button type="button" onClick={addRecipient} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">Add</button>
          </div>
          {form.recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.recipients.map((r, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm flex items-center gap-1">
                  {r.email}
                  <button type="button" onClick={() => setForm({ ...form, recipients: form.recipients.filter((_, j) => j !== i) })} className="text-blue-400 hover:text-blue-600">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Schedule</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Report</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Schedule</th>
              <th className="text-left px-4 py-3 font-medium">Format</th>
              <th className="text-left px-4 py-3 font-medium">Recipients</th>
              <th className="text-left px-4 py-3 font-medium">Last Run</th>
              <th className="text-left px-4 py-3 font-medium">Runs</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                </td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{r.type}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {frequencyLabel(r.schedule.frequency)} at {r.schedule.time}</div></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{r.format}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {r.recipients?.length || 0}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.lastRunAt ? new Date(r.lastRunAt).toLocaleString() : 'Never'}</td>
                <td className="px-4 py-3 text-sm">{r.runCount}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => handleRun(r._id)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded flex items-center gap-1">
                    <Play className="h-3 w-3" /> Run Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
