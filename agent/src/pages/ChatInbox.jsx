import React, { useEffect, useRef, useState } from 'react';
import { api, formatDateTime, initials } from '../lib/index.js';
import { en } from '../lib/enterprise.js';

export default function ChatInbox() {
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const load = () => {
    en.conversations({ limit: 50, status: 'open' }).then((d) => setConvs(d.items || [])).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openConv = (c) => {
    setActive(c);
    fetchMessages(c._id);
  };

  const fetchMessages = (id) => {
    en.conversation(id).then((d) => setMessages(d.messages || d.items || [])).catch((e) => setError(e.message));
  };

  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (active) fetchMessages(active._id);
    }, 4000);
    return () => clearInterval(pollRef.current);
    /* eslint-disable-next-line */
  }, [active]);

  const send = async () => {
    if (!text.trim() || !active) return;
    setText('');
    try {
      await en.postChat(active._id, { body: text });
      fetchMessages(active._id);
    } catch (e) { setError(e.message); }
  };

  const setStatus = async (status) => {
    if (!active) return;
    try {
      if (status === 'closed') await en.closeConversation(active._id);
      else await en.assignConversation(active._id, { agentId: '' });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="et-chat-wrap">
      <div className="et-chat-list">
        <h2>Live chat ({convs.length})</h2>
        {error && <div className="alert">{error}</div>}
        {convs.map((c) => (
          <button key={c._id} className={`et-chat-item ${active?._id === c._id ? 'et-chat-active' : ''}`} onClick={() => openConv(c)}>
            <div className="avatar">{initials(c.guestName || c.user?.name || '?')}</div>
            <div className="et-chat-meta">
              <strong>{c.guestName || c.user?.name || 'Guest'}</strong>
              <span className="small muted">{c.guestEmail || c.user?.email}{c.ticket && ` · #${c.ticket.number}`}</span>
              <span className="small muted">{c.subject || ''}</span>
            </div>
            <span className={`pill ${c.status === 'open' ? 'et-ok' : ''}`}>{c.status}</span>
          </button>
        ))}
        {!convs.length && <div className="muted">No open conversations.</div>}
      </div>
      <div className="et-chat-thread">
        {!active && <div className="muted text-center et-pad">Select a conversation</div>}
        {active && (
          <>
            <div className="et-chat-head">
              <strong>{active.guestName || active.user?.name || 'Guest'}</strong>
              <span className="small muted">{active.guestEmail || active.user?.email}</span>
              <div className="et-flex et-gap">
                <button className="btn btn-small" onClick={() => en.assignConversation(active._id, { agentId: '' }).then(load).catch((e) => setError(e.message))}>Assign to me</button>
                <button className="btn btn-small" onClick={() => setStatus('closed')}>Close</button>
              </div>
            </div>
            <div className="et-chat-msgs">
              {messages.map((m, i) => (
                <div key={m._id || i} className={`et-msg ${m.sender === 'agent' ? 'et-msg-agent' : m.sender === 'system' ? 'et-msg-sys' : ''}`}>
                  <div className="small muted">{m.sender === 'agent' ? (m.agent?.name || 'You') : m.sender === 'system' ? 'System' : (m.user?.name || 'Customer')} · {formatDateTime(m.createdAt)}</div>
                  <div>{m.body}</div>
                </div>
              ))}
              {!messages.length && <div className="muted">No messages yet.</div>}
            </div>
            <div className="et-chat-input">
              <input className="field et-grow" placeholder="Type a reply…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}