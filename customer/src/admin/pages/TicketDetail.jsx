import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, formatDateTime, formatDate, initials, uploadUrl, fileSize, STATUS_COLORS } from '../lib/index.js';

const threadTypeLabel = (t) => {
  if (t.type === 'system' || t.isSystem) return 'System';
  if (t.type === 'note') return 'Internal Note';
  if (t.posterType === 'user') return 'Customer';
  return 'Reply';
};

const ThreadEntry = ({ entry }) => {
  if (entry.type === 'system' || entry.isSystem) {
    return <div className="thread-system">{entry.systemMessage || entry.body}</div>;
  }
  const name = entry.posterType === 'agent' ? (entry.agent?.name || 'Staff') : (entry.user?.name || 'User');
  const isNote = entry.type === 'note';
  return (
    <div className="thread-entry">
      <div className={`avatar ${isNote ? 'note' : ''}`}>{initials(name)}</div>
      <div className={`thread-body ${isNote ? 'thread-note' : ''}`}>
        <div className="thread-meta">
          <span><strong>{name}</strong>{entry.posterType === 'user' && <em className="muted"> (Customer)</em>}{isNote && <em> (Internal Note)</em>}</span>
          <span>{formatDateTime(entry.createdAt)}</span>
        </div>
        <div className="thread-text">{entry.body}</div>
        {entry.attachments?.length > 0 && (
          <div>
            {entry.attachments.map((a, i) => (
              <a className="attachment-chip" key={i} href={uploadUrl(a.path)} target="_blank" rel="noreferrer">📎 {a.filename} ({fileSize(a.size)})</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminTicketDetail() {
  const { number } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [cannedId, setCannedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // 'assign' | 'status' | 'priority'
  const assignRef = useRef(null);

  const load = () => {
    api.get(`/agent/tickets/${number}`).then(({ data }) => setData(data)).catch((err) => setError(err.message));
  };
  useEffect(load, [number]);

  const post = async (url, body) => {
    setBusy(true); setError('');
    try {
      await api.post(url, body);
      setModal(null);
      load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('message', reply);
      files.forEach((f) => fd.append('files', f));
      await api.post(`/agent/tickets/${number}/reply`, fd);
      setReply(''); setFiles([]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async (e) => {
    e.preventDefault();
    if (await post(`/agent/tickets/${number}/note`, { message: note })) setNote('');
  };

  const useCanned = (id) => {
    if (!id) return;
    const c = data.canned.find((x) => x._id === id);
    if (c) { setReply((r) => (r ? r + '\n\n' : '') + c.response); setCannedId(''); }
  };

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading ticket…</div>;

  const { ticket, threads, canned, agents, teams, statuses = [] } = data;
  const statusColor = (key) => (statuses.find((s) => s.key === key)?.color) || STATUS_COLORS[key];
  const priorities = ['Low', 'Normal', 'High', 'Emergency'];

  return (
    <>
      <div className="box">
        <div className="box-header">
          <h1>Ticket #{ticket.number} <span className="muted">({ticket.subject})</span></h1>
        </div>
        <div className="form-row" style={{ fontSize: 12.5 }}>
          <div><strong>User:</strong> {ticket.user?.name} <span className="muted">({ticket.user?.email})</span></div>
          <div><strong>Status:</strong> <span className="pill" style={{ background: statusColor(ticket.status) }}>{ticket.status}</span></div>
          <div><strong>Priority:</strong> <span className="pill" style={{ background: ticket.priority === 'Emergency' ? '#c0392b' : ticket.priority === 'High' ? '#e08a2e' : '#4a86b0' }}>{ticket.priority}</span></div>
          <div><strong>Dept:</strong> {ticket.dept?.name || '—'}</div>
          <div><strong>Agent:</strong> {ticket.agent?.name || '—'}</div>
          <div><strong>Due:</strong> {ticket.dueDate ? formatDate(ticket.dueDate) : '—'}</div>
          <div><strong>Created:</strong> {formatDateTime(ticket.createdAt)}</div>
        </div>
        <div className="buttons" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => setModal('assign')}>Assign</button>
          <button className="btn secondary" onClick={() => setModal('status')}>Change Status</button>
          <button className="btn secondary" onClick={() => setModal('priority')}>Change Priority</button>
        </div>
      </div>

      {Object.keys(ticket.customData || {}).length > 0 && (
        <div className="box">
          <div className="box-header"><h1>Custom Fields</h1></div>
          <div className="form-row" style={{ fontSize: 12.5 }}>
            {Object.entries(ticket.customData).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {v}</div>
            ))}
          </div>
        </div>
      )}

      <div className="box">
        <div className="box-header"><h1>Ticket Thread</h1></div>
        <div className="thread">
          {threads.length === 0 ? <p className="muted">No activity yet.</p> : threads.map((t) => <ThreadEntry key={t._id} entry={t} />)}
        </div>

        <form onSubmit={submitReply}>
          <div className="field">
            <label>Reply to Customer</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <select value={cannedId} onChange={(e) => useCanned(e.target.value)} style={{ width: 'auto' }}>
                <option value="">Use Canned Response…</option>
                {canned.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response to the customer…" required />
          </div>
          <div className="field"><label>Attachments</label>
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} /></div>
          <div className="buttons">
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post Reply'}</button>
          </div>
        </form>
      </div>

      <div className="box">
        <div className="box-header"><h1>Internal Note</h1></div>
        <form onSubmit={submitNote}>
          <div className="field"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note (visible to agents only)…" /></div>
          <div className="buttons"><button type="submit" className="btn secondary" disabled={busy}>Add Note</button></div>
        </form>
      </div>

      {modal === 'assign' && (
        <Modal title="Assign Ticket" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => {
              const agentId = assignRef.current?.agent?.value || '';
              const teamId = assignRef.current?.team?.value || '';
              post(`/agent/tickets/${number}/assign`, { agentId: agentId || null, teamId: teamId || null });
            }}>Assign</button>
            <button className="btn secondary" onClick={() => setModal(null)}>Cancel</button>
          </>}>
          <form ref={assignRef} onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label>Agent</label>
              <select name="agent" defaultValue="">
                <option value="">— Unassigned —</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Team</label>
              <select name="team" defaultValue="">
                <option value="">— No Team —</option>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'status' && (
        <StatusModal number={number} current={ticket.status} statuses={statuses} onClose={() => setModal(null)} onDone={load} />
      )}

      {modal === 'priority' && (
        <PriorityModal number={number} current={ticket.priority} priorities={priorities} onClose={() => setModal(null)} onDone={load} />
      )}
    </>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><span>{title}</span><button className="btn secondary small" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function StatusModal({ number, current, onClose, onDone, statuses = [] }) {
  const [status, setStatus] = useState(current);
  const save = async () => {
    try {
      await api.post(`/agent/tickets/${number}/status`, { status });
      onClose(); onDone();
    } catch (err) { window.alert(err.message); }
  };
  return (
    <Modal title="Change Status" onClose={onClose}
      footer={<>
        <button className="btn" onClick={save}>Update</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </>}>
      <div className="field"><label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {['open', 'assigned', 'overdue', 'closed', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
          {statuses.filter((s) => !['open', 'assigned', 'overdue', 'closed', 'archived'].includes(s.key)).map((s) => (
            <option key={s._id} value={s.key}>{s.name}</option>
          ))}
        </select>
      </div>
    </Modal>
  );
}

function PriorityModal({ number, current, priorities, onClose, onDone }) {
  const [priority, setPriority] = useState(current);
  const save = async () => {
    try {
      await api.post(`/agent/tickets/${number}/fields`, { priority });
      onClose(); onDone();
    } catch (err) { window.alert(err.message); }
  };
  return (
    <Modal title="Change Priority" onClose={onClose}
      footer={<>
        <button className="btn" onClick={save}>Update</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </>}>
      <div className="field"><label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </Modal>
  );
}
