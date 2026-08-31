import { useGetOcInvoicesQuery, useAddOcInvoiceMutation, useApproveOcInvoiceMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { FileText, Plus, CheckCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

interface OcInvoice {
  _id?: string;
  id?: string;
  matter?: any;
  firm?: string;
  amount?: number;
  period?: string;
  status?: string;
}

export default function OutsideCounsel() {
  const { data, isLoading, refetch } = useGetOcInvoicesQuery();
  const [addOcInvoice] = useAddOcInvoiceMutation();
  const [approveOcInvoice] = useApproveOcInvoiceMutation();

  const invoices: OcInvoice[] = data ?? [];
  const [form, setForm] = useState({ matterId: '', firm: '', amount: '', period: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const matterLabel = (m: any) => (typeof m === 'string' ? m : m?.name || m?.matterId || m?._id || '—');

  const add = async () => {
    setAddMsg('');
    setAddErr('');
    try {
      await addOcInvoice({
        matterId: form.matterId,
        firm: form.firm,
        amount: Number(form.amount),
        period: form.period,
      }).unwrap();
      setAddMsg('Invoice added.');
      setForm({ matterId: '', firm: '', amount: '', period: '' });
    } catch (err: any) {
      setAddErr(err?.data?.error || err?.data?.message || 'Failed to add invoice.');
    }
  };

  const approve = async (inv: OcInvoice) => {
    const id = inv._id || inv.id;
    if (!id) return;
    setApprovingId(id);
    try {
      await approveOcInvoice(id).unwrap();
      refetch();
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Outside Counsel Invoices</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <p className="px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-500">No outside counsel invoices.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Matter</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Firm</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Period</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const id = inv._id || inv.id || '';
                const status = (inv.status || '').toLowerCase();
                return (
                  <tr key={id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-900">{matterLabel(inv.matter)}</td>
                    <td className="px-4 py-3 text-gray-700">{inv.firm || '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">${(inv.amount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{inv.period || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        status === 'approved' ? 'bg-green-100 text-green-700' : status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {status === 'submitted' && (
                        <button
                          onClick={() => approve(inv)}
                          disabled={approvingId === id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green-600 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Invoice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.matterId} onChange={(e) => setForm({ ...form, matterId: e.target.value })} placeholder="Matter ID" className={inputCls} />
          <input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} placeholder="Firm" className={inputCls} />
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className={inputCls} />
          <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="Period" className={inputCls} />
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Invoice
        </button>
        {addMsg && <p className="text-xs text-green-600">{addMsg}</p>}
        {addErr && <p className="text-xs text-red-600">{addErr}</p>}
      </div>
    </div>
  );
}
