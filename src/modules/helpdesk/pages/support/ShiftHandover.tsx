import { useGetHandoverNotesQuery, useAddHandoverNoteMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Repeat, Plus, CheckCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface HandoverNote {
  _id: string;
  shiftDate?: string;
  pendingTickets?: string[];
  risks?: string;
  notes?: string;
  acknowledged?: boolean;
}

export default function ShiftHandover() {
  const { data: notes = [], isLoading, refetch } = useGetHandoverNotesQuery();
  const [addNote] = useAddHandoverNoteMutation();

  const [form, setForm] = useState({ shiftDate: '', pendingTicketsText: '', risks: '', notes: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const pendingTickets = form.pendingTicketsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      await addNote({
        shiftDate: form.shiftDate,
        pendingTickets,
        risks: form.risks,
        notes: form.notes,
      }).unwrap();
      setForm({ shiftDate: '', pendingTicketsText: '', risks: '', notes: '' });
      setMsg('Handover note saved.');
      refetch();
    } catch (e2: any) {
      setErr(e2?.data?.error || e2?.data?.message || 'Failed to save handover note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Repeat className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Shift Handover</h1>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-gray-900">New Handover Note</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift Date</label>
          <input
            type="date"
            required
            value={form.shiftDate}
            onChange={(e) => setForm({ ...form, shiftDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pending Tickets (comma separated)</label>
          <input
            placeholder="TKT-101, TKT-205, TKT-330"
            value={form.pendingTicketsText}
            onChange={(e) => setForm({ ...form, pendingTicketsText: e.target.value })}
            className={inputCls}
          />
          {pendingTickets.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {pendingTickets.map((t) => (
                <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risks</label>
          <textarea
            rows={2}
            placeholder="Known risks for the next shift…"
            value={form.risks}
            onChange={(e) => setForm({ ...form, risks: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            rows={3}
            placeholder="General handover context…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputCls}
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {!err && msg && <p className="text-sm text-green-600">{msg}</p>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50">
          <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Note'}
        </button>
      </form>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading handover notes…</p>
      ) : notes.length === 0 ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-500">No handover notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div key={n._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {n.shiftDate ? new Date(n.shiftDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Undated shift'}
                </h3>
                {n.acknowledged ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Acknowledged
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending ack</span>
                )}
              </div>
              {(n.pendingTickets ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(n.pendingTickets ?? []).map((t: string) => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{t}</span>
                  ))}
                </div>
              )}
              {n.risks && (
                <p className="text-sm text-red-600 whitespace-pre-wrap"><span className="font-medium">Risks:</span> {n.risks}</p>
              )}
              {n.notes && <p className="text-sm text-gray-600 whitespace-pre-wrap">{n.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
