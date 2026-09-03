import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-09 — Service Level Management: SLA plans, OLA breach radar and
// per-ticket pause/resume controls.
interface SlaPlan {
  _id: string;
  name: string;
  responseMinutes?: number;
  resolutionMinutes?: number;
  isActive?: boolean;
  active?: boolean;
}

interface Breach {
  ticket: string;
  ola: string;
  ageMinutes: number;
  allowed: number;
}

export default function SlaMonitor() {
  const [plans, setPlans] = useState<SlaPlan[]>([]);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [breachCount, setBreachCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ticketNumber, setTicketNumber] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const [pForm, setPForm] = useState({ name: '', responseMinutes: 30, resolutionMinutes: 240 });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/admin/sla-plans').catch(() => ({ data: { plans: [] } })),
        api.get('/gaps2/ola-breaches').catch(() => ({ data: { breaches: [], breachCount: 0 } })),
      ]);
      setPlans(pRes.data.plans || pRes.data || []);
      setBreaches(oRes.data.breaches || []);
      setBreachCount(oRes.data.breachCount ?? (oRes.data.breaches || []).length);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/sla-plans', pForm);
      toast.success('SLA plan created');
      setShowPlan(false);
      setPForm({ name: '', responseMinutes: 30, resolutionMinutes: 240 });
      load();
    } catch {
      toast.error('Failed to create plan');
    }
  };

  const pauseResume = async (action: 'pause' | 'resume') => {
    if (!ticketNumber.trim()) return toast.error('Enter a ticket number');
    try {
      await api.post(`/agent/tickets/${ticketNumber.trim()}/sla/${action}`, {});
      toast.success(`SLA ${action}d for #${ticketNumber.trim()}`);
    } catch {
      toast.error(`Failed to ${action} SLA`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Monitor</h1>
          <p className="text-sm text-gray-500">Plans, breach radar &amp; pause/resume controls</p>
        </div>
        <button onClick={() => setShowPlan(!showPlan)} className="btn-primary text-sm">+ SLA Plan</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold text-red-600">{breachCount}</p>
          <p className="text-sm text-gray-500">OLA breaches right now</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{plans.length}</p>
          <p className="text-sm text-gray-500">SLA plans defined</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm font-semibold mb-2">Pause / resume ticket SLA</p>
          <div className="flex gap-2">
            <input value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Ticket #" className="input-field text-sm flex-1" />
            <button onClick={() => pauseResume('pause')} className="btn-secondary text-xs">Pause</button>
            <button onClick={() => pauseResume('resume')} className="btn-secondary text-xs">Resume</button>
          </div>
        </div>
      </div>

      {showPlan && (
        <form onSubmit={createPlan} className="card p-5 grid md:grid-cols-4 gap-3">
          <input required value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
            placeholder="Plan name *" className="input-field text-sm md:col-span-2" />
          <input type="number" min={1} value={pForm.responseMinutes}
            onChange={(e) => setPForm({ ...pForm, responseMinutes: Number(e.target.value) })}
            title="Response target (minutes)" className="input-field text-sm" />
          <input type="number" min={1} value={pForm.resolutionMinutes}
            onChange={(e) => setPForm({ ...pForm, resolutionMinutes: Number(e.target.value) })}
            title="Resolution target (minutes)" className="input-field text-sm" />
          <div className="md:col-span-4"><button type="submit" className="btn-primary text-sm">Create plan</button></div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm">SLA plans</h2></div>
          {loading ? <p className="p-5 text-sm text-gray-400">Loading…</p> : plans.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No plans yet.</p>
          ) : (
            <ul className="divide-y">
              {plans.map((p) => (
                <li key={p._id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-500">
                    resp {p.responseMinutes ?? '—'}m · reso {p.resolutionMinutes ?? '—'}m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm">OLA breach radar</h2></div>
          {breaches.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No breaches — all open tickets within OLA.</p>
          ) : (
            <ul className="divide-y">
              {breaches.map((b, i) => (
                <li key={`${b.ticket}-${i}`} className="px-5 py-3 flex items-center justify-between text-sm">
                  <Link to={`/tickets/${b.ticket}`} className="font-medium text-brand-700 hover:underline">#{b.ticket}</Link>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={b.ola} />
                    <span className="text-xs text-red-600 font-medium">{b.ageMinutes}m / {b.allowed}m</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Business hours, holidays and timezone calendars live under <Link to="/settings/sla" className="text-brand-600 hover:underline">Settings → SLA</Link>.
      </p>
    </div>
  );
}
