import { useEffect, useRef, useState } from 'react';
import { customerEn } from '../lib/enterprise.js';
import { useAuth } from '../context/AuthContext.jsx';

let widgetState = { id: null };

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const boxRef = useRef(null);

  const ensureStarted = async () => {
    if (conversation || widgetState.id) return conversation || widgetState.id;
    setStarting(true);
    try {
      const { item } = await customerEn.chatStart({
        userId: user?._id || undefined,
        guestName: user?.name || 'Guest',
        guestEmail: user?.email || undefined,
        company: user?.company || undefined,
        subject: 'Live chat from portal',
      });
      widgetState.id = item._id;
      setConversation(item);
      return item._id;
    } catch (e) { setError(e.message); return null; }
    finally { setStarting(false); }
  };

  const loadMessages = async (id) => {
    const data = await customerEn.chatMessages(id);
    setMessages(data.messages || []);
    if (data.conversation?.status === 'closed') widgetState.id = null;
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const id = await ensureStarted();
    if (!id) return;
    setInput('');
    try {
      await customerEn.sendChat(id, {
        body: text,
        userId: user?._id || undefined,
        guestEmail: user?.email || undefined,
        guestName: user?.name || 'Guest',
      });
      await loadMessages(id);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      const id = widgetState.id || (await ensureStarted());
      if (!id) return;
      const t = setInterval(() => loadMessages(id), 3000);
      loadMessages(id);
      return () => clearInterval(t);
    })();
  }, [open]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 99999 });
  }, [messages]);

  return (
    <>
      {error && <div className="alert error" style={{ position: 'fixed', right: 20, bottom: 90, zIndex: 9999 }}>{error}</div>}
      {open && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <b>Live Chat</b>
            <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-widget-body" ref={boxRef}>
            {messages.length === 0 && <p className="muted small" style={{ padding: 8 }}>{starting ? 'Connecting…' : 'Ask us anything — an agent will get back to you here.'}</p>}
            {messages.map((m) => (
              <div key={m._id} className={`chat-bubble ${m.from === 'agent' ? 'chat-bubble-agent' : ''}`}>
                <span className="muted small">{m.from === 'agent' ? 'Agent' : m.from === 'system' ? 'System' : 'You'}</span>
                <div>{m.body}</div>
                <span className="small muted">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
          <div className="chat-widget-footer">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…"
              onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-widget-launcher" onClick={() => setOpen(!open)} aria-label="Open chat">
        💬
      </button>
    </>
  );
}