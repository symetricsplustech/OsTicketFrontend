import { useState, useEffect } from 'react';
import { UserCheck, Plus, XCircle, Clock } from 'lucide-react';
import api from '@shared/lib/api';

interface Delegation {
  _id: string;
  delegate?: { _id: string; name: string; email: string } | string;
  delegator?: { _id: string; name: string; email: string } | string;
  scopes: string[];
  reason?: string;
  expiresAt: string;
  active: boolean;
}

const SCOPES = ['tickets', 'crm', 'reports', 'approvals'];

const scopeColor = (scope: string) => {
  switch (scope) {
    case 'tickets': return 'bg-blue-100 text-blue-700';
    case 'crm': return 'bg-purple-100 text-purple-700';
    case 'reports': return 'bg-green-100 text-green-700';
    case 'approvals': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const personName = (p: Delegation['delegate']) =>
  !p ? 'Unknown' : typeof p === 'string' ? p : p.name || p.email || 'Unknown';

const personEmail = (p: Delegation['delegate']) =>
  !p || typeof p === 'string' ? '' : p.email || '';

export default function Delegations() {
  const [grantedByMe, setGrantedByMe] = useState<Delegation[]>([]);
  const [grantedToMe, setGrantedToMe] = useState<Delegation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ delegateId: '', scopes: [] as string[], reason: '', expiresAt: '' });

  useEffect(() => { loadDelegations(); }, []);

  const loadDelegations = async () => {
    try {
      const { data } = await api.get('/ops/delegations');
      setGrantedByMe(data.grantedByMe || []);
      setGrantedToMe(data.grantedToMe || []);
    } catch {}
  };

  const toggleScope = (scope: string) => {
    setForm(f => ({
      ...f,
      scopes: f.scopes.includes(scope) ? f.scopes.filter(s => s !== scope) : [...f.scopes, scope],
    }));
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ops/delegations', form);
      setShowForm(false);
      setForm({ delegateId: '', scopes: [], reason: '', expiresAt: '' });
      loadDelegations();
    } catch {}
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/ops/delegations/${id}`);
      loadDelegations();
    } catch {}
  };

  const renderCard = (d: Delegation, granted: boolean) => {
    const person = granted ? d.delegate : d.delegator;
    return (
      <div key={d._id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className={`h-4 w-4 ${d.active ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-medium text-gray-900">{personName(person)}</span>
            {personEmail(person) && <span className="text-sm text-gray-500">{personEmail(person)}</span>}
            <span className={`px-2 py-0.5 text-xs rounded-full ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {d.active ? 'Active' : 'Revoked'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(d.scopes || []).map(s => (
              <span key={s} className={`px-2 py-0.5 text-xs rounded-full ${scopeColor(s)}`}>{s}</span>
            ))}
          </div>
          {d.reason && <p className="text-sm text-gray-500">{d.reason}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" /> Expires {new Date(d.expiresAt).toLocaleDateString()}
          </span>
          {granted && d.active && (
            <button onClick={() => handleRevoke(d._id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-50 rounded">
              <XCircle className="h-4 w-4" /> Revoke
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserCheck className="h-6 w-6" /> Delegated Access</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Grant Access
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleGrant} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Delegate user ID" value={form.delegateId} onChange={e => setForm({ ...form, delegateId: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="border rounded-lg px-3 py-2" required />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {SCOPES.map(scope => (
              <label key={scope} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                <input type="checkbox" checked={form.scopes.includes(scope)} onChange={() => toggleScope(scope)} className="rounded" />
                {scope}
              </label>
            ))}
          </div>
          <input placeholder="Reason for delegation" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Grant</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Access I Granted</h2>
        {grantedByMe.length === 0
          ? <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No delegations granted.</p>
          : <div className="space-y-3">{grantedByMe.map(d => renderCard(d, true))}</div>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Access Granted To Me</h2>
        {grantedToMe.length === 0
          ? <p className="text-sm text-gray-500 bg-white border rounded-lg p-4">No active delegations from others.</p>
          : <div className="space-y-3">{grantedToMe.map(d => renderCard(d, false))}</div>}
      </section>
    </div>
  );
}
