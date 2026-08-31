import { useGetSpendOptimisationQuery } from '@shared/store/apiEndpoints';
import { RefreshCw } from 'lucide-react';

export default function SpendAnalytics() {
  const { data, isLoading, refetch } = useGetSpendOptimisationQuery();

  const vendors: any[] = data?.vendors || [];
  const eosList: any[] = data?.eos || data?.endOfService || [];
  const hints: string[] = data?.hints || [];
  const maxSpend = Math.max(...vendors.map((v: any) => Number(v.spend ?? v.amount ?? v.total ?? 0)), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Spend Analytics</h1>
        <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Reload
        </button>
      </div>

      {isLoading && <p className="text-gray-500">Loading spend data...</p>}

      {/* Vendor spend bar chart */}
      <div className="card p-6 space-y-3">
        <h2 className="font-semibold mb-2">Vendor Spend</h2>
        {vendors.map((v: any) => {
          const amount = Number(v.spend ?? v.amount ?? v.total ?? 0);
          return (
            <div key={v._id || v.vendor || v.name}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{v.vendor || v.name}</span>
                <span>{amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded h-5 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded transition-all"
                  style={{ width: `${Math.max((amount / maxSpend) * 100, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
        {!isLoading && !vendors.length && <p className="text-sm text-gray-500">No vendor data.</p>}
      </div>

      {/* EOS table */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">End of Service</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Product</th>
              <th className="py-2 pr-4">Vendor</th>
              <th className="py-2">EOS Date</th>
            </tr>
          </thead>
          <tbody>
            {eosList.map((e: any, i: number) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium">{e.product || e.name}</td>
                <td className="py-2 pr-4">{e.vendor || '—'}</td>
                <td className="py-2 text-gray-600">{e.eosDate ? new Date(e.eosDate).toLocaleDateString() : e.date || '—'}</td>
              </tr>
            ))}
            {!eosList.length && <tr><td colSpan={3} className="py-3 text-gray-500">Nothing nearing end-of-service.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Hints */}
      <div className="card p-6">
        <h2 className="font-semibold mb-3">Optimisation Hints</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          {hints.map((h, i) => <li key={i}>{typeof h === 'string' ? h : JSON.stringify(h)}</li>)}
          {!hints.length && <li className="text-gray-500 list-none -ml-5">No hints available.</li>}
        </ul>
      </div>
    </div>
  );
}
