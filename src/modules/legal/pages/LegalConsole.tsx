import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import ConfirmModal from '@shared/components/ConfirmModal';
import { Scale, Gavel, Plus, CheckCircle, AlertTriangle, ShieldAlert, FileCheck } from 'lucide-react';

interface LegalHold { _id: string; custodianName: string; }
interface Matter {
  _id: string;
  title: string;
  practiceArea: string;
  budget?: number;
  privilege?: boolean;
  status: string;
  holdsCount?: number;
  legalHolds?: LegalHold[];
}
interface Contract {
  _id: string;
  title: string;
  counterparty: string;
  negotiationStatus: string;
  renewalDate?: string;
  esignStatus?: string;
}

const PRACTICE_AREAS = ['commercial', 'employment', 'ip', 'privacy', 'litigation', 'regulatory', 'corporate', 'other'];
const NEGOTIATION_STATUSES = ['drafting', 'review', 'negotiation', 'signature_pending', 'signed'];
type Tab = 'matters' | 'contracts';

export default function LegalConsole() {
  const [tab, setTab] = useState<Tab>('matters');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
   const [form, setForm] = useState<any>({});
   const [modal, setModal] = useState<{open: boolean; title: string; message: string}>({open: false, title: '', message: ''});

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    try {
      if (tab === 'matters') { const { data } = await api.get('/em/legal/matters'); setMatters(data); }
      if (tab === 'contracts') { const { data } = await api.get('/em/legal/contracts'); setContracts(data); }
    } catch {}
  };

  const createMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/legal/matters', form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const createContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/legal/contracts', form);
      setShowForm(false); setForm({}); load();
    } catch {}
  };

  const openMatter = async (m: Matter) => {
    if (!window.confirm(`Confirm conflict check completed for "${m.title}" and open this matter?`)) return;
    try {
      await api.post(`/em/legal/matters/${m._id}/open`, { conflictConfirmed: true });
      load();
    } catch {}
  };

  const legalHold = async (m: Matter) => {
    const custodianName = window.prompt('Custodian name for legal hold:');
    if (!custodianName) return;
    try {
      await api.post(`/em/legal/matters/${m._id}/legal-hold`, { custodianName });
      load();
    } catch {}
  };

  const sendEsign = async (c: Contract) => {
    const signerName = window.prompt('Signer name:');
    if (!signerName) return;
    const signerEmail = window.prompt('Signer email:');
    if (!signerEmail) return;
    try {
       const res = await api.post(`/em/legal/contracts/${c._id}/send-esign`, { signerName, signerEmail, title: c.title });
       setModal({open: true, title: 'E-Signature Created', message: `Signature link created: ${res.data.signToken}`});
       load();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="h-6 w-6" /> Legal Console</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add {tab === 'matters' ? 'Matter' : 'Contract'}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {(['matters', 'contracts'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'matters' && (
        <form onSubmit={createMatter} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.practiceArea || ''} onChange={e => setForm({ ...form, practiceArea: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Practice Area</option>
              {PRACTICE_AREAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" min={0} placeholder="Budget" value={form.budget ?? ''} onChange={e => setForm({ ...form, budget: +e.target.value })} className="border rounded-lg px-3 py-2" />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={!!form.privilege} onChange={e => setForm({ ...form, privilege: e.target.checked })} /> Privileged
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'contracts' && (
        <form onSubmit={createContract} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Counterparty" value={form.counterparty || ''} onChange={e => setForm({ ...form, counterparty: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.negotiationStatus || ''} onChange={e => setForm({ ...form, negotiationStatus: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="">Negotiation Status</option>
              {NEGOTIATION_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <input type="date" value={form.renewalDate || ''} onChange={e => setForm({ ...form, renewalDate: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'matters' && (
        <div className="space-y-3">
          {matters.map(m => (
            <div key={m._id} className="bg-white p-4 rounded-lg border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Gavel className="h-4 w-4 text-gray-400" />
                  <h3 className="font-semibold">{m.title}</h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{m.practiceArea}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'open' ? 'bg-green-100 text-green-700' : m.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                  {m.privilege && (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium"><ShieldAlert className="h-3 w-3" /> Privileged</span>
                  )}
                  {(m.holdsCount ?? m.legalHolds?.length ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium"><AlertTriangle className="h-3 w-3" /> {m.holdsCount ?? m.legalHolds?.length} hold{(m.holdsCount ?? m.legalHolds?.length ?? 0) > 1 ? 's' : ''}</span>
                  )}
                </div>
                {typeof m.budget === 'number' && m.budget > 0 && <p className="text-sm text-gray-500 mt-2">Budget: ${m.budget.toLocaleString()}</p>}
              </div>
              <div className="space-x-2 whitespace-nowrap">
                {m.status === 'intake' && (
                  <button onClick={() => openMatter(m)} className="text-green-600 hover:underline text-sm inline-flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Open</button>
                )}
                <button onClick={() => legalHold(m)} className="text-blue-600 hover:underline text-sm">Legal Hold</button>
              </div>
            </div>
          ))}
          {matters.length === 0 && (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-400"><Scale className="h-5 w-5 inline mr-2" />No matters yet</div>
          )}
        </div>
      )}

      {tab === 'contracts' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3">Negotiation Status</th>
                <th className="px-4 py-3">Renewal Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-2"><FileCheck className="h-4 w-4 text-gray-400" /> {c.title}</span>
                    {c.esignStatus === 'sent' && <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">e-sign sent</span>}
                  </td>
                  <td className="px-4 py-3">{c.counterparty}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 ${c.negotiationStatus === 'signed' ? 'text-green-600' : 'text-gray-600'}`}>
                      {c.negotiationStatus === 'signed' && <CheckCircle className="h-4 w-4" />} {(c.negotiationStatus || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.renewalDate ? new Date(c.renewalDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    {c.negotiationStatus !== 'signed' && c.esignStatus !== 'sent' && (
                      <button onClick={() => sendEsign(c)} className="text-blue-600 hover:underline">E-sign</button>
                    )}
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No contracts tracked</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
