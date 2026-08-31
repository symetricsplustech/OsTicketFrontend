import { useGetUnifiedInboxQuery } from '@shared/store/apiEndpoints';
import { Inbox, RefreshCw } from 'lucide-react';

const CHANNEL_BADGE: Record<string, string> = {
  chat: 'bg-purple-100 text-purple-700',
  whatsapp: 'bg-green-100 text-green-700',
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  sms: 'bg-gray-100 text-gray-600',
};

interface Message {
  _id?: string;
  id?: string;
  channel: string;
  from?: string;
  sender?: string;
  text?: string;
  body?: string;
  message?: string;
  time?: string;
  createdAt?: string;
}

export default function UnifiedInbox() {
  const { data, isLoading, refetch } = useGetUnifiedInboxQuery(undefined, { pollingInterval: 15000 });
  const messages: Message[] = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Unified Inbox</h1>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <p className="text-xs text-gray-400">Auto-refreshes every 15 seconds.</p>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading messages…</p>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No inbound messages across any channel.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {messages.map((m, i) => {
            const channel = (m.channel || '').toLowerCase();
            return (
              <div key={m._id || m.id || i} className="flex items-start gap-3 p-4 hover:bg-gray-50/60">
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 text-xs rounded-full capitalize ${CHANNEL_BADGE[channel] || 'bg-gray-100 text-gray-600'}`}>
                  {channel || 'other'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.from || m.sender || 'Unknown sender'}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{m.text || m.body || m.message || ''}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{m.time || m.createdAt || '—'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
