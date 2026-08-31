import { useGetVendorPackQuery } from '@shared/store/apiEndpoints';
import { Package2, RefreshCw } from 'lucide-react';

export default function VendorPackView() {
  const { data, isLoading, isError, refetch } = useGetVendorPackQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Vendor License Pack</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => window.open('/api/gaps2/licenses/vendor-pack.md', '_blank')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            Download Pack
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading pack…</p>
      ) : isError ? (
        <p className="bg-white rounded-xl border border-red-200 px-6 py-12 text-center text-sm text-red-500">Failed to load the vendor pack.</p>
      ) : (
        <pre className="bg-white rounded-xl border border-gray-200 p-6 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[70vh]">
{data || ''}
        </pre>
      )}
    </div>
  );
}
