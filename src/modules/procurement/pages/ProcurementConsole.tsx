import api from '@shared/lib/api';
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle } from 'lucide-react';

interface Supplier {
  _id: string;
  name: string;
  taxId?: string;
  diversityCertified?: boolean;
  onboardingStatus?: string;
  performanceRating?: number;
}

interface RequisitionLine {
  description: string;
  quantity: number;
  estUnitPrice: number;
}

interface Requisition {
  _id: string;
  businessNeed: string;
  neededBy?: string;
  lines: RequisitionLine[];
  totalEstimate?: number;
  status?: string;
  po?: { number?: string };
}

interface SourcingEvent {
  _id: string;
  title: string;
  eventType?: string;
  status?: string;
}

type Tab = 'suppliers' | 'requisitions' | 'sourcing';

export default function ProcurementConsole() {
  const [tab, setTab] = useState<Tab>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [events, setEvents] = useState<SourcingEvent[]>([]);
  const [supplierForm, setSupplierForm] = useState({ name: '', taxId: '', diversityCertified: false });
  const [reqForm, setReqForm] = useState<{ businessNeed: string; neededBy: string; lines: RequisitionLine[] }>({
    businessNeed: '',
    neededBy: '',
    lines: [{ description: '', quantity: 1, estUnitPrice: 0 }],
  });
  const [eventForm, setEventForm] = useState({ title: '', eventType: 'RFI' });
  const [poNumbers, setPoNumbers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSuppliers();
    loadRequisitions();
    loadEvents();
  }, []);

  const loadSuppliers = async () => {
    try { const { data } = await api.get('/em/procurement/suppliers'); setSuppliers(data); } catch {}
  };

  const loadRequisitions = async () => {
    try { const { data } = await api.get('/em/procurement/requisitions'); setRequisitions(data); } catch {}
  };

  const loadEvents = async () => {
    try { const { data } = await api.get('/em/procurement/sourcing-events'); setEvents(data); } catch {}
  };

  const createSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/procurement/suppliers', supplierForm);
      setSupplierForm({ name: '', taxId: '', diversityCertified: false });
      loadSuppliers();
    } catch {}
  };

  const totalEstimate = reqForm.lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.estUnitPrice) || 0), 0);

  const createRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/procurement/requisitions', { ...reqForm, totalEstimate });
      setReqForm({ businessNeed: '', neededBy: '', lines: [{ description: '', quantity: 1, estUnitPrice: 0 }] });
      loadRequisitions();
    } catch {}
  };

  const approveRequisition = async (id: string) => {
    try { await api.post(`/em/procurement/requisitions/${id}/approve`); loadRequisitions(); } catch {}
  };

  const createPo = async (id: string) => {
    try {
      const { data } = await api.post(`/em/procurement/requisitions/${id}/create-po`);
      if (data?.po?.number || data?.number) setPoNumbers(prev => ({ ...prev, [id]: data.po?.number || data.number }));
    } catch {}
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/em/procurement/sourcing-events', eventForm);
      setEventForm({ title: '', eventType: 'RFI' });
      loadEvents();
    } catch {}
  };

  const statusBadge = (status?: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'onboarded' || status === 'awarded' ? 'bg-green-100 text-green-700'
      : status === 'approved' ? 'bg-blue-100 text-blue-700'
      : status === 'pending_approval' || status === 'pending' ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-600'
    }`}>{(status || 'unknown').replace(/_/g, ' ')}</span>
  );

  const stars = (rating?: number) => {
    const r = Math.round(rating || 0);
    return <span className="text-sm text-yellow-500">{'★'.repeat(r)}{'☆'.repeat(5 - r)} <span className="text-gray-500 text-xs">({rating ?? 0}/5)</span></span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Procurement Console</h1>

      <div className="flex gap-2 border-b">
        {(['suppliers', 'requisitions', 'sourcing'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'suppliers' && (
        <div className="space-y-4">
          <form onSubmit={createSupplier} className="bg-white p-4 rounded-lg border space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Supplier Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input placeholder="Tax ID" value={supplierForm.taxId} onChange={e => setSupplierForm({ ...supplierForm, taxId: e.target.value })} className="border rounded-lg px-3 py-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={supplierForm.diversityCertified} onChange={e => setSupplierForm({ ...supplierForm, diversityCertified: e.target.checked })} />
                Diversity Certified
              </label>
            </div>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Supplier</button>
          </form>

          <div className="grid grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s._id} className="bg-white p-4 rounded-lg border space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  {s.diversityCertified && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">Diverse</span>}
                </div>
                <p className="text-xs text-gray-500">Tax ID: {s.taxId || '—'}</p>
                <div className="flex items-center gap-2">{statusBadge(s.onboardingStatus)}</div>
                {stars(s.performanceRating)}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'requisitions' && (
        <div className="space-y-4">
          <form onSubmit={createRequisition} className="bg-white p-4 rounded-lg border space-y-3">
            <textarea placeholder="Business Need" value={reqForm.businessNeed} onChange={e => setReqForm({ ...reqForm, businessNeed: e.target.value })} className="border rounded-lg px-3 py-2 w-full" rows={2} required />
            <input type="date" value={reqForm.neededBy} onChange={e => setReqForm({ ...reqForm, neededBy: e.target.value })} className="border rounded-lg px-3 py-2" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Lines</p>
              {reqForm.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[2fr_80px_120px_32px] gap-2">
                  <input placeholder="Description" value={line.description} onChange={e => {
                    const lines = [...reqForm.lines];
                    lines[i] = { ...lines[i], description: e.target.value };
                    setReqForm({ ...reqForm, lines });
                  }} className="border rounded-lg px-3 py-2" required />
                  <input type="number" min={1} placeholder="Qty" value={line.quantity} onChange={e => {
                    const lines = [...reqForm.lines];
                    lines[i] = { ...lines[i], quantity: +e.target.value };
                    setReqForm({ ...reqForm, lines });
                  }} className="border rounded-lg px-3 py-2" required />
                  <input type="number" min={0} step="0.01" placeholder="Est Unit Price" value={line.estUnitPrice} onChange={e => {
                    const lines = [...reqForm.lines];
                    lines[i] = { ...lines[i], estUnitPrice: +e.target.value };
                    setReqForm({ ...reqForm, lines });
                  }} className="border rounded-lg px-3 py-2" required />
                  <button type="button" onClick={() => setReqForm({ ...reqForm, lines: reqForm.lines.filter((_, j) => j !== i) })} disabled={reqForm.lines.length === 1} className="text-red-500 hover:text-red-700 disabled:text-gray-300">×</button>
                </div>
              ))}
              <button type="button" onClick={() => setReqForm({ ...reqForm, lines: [...reqForm.lines, { description: '', quantity: 1, estUnitPrice: 0 }] })} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Line</button>
            </div>
            <p className="text-sm font-semibold">Total Estimate: ${totalEstimate.toLocaleString()}</p>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit Requisition</button>
          </form>

          <div className="space-y-3">
            {requisitions.map(r => (
              <div key={r._id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{r.businessNeed}</p>
                    <p className="text-xs text-gray-500 mt-1">Needed by: {r.neededBy ? new Date(r.neededBy).toLocaleDateString() : '—'} · {r.lines?.length || 0} line(s) · Est: ${(r.totalEstimate || 0).toLocaleString()}</p>
                    {r.po?.number && <p className="text-xs text-green-700 mt-1">PO #{r.po.number}</p>}
                    {poNumbers[r._id] && !r.po?.number && <p className="text-xs text-green-700 mt-1">PO #{poNumbers[r._id]}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(r.status)}
                    {(r.status === 'pending_approval' || r.status === 'pending') && (
                      <button onClick={() => approveRequisition(r._id)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><CheckCircle className="h-4 w-4" /> Approve</button>
                    )}
                    {r.status === 'approved' && (
                      <button onClick={() => createPo(r._id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">Create PO</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'sourcing' && (
        <div className="space-y-4">
          <form onSubmit={createEvent} className="bg-white p-4 rounded-lg border grid grid-cols-[2fr_140px_auto] gap-3">
            <input placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={eventForm.eventType} onChange={e => setEventForm({ ...eventForm, eventType: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="RFI">RFI</option>
              <option value="RFP">RFP</option>
              <option value="RFQ">RFQ</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create Event</button>
          </form>

          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev._id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{ev.eventType || 'RFI'}</p>
                </div>
                {statusBadge(ev.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
