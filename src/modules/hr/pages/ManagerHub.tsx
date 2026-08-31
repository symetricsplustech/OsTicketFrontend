import { useGetManagerHubQuery } from '@shared/store/apiEndpoints';
import { Gauge, RefreshCw } from 'lucide-react';

export default function ManagerHub() {
  const { data, isLoading, isFetching, refetch } = useGetManagerHubQuery();

  const openCases = Number(data?.openCases ?? 0);
  const activeOnboardings = Number(data?.activeOnboardings ?? 0);
  const scopeNote = data?.scopeNote ?? data?.scope_note ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manager Hub</h1>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Reload
        </button>
      </div>

      {scopeNote && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">{scopeNote}</p>
        </div>
      )}

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading aggregates…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500">Open Cases</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{openCases}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-500">Active Onboardings</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{activeOnboardings}</p>
          </div>
        </div>
      )}
    </div>
  );
}
