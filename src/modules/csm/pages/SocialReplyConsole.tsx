import { useGetUnifiedInboxQuery, useReplyInboundMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';

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
  channel?: string;
  from?: string;
  sender?: string;
  text?: string;
  body?: string;
}

export default function SocialReplyConsole() {
  const { data, isLoading, refetch } = useGetUnifiedInboxQuery();
  const [replyInbound] = useReplyInboundMutation();
  const messages: Message[] = data ?? [];
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const keyOf = (m: Message) => m._id || m.id || '';

  const send = async (m: Message) => {
    const id = keyOf(m);
    const text = (drafts[id] || '').trim();
    if (!id || !text) return;
    setSendingId(id);
    try {
      const res: any = await replyInbound({ id, text }).unwrap();
      const delivered = res?.delivered !== false && !res?.error;
      setResults((prev) => ({
        ...prev,
        [id]: delivered ? `Delivered${res?.mock || res?.simulated ? ' (mock)' : ''}` : 'Not delivered',
      }));
      if (delivered) setDrafts((prev) => ({ ...prev, [id]: '' }));
    } catch {
      setResults((prev) => ({ ...prev, [id]: 'Failed to send reply.' }));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Social Reply Console</h1>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400 animate-pulse">Loading inbox…</p>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-500">No inbound messages.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((m, i) => {
            const id = keyOf(m) || String(i);
            const channel = (m.channel || '').toLowerCase();
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full capitalize ${CHANNEL_BADGE[channel] || 'bg-gray-100 text-gray-600'}`}>
                    {channel || 'other'}
                  </span>
                  <p className="text-sm font-medium text-gray-900">{m.from || m.sender || 'Unknown sender'}</p>
                </div>
                <p className="text-sm text-gray-600">{m.text || m.body || ''}</p>
                <div className="flex items-center gap-2">
                  <input
                    value={drafts[id] || ''}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && send(m)}
                    placeholder="Type a reply…"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => send(m)}
                    disabled={sendingId === id || !(drafts[id] || '').trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Reply
                  </button>
                </div>
                {results[id] ? (
                  <p className={`inline-flex items-center gap-1.5 text-xs font-medium ${results[id].startsWith('Delivered') ? 'text-green-600' : 'text-red-600'}`}>
                    {results[id].startsWith('Delivered') ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {results[id]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
