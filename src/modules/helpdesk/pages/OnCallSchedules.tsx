import { useState, useEffect } from 'react';
import { Users, Plus, Calendar, ArrowUp } from 'lucide-react';
import ConfirmModal from '@shared/components/ConfirmModal';
import api from '@shared/lib/api';

interface OnCallSchedule {
  _id: string;
  name: string;
  description: string;
  status: string;
  schedule: string;
  timezone: string;
  rotations: Array<{
    agent: { name: string; email: string };
    startDate: string;
    endDate: string;
    order: number;
  }>;
  escalation: Array<{
    order: number;
    agent: { name: string; email: string };
    delayMinutes: number;
    notifyMethod: string;
  }>;
}

export default function OnCallSchedules() {
  const [schedules, setSchedules] = useState<OnCallSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
   const [form, setForm] = useState({ name: '', description: '', schedule: 'weekly', timezone: 'UTC' });
   const [modal, setModal] = useState<{open: boolean; title: string; message: string}>({open: false, title: '', message: ''});

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    try { const { data } = await api.get('/platform/oncall'); setSchedules(data); } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/platform/oncall', form); setShowForm(false); setForm({ name: '', description: '', schedule: 'weekly', timezone: 'UTC' }); loadSchedules(); } catch {}
  };

  const handleEscalate = async (id: string) => {
    try {
       const { data } = await api.post(`/platform/oncall/${id}/escalate`);
       setModal({open: true, title: 'On-Call Updated', message: `Current on-call: ${data.currentOnCall?.name || 'None'}`});
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> On-Call Schedules</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Schedule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Schedule Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Timezone" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {schedules.map(s => (
          <div key={s._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1"><Calendar className="h-3 w-3" /> {s.schedule}</span>
              <span>{s.timezone}</span>
            </div>
            {s.rotations?.length > 0 && (
              <div className="mt-3 space-y-1">
                <h4 className="text-xs font-medium text-gray-500">Current Rotation</h4>
                {s.rotations.sort((a, b) => a.order - b.order).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs">{r.order}</span>
                    <span>{r.agent?.name || 'Unassigned'}</span>
                    <span className="text-gray-400 text-xs">{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
            {s.escalation?.length > 0 && (
              <div className="mt-3 space-y-1">
                <h4 className="text-xs font-medium text-gray-500">Escalation Chain</h4>
                {s.escalation.sort((a, b) => a.order - b.order).map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <ArrowUp className="h-3 w-3 text-orange-500" />
                    <span>{e.agent?.name || 'Unassigned'}</span>
                    <span className="text-gray-400 text-xs">after {e.delayMinutes}min via {e.notifyMethod}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <button onClick={() => handleEscalate(s._id)} className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 bg-orange-50 rounded">Test Escalation</button>
            </div>
          </div>
        ))}
       </div>
       <ConfirmModal open={modal.open} onClose={() => setModal({...modal, open: false})} title={modal.title} message={modal.message} />
     </div>
   );
}
