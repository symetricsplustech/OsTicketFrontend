import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import toast from 'react-hot-toast';

interface Quote {
  _id: string;
  number: string;
  account?: { name: string };
  total: number;
  status: string;
  validUntil?: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number }>;
  createdAt: string;
}

export default function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ accountName: '', validUntil: '', notes: '' });
  const [items, setItems] = useState([{ description: '', quantity: '1', unitPrice: '' }]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/crm/quotes', { params });
      setQuotes(res.data.quotes || []);
    } catch { setQuotes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const quoteItems = items.filter(i => i.description && i.unitPrice).map(i => ({
        description: i.description,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.unitPrice),
      }));
      await api.post('/crm/quotes', { ...form, items: quoteItems });
      toast.success('Quote created');
      setShowForm(false);
      setForm({ accountName: '', validUntil: '', notes: '' });
      setItems([{ description: '', quantity: '1', unitPrice: '' }]);
      load();
    } catch { toast.error('Failed to create quote'); } finally { setSaving(false); }
  };

  const addItem = () => setItems([...items, { description: '', quantity: '1', unitPrice: '' }]);

  const submitForApproval = async (id: string) => {
    try { await api.post(`/ops/quotes/${id}/submit-approval`); toast.success('Submitted for approval'); load(); }
    catch (e: unknown) { toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Submit failed'); }
  };
  const approveQuote = async (id: string) => {
    try { await api.post(`/ops/quotes/${id}/approve`); toast.success('Quote approved'); load(); }
    catch (e: unknown) { toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Approval failed'); }
  };
  const rejectQuote = async (id: string) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try { await api.post(`/ops/quotes/${id}/reject`, { reason }); toast.success('Quote rejected'); load(); }
    catch { toast.error('Reject failed'); }
  };
  const sendToEsign = async (q: Quote) => {
    const signerName = window.prompt('Signer full name:');
    if (!signerName) return;
    const signerEmail = window.prompt('Signer email:');
    if (!signerEmail) return;
    try {
      const res = await api.post('/ops/esign/requests', {
        entityType: 'quote', entityId: q._id,
        documentTitle: `Quote ${q.number}`, signerName, signerEmail,
      });
      toast.success(`Signature link created: ${window.location.origin}/esign?token=${res.data.request.token}`);
      load();
    } catch { toast.error('E-sign request failed'); }
  };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string) => {
    const next = [...items];
    (next[idx] as Record<string, string>)[field] = value;
    setItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Create Quote</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">New Quote</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name *</label>
                <input type="text" required value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="mt-1 input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="flex-1 input-field" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="w-20 input-field" />
                  <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} className="w-28 input-field" />
                  {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 text-sm px-2">Remove</button>}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-sm text-brand-600 hover:text-brand-700">+ Add line item</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 input-field" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Quote'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md input-field" />

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              quotes.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No quotes found</td></tr> :
              quotes.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{q.number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{q.account?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm">${q.total?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${
                    q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    q.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{q.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(q.validUntil)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(q.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {['draft', 'rejected'].includes(q.status) && (
                        <button onClick={() => submitForApproval(q._id)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Submit</button>
                      )}
                      {q.status === 'pending_approval' && (
                        <>
                          <button onClick={() => approveQuote(q._id)} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Approve</button>
                          <button onClick={() => rejectQuote(q._id)} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Reject</button>
                        </>
                      )}
                      {q.status === 'approved' && (
                        <button onClick={() => sendToEsign(q)} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100">E-sign</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
