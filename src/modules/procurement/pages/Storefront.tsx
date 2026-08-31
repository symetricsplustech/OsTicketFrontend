import { useGetStorefrontQuery, useGetBidGridQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Store, Send, RefreshCw, XCircle } from 'lucide-react';

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'storefront' | 'bids';

interface CatalogItem {
  _id?: string;
  id?: string;
  name: string;
  price?: number;
  description?: string;
}

interface BidRow {
  supplier?: string;
  technical?: number | string;
  commercial?: number | string;
  weightedTotal?: number | string;
  sealed?: boolean;
}

export default function Storefront() {
  const [tab, setTab] = useState<Tab>('storefront');
  const { data: storefront, isLoading } = useGetStorefrontQuery();

  const [cart, setCart] = useState<string[]>([]);
  const [bidInput, setBidInput] = useState('');
  const [bidEventId, setBidEventId] = useState('');
  const [bidLoaded, setBidLoaded] = useState(false);
  const { data: bidGrid, isFetching: bidFetching } = useGetBidGridQuery(bidEventId, { skip: !bidLoaded });

  const services: CatalogItem[] = storefront?.services ?? [];
  const products: CatalogItem[] = storefront?.products ?? [];
  const criteria: any[] = bidGrid?.criteria ?? [];
  const bids: BidRow[] = [...(bidGrid?.bids ?? bidGrid?.rows ?? [])].sort(
    (a, b) => Number(b.weightedTotal ?? -Infinity) - Number(a.weightedTotal ?? -Infinity)
  );

  const addToCart = (name: string) => setCart((prev) => [...prev, name]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Store className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Procurement Storefront</h1>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <p className="text-sm font-medium text-gray-700">Cart: {cart.length} item(s)</p>
        {cart.length > 0 && (
          <button onClick={() => setCart([])} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {(['storefront', 'bids'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'storefront' ? 'Storefront' : 'Bid Comparison'}
          </button>
        ))}
      </div>

      {tab === 'storefront' && (
        <>
          {isLoading ? (
            <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading catalog…</p>
          ) : services.length === 0 && products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
              <XCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No catalog items available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((s, i) => (
                    <div key={s._id || s.id || i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900">{s.name}</h3>
                      {s.description && <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">${Number(s.price ?? 0).toLocaleString()}</span>
                        <button
                          onClick={() => addToCart(s.name)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          <Send className="h-3.5 w-3.5" /> Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p, i) => (
                    <div key={p._id || p.id || i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                      {p.description && <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">${Number(p.price ?? 0).toLocaleString()}</span>
                        <button
                          onClick={() => addToCart(p.name)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          <Send className="h-3.5 w-3.5" /> Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {tab === 'bids' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              placeholder="Sourcing Event ID"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              className={inputCls}
            />
            <button
              onClick={() => {
                if (bidInput.trim()) {
                  setBidEventId(bidInput.trim());
                  setBidLoaded(true);
                }
              }}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
            >
              Load
            </button>
          </div>

          {!bidLoaded ? (
            <p className="text-sm text-gray-400">Enter a sourcing event ID to compare bids.</p>
          ) : bidFetching && !bidGrid ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading bid grid…</p>
          ) : (
            <>
              {criteria.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {criteria.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                      {typeof c === 'string' ? c : c?.name || c?.title || JSON.stringify(c)}
                    </span>
                  ))}
                </div>
              )}
              {bids.length === 0 ? (
                <p className="text-sm text-gray-500">No bids found for this event.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {['Supplier', 'Technical', 'Commercial', 'Weighted Total'].map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bids.map((b, i) => (
                        <tr key={i} className={i === 0 ? 'bg-brand-50 font-semibold' : ''}>
                          <td className="px-4 py-2 text-sm text-gray-900">{b.supplier ?? `Bidder ${i + 1}`}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{b.sealed ? 'sealed' : (b.technical ?? '—')}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{b.sealed ? 'sealed' : (b.commercial ?? '—')}</td>
                          <td className={`px-4 py-2 text-sm ${i === 0 ? 'text-brand-700' : 'text-gray-900'}`}>
                            {b.sealed ? 'sealed' : (b.weightedTotal ?? '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
