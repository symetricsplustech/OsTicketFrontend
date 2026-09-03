import React, { useEffect, useState } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

// ITSM-10 — Assignment & Routing: agent workload/capacity, skills-based /
// round-robin / least-loaded suggestion engine, routing caps and per-ticket
// assignment history.
interface WorkloadRow {
  agent?: string;
  agentId?: string;
  name?: string;
  open?: number;
  openLoad?: number;
  capacity?: number;
  dailyMaxOpen?: number;
}

export default function AssignmentRouting() {
  const [workload, setWorkload] = useState<WorkloadRow[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggest, setSuggest] = useState({ strategy: 'round_robin', requiredSkills: '', departmentKey: '', ticketNumber: '' });
  const [suggestion, setSuggestion] = useState<any>(null);
  const [historyTicket, setHistoryTicket] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([
        api.get('/agent/workload').catch(() => ({ data: { workload: [] } })),
        api.get('/admin/teams').catch(() => ({ data: { teams: [] } })),
      ]);
      setWorkload(wRes.data.workload || wRes.data.agents || wRes.data || []);
      setTeams(tRes.data.teams || []);
    } catch {
      setWorkload([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runSuggestion = async () => {
    try {
      const res = await api.post('/gaps2/routing/next-agent', {
        strategy: suggest.strategy,
        departmentKey: suggest.departmentKey || undefined,
        ticketNumber: suggest.ticketNumber || undefined,
        requiredSkills: suggest.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSuggestion(res.data);
      if (res.data?.overflowQueue) toast('All agents at capacity — overflow queue', { icon: '⚠️' });
      else toast.success(`Suggested: ${res.data?.agent?.name || '—'}`);
    } catch {
      toast.error('Suggestion failed');
    }
  };

  const fetchHistory = async () => {
    if (!historyTicket.trim()) return toast.error('Enter a ticket number');
    try {
      const res = await api.get(`/gaps2/assignments/history/${historyTicket.trim()}`);
      setHistory(Array.isArray(res.data) ? res.data : res.data?.history || []);
    } catch {
      toast.error('Failed to load assignment history');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignment &amp; Routing</h1>
        <p className="text-sm text-gray-500">Groups, workload, auto-assignment &amp; history</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Auto-assignment suggestion</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <select value={suggest.strategy} onChange={(e) => setSuggest({ ...suggest, strategy: e.target.value })} className="input-field text-sm">
              <option value="round_robin">Round robin</option>
              <option value="least_loaded">Least loaded</option>
              <option value="skills">Skills based</option>
            </select>
            <input value={suggest.departmentKey} onChange={(e) => setSuggest({ ...suggest, departmentKey: e.target.value })}
              placeholder="Department key" className="input-field text-sm" />
            <input value={suggest.requiredSkills} onChange={(e) => setSuggest({ ...suggest, requiredSkills: e.target.value })}
              placeholder="Required skills (a, b)" className="input-field text-sm" />
            <input value={suggest.ticketNumber} onChange={(e) => setSuggest({ ...suggest, ticketNumber: e.target.value })}
              placeholder="Ticket # (logs history)" className="input-field text-sm" />
          </div>
          <button onClick={runSuggestion} className="btn-primary text-sm">Suggest agent</button>
          {suggestion && (
            <div className="mt-3 text-sm bg-gray-50 border rounded-lg p-3">
              {suggestion.overflowQueue ? (
                <p className="text-orange-700">Overflow — {suggestion.note || 'no capacity'}</p>
              ) : (
                <p>Strategy <b>{suggestion.strategy}</b> → <b>{suggestion.agent?.name}</b> (open load {suggestion.agent?.openLoad ?? '—'})</p>
              )}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Assignment history</h2>
          <div className="flex gap-2 mb-3">
            <input value={historyTicket} onChange={(e) => setHistoryTicket(e.target.value)}
              placeholder="Ticket number" className="input-field text-sm flex-1" />
            <button onClick={fetchHistory} className="btn-secondary text-sm">Lookup</button>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400">Every automated assignment is recorded with strategy + reasoning.</p>
          ) : (
            <ul className="text-sm divide-y">
              {history.map((h: any, i: number) => (
                <li key={i} className="py-1.5">
                  → {h.toAgent?.name || h.toAgent || h.agent || 'agent'} <span className="text-xs text-gray-400">via {h.strategy || 'manual'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm">Agent workload vs capacity</h2></div>
        {loading ? <p className="p-5 text-sm text-gray-400">Loading…</p> : workload.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No workload data.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Open</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workload.map((w, i) => {
                const open = w.open ?? w.openLoad ?? 0;
                const cap = w.capacity ?? w.dailyMaxOpen ?? 10;
                const pct = Math.min(100, Math.round((open / Math.max(1, cap)) * 100));
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-sm font-medium">{w.name || w.agent || w.agentId || `Agent ${i + 1}`}</td>
                    <td className="px-5 py-2.5 text-sm">{open}</td>
                    <td className="px-5 py-2.5 text-sm text-gray-500">{cap}</td>
                    <td className="px-5 py-2.5">
                      <div className="w-40 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {teams.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Assignment groups</h2>
          <div className="flex flex-wrap gap-2">
            {teams.map((t: any) => (
              <span key={t._id} className="px-3 py-1.5 bg-gray-50 border rounded-full text-xs font-medium">{t.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
