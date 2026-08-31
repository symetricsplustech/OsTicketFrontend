import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { MessageSquare, Send, Eye, Users } from 'lucide-react';

interface IncidentRow {
  _id: string;
  title?: string;
  name?: string;
  severity?: string;
  status?: string;
}

interface WarMessage {
  _id?: string;
  kind?: string;
  author?: string;
  authorName?: string;
  message?: string;
  body?: string;
  createdAt?: string;
}

const KINDS = ['chat', 'status', 'decision', 'action_item'];

export default function WarRoom() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<WarMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [kind, setKind] = useState('chat');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/enterprise/incidents');
        const rows = Array.isArray(res.data) ? res.data : (res.data.incidents || res.data.data || []);
        setIncidents(rows);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get(`/ops/incidents/${selectedId}/warroom`);
        if (!cancelled) setMessages(Array.isArray(res.data) ? res.data : []);
      } catch {}
    };
    load();
    const timer = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedId]);

  const refresh = async () => {
    if (!selectedId) return;
    try {
      const res = await api.get(`/ops/incidents/${selectedId}/warroom`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const send = async () => {
    if (!selectedId || !draft.trim()) return;
    try {
      await api.post(`/ops/incidents/${selectedId}/warroom`, { message: draft.trim(), kind });
      setDraft('');
      await refresh();
    } catch {}
  };

  const postStakeholderUpdate = async () => {
    if (!selectedId) return;
    const message = prompt('Stakeholder update message');
    if (!message) return;
    try {
      await api.post(`/ops/incidents/${selectedId}/stakeholder-update`, { message });
    } catch {}
  };

  const assignResolutionTeam = async () => {
    if (!selectedId) return;
    const ids = prompt('Comma-separated agent ids');
    if (!ids) return;
    try {
      await api.post(`/ops/incidents/${selectedId}/resolution-team`, { agentIds: ids.split(',').map(s => s.trim()) });
    } catch {}
  };

  const severityColor = (severity?: string) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
      case 'sev1':
        return 'bg-red-100 text-red-700';
      case 'high':
      case 'major':
      case 'sev2':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
      case 'minor':
      case 'sev3':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6" /> Major-Incident War Room</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={postStakeholderUpdate}
            disabled={!selectedId}
            className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" /> Post stakeholder update
          </button>
          <button
            onClick={assignResolutionTeam}
            disabled={!selectedId}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Users className="h-4 w-4" /> Assign resolution team
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <aside className="w-72 shrink-0 max-h-[34rem] overflow-y-auto space-y-2">
          {incidents.map(inc => (
            <button
              key={inc._id}
              onClick={() => setSelectedId(inc._id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedId === inc._id ? 'border-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium truncate">{inc.title || inc.name || inc._id}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor(inc.severity)}`}>
                  {inc.severity || 'unknown'}
                </span>
                <span className="text-xs text-gray-500">{inc.status || 'open'}</span>
              </div>
            </button>
          ))}
          {incidents.length === 0 && <p className="text-sm text-gray-500 p-3">No open incidents.</p>}
        </aside>

        <section className="flex-1 flex flex-col bg-white border rounded-lg h-[34rem]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select an incident to open its war room
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-gray-400 text-center pt-10">No war room activity yet.</p>
                )}
                {messages.map((m, i) => {
                  const nonChat = !!m.kind && m.kind !== 'chat';
                  return (
                    <div key={m._id || i} className={`flex ${nonChat ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          nonChat ? 'bg-amber-50 border border-amber-200' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {nonChat && (
                          <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-semibold uppercase tracking-wide">
                            {m.kind}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.message || m.body || ''}</p>
                        <p className={`mt-1 text-[10px] ${nonChat ? 'text-gray-500' : 'text-blue-100'}`}>
                          {m.author || m.authorName || 'Unknown'} &middot;{' '}
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-3 flex items-center gap-2">
                <select
                  value={kind}
                  onChange={e => setKind(e.target.value)}
                  className="border rounded-lg px-2 py-2 text-sm bg-white"
                >
                  {KINDS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') send();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={send}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
