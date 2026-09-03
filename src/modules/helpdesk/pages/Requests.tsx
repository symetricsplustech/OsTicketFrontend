import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';
import { StatusBadge } from '@shared/components/RecordTable';
import toast from 'react-hot-toast';

// ITSM-06 + ITSM-07 — Request Management & Service Catalog fulfilment:
// bundles, cart checkout (creates RITMs), requested items and parallel
// approval chains with per-step decisions.
interface Bundle { _id: string; name?: string; title?: string; description?: string; price?: number; }
interface Chain {
  _id: string;
  subject?: string;
  title?: string;
  mode?: string;
  status: string;
  steps?: Array<{ approver?: string; decision?: string; decidedAt?: string }>;
  createdAt: string;
}

export default function Requests() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ catalogItemId: string; quantity: number }>>([]);
  const [itemId, setItemId] = useState('');
  const [fulfilFor, setFulfilFor] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/gaps2/catalog/bundles').catch(() => ({ data: [] })),
        api.get('/gaps2/approval-chains').catch(() => ({ data: [] })),
      ]);
      setBundles(Array.isArray(bRes.data) ? bRes.data : bRes.data?.records || []);
      setChains(Array.isArray(cRes.data) ? cRes.data : cRes.data?.records || []);
    } catch {
      setBundles([]);
      setChains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addToCart = () => {
    if (!itemId.trim()) return toast.error('Enter a catalog item id');
    setCart((c) => [...c, { catalogItemId: itemId.trim(), quantity: 1 }]);
    setItemId('');
  };

  const checkout = async () => {
    if (!cart.length) return toast.error('Cart is empty');
    try {
      const res = await api.post('/gaps2/catalog/cart', {
        items: cart,
        fulfilledFor: fulfilFor || undefined,
      });
      const kids = res.data?.children?.length ?? res.data?.requestedItems?.length ?? cart.length;
      toast.success(`Request placed — ${kids} requested item(s) created`);
      setCart([]);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Checkout failed (quota / eligibility?)');
    }
  };

  const decide = async (id: string, verdict: 'approved' | 'rejected') => {
    try {
      await api.post(`/gaps2/approval-chains/${id}/decide`, { decision: verdict });
      toast.success(`Step ${verdict}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Decision failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="text-sm text-gray-500">Catalog checkout, requested items &amp; approval chains</p>
        </div>
        <Link to="/catalog" className="btn-secondary text-sm">Browse Catalog</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Cart checkout → RITMs</h2>
          <div className="flex gap-2 mb-2">
            <input value={itemId} onChange={(e) => setItemId(e.target.value)}
              placeholder="Catalog item id" className="input-field text-sm flex-1" />
            <button onClick={addToCart} className="btn-secondary text-xs">Add</button>
          </div>
          <input value={fulfilFor} onChange={(e) => setFulfilFor(e.target.value)}
            placeholder="Fulfil for (user id, optional)" className="input-field text-sm w-full mb-3" />
          {cart.length === 0 ? (
            <p className="text-xs text-gray-400">Cart is empty. Quotas are enforced per item at checkout.</p>
          ) : (
            <ul className="text-sm divide-y mb-3">
              {cart.map((c, i) => (
                <li key={i} className="py-1.5 flex justify-between">
                  <span className="font-mono text-xs">{c.catalogItemId} × {c.quantity}</span>
                  <button onClick={() => setCart((cc) => cc.filter((_, j) => j !== i))} className="text-red-500 text-xs">remove</button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={checkout} disabled={!cart.length} className="btn-primary text-sm disabled:opacity-40">
            Checkout ({cart.length})
          </button>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Bundles</h2>
          {loading ? <p className="text-xs text-gray-400">Loading…</p> : bundles.length === 0 ? (
            <p className="text-xs text-gray-400">No bundles published.</p>
          ) : (
            <ul className="divide-y text-sm">
              {bundles.map((b) => (
                <li key={b._id} className="py-2">
                  <p className="font-medium">{b.name || b.title}</p>
                  {b.description && <p className="text-xs text-gray-500 line-clamp-1">{b.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm">Approval chains</h2></div>
        {loading ? <p className="p-5 text-sm text-gray-400">Loading…</p> : chains.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No approval chains.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Raised</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Decide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chains.map((c) => {
                const done = (c.steps || []).filter((s) => s.decision).length;
                const total = (c.steps || []).length;
                return (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium">{c.subject || c.title || c._id}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.mode || 'sequential'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{done}/{total} steps</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-3">
                      {c.status === 'pending' || !['approved', 'rejected'].includes(c.status) ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => decide(c._id, 'approved')} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Approve</button>
                          <button onClick={() => decide(c._id, 'rejected')} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                        </div>
                      ) : <span className="text-xs text-gray-400">closed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
