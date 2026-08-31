import { useGetLeadSnippetQuery } from '@shared/store/apiEndpoints';
import { Radio } from 'lucide-react';

export default function LeadCapture() {
  const { data, isLoading, error } = useGetLeadSnippetQuery();

  if (isLoading) return <div className="p-6 text-gray-500">Loading snippet...</div>;

  const postUrl = (data as any)?.postUrl || (data as any)?.url || '';
  const html = (data as any)?.html || (data as any)?.snippet || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Radio className="h-6 w-6" /> Lead Capture</h1>
        <p className="text-sm text-gray-500 mt-1">Embeddable form for capturing leads from any website.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">Failed to load lead snippet.</div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Post URL</label>
          <input type="text" readOnly value={postUrl} className="mt-1 input-field font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Generated HTML</label>
          <pre className="bg-gray-900 text-green-300 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap">{html}</pre>
        </div>

        <p className="text-sm italic text-gray-500">Host this anywhere; submissions create leads automatically.</p>
      </div>
    </div>
  );
}
