import { useState, useEffect } from 'react';
import { Plus, MessageSquare, DollarSign, ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@shared/lib/api';

interface Complaint { _id: string; number: string; customer: { name: string }; category: string; severity: string; status: string; subject: string; createdAt: string; }
interface Refund { _id: string; number: string; customer: { name: string }; amount: number; reason: string; status: string; createdAt: string; }
interface Order { _id: string; number: string; customer: { name: string }; total: number; status: string; paymentStatus: string; createdAt: string; }

type Tab = 'complaints' | 'refunds' | 'orders';

export default function CustomerServicePortal() {
  const [tab, setTab] = useState<Tab>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadAll(); }, [tab]);

  const loadAll = async () => {
    try {
      if (tab === 'complaints') { const { data } = await api.get('/cs/complaints'); setComplaints(data); }
      if (tab === 'refunds') { const { data } = await api.get('/cs/refunds'); setRefunds(data); }
      if (tab === 'orders') { const { data } = await api.get('/cs/orders'); setOrders(data); }
    } catch {}
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/cs/complaints', form); setShowForm(false); setForm({}); loadAll(); } catch {}
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/cs/refunds', form); setShowForm(false); setForm({}); loadAll(); } catch {}
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/cs/orders', form); setShowForm(false); setForm({}); loadAll(); } catch {}
  };

  const handleApproveRefund = async (id: string) => {
    try { await api.put(`/cs/refunds/${id}/approve`); loadAll(); } catch {}
  };

  const handleProcessRefund = async (id: string) => {
    try { await api.put(`/cs/refunds/${id}/process`); loadAll(); } catch {}
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', investigating: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600', escalated: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', processed: 'bg-green-100 text-green-700',
    confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {tab === 'complaints' ? <MessageSquare className="h-6 w-6" /> : tab === 'refunds' ? <DollarSign className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
          Customer Service
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New {tab === 'complaints' ? 'Complaint' : tab === 'refunds' ? 'Refund' : 'Order'}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {(['complaints', 'refunds', 'orders'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && tab === 'complaints' && (
        <form onSubmit={handleCreateComplaint} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Customer ID" value={form.customer || ''} onChange={e => setForm({ ...form, customer: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.category || 'other'} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="product">Product</option><option value="service">Service</option><option value="billing">Billing</option><option value="delivery">Delivery</option><option value="quality">Quality</option><option value="other">Other</option>
            </select>
          </div>
          <input placeholder="Subject" value={form.subject || ''} onChange={e => setForm({ ...form, subject: e.target.value })} className="border rounded-lg px-3 py-2 w-full" required />
          <textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-3 py-2 w-full h-24" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'refunds' && (
        <form onSubmit={handleCreateRefund} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Customer ID" value={form.customer || ''} onChange={e => setForm({ ...form, customer: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="Amount" value={form.amount || 0} onChange={e => setForm({ ...form, amount: +e.target.value })} className="border rounded-lg px-3 py-2" step="0.01" min={0} required />
            <select value={form.refundMethod || 'credit_card'} onChange={e => setForm({ ...form, refundMethod: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="credit_card">Credit Card</option><option value="bank_transfer">Bank Transfer</option><option value="store_credit">Store Credit</option>
            </select>
          </div>
          <textarea placeholder="Reason" value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} className="border rounded-lg px-3 py-2 w-full h-20" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'orders' && (
        <form onSubmit={handleCreateOrder} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Customer ID" value={form.customer || ''} onChange={e => setForm({ ...form, customer: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="Tax" value={form.tax || 0} onChange={e => setForm({ ...form, tax: +e.target.value })} className="border rounded-lg px-3 py-2" step="0.01" />
          </div>
          <textarea placeholder="Notes" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="border rounded-lg px-3 py-2 w-full h-20" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'complaints' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{c.number}</td>
                  <td className="px-4 py-3">{c.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${c.severity === 'critical' ? 'bg-red-100 text-red-700' : c.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{c.severity}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'refunds' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {refunds.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{r.number}</td>
                  <td className="px-4 py-3">{r.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium">${r.amount?.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[r.status] || 'bg-gray-100'}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.status === 'pending' && <button onClick={() => handleApproveRefund(r._id)} className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-50 rounded">Approve</button>}
                      {r.status === 'approved' && <button onClick={() => handleProcessRefund(r._id)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded">Process</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{o.number}</td>
                  <td className="px-4 py-3">{o.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium">${o.total?.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
