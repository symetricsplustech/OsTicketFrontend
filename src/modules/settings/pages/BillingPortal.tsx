import { useState } from 'react';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { useGetInvoicesQuery, useMarkInvoicePaidMutation } from '@shared/store/apiEndpoints';

export default function BillingPortal() {
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();
  const [markPaid] = useMarkInvoicePaidMutation();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const pay = async (id: string) => {
    setBusyId(id); setError('');
    try { await markPaid(id).unwrap(); } catch (e: any) { setError(e?.data?.error || 'Payment failed'); }
    setBusyId(null);
  };

  const pending = invoices.filter(i => i.status === 'pending');
  const totalDue = pending.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6" /> Billing Portal</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Invoices</p><p className="text-2xl font-bold">{invoices.length}</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{pending.length}</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Total due</p><p className="text-2xl font-bold">${totalDue.toFixed(2)}</p></div>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-xs uppercase text-gray-500">
            <tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Created</th><th>Action</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading invoices…</td></tr>}
            {!isLoading && invoices.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No invoices yet — activate paid modules to generate them</td></tr>}
            {invoices.map(inv => (
              <tr key={inv._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{inv.number || inv._id.slice(-8)}</td>
                <td className="px-4 py-3">${(inv.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {inv.status === 'paid'
                    ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> paid</span>
                    : <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> {inv.status}</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {inv.status === 'pending' && (
                    <button onClick={() => pay(inv._id)} disabled={busyId === inv._id}
                      className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-40">
                      Record payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
