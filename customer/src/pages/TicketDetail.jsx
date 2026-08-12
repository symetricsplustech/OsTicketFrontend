import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, formatDateTime, initials, uploadUrl, fileSize, STATUS_COLORS } from '../lib/index.js';
import { can, USER_PERMISSIONS } from '../lib/permissions.js';
import { useAuth } from '../context/AuthContext.jsx';

const ThreadEntry = ({ entry }) => {
  if (entry.type === 'system' || entry.isSystem) {
    return <div className="thread-system">{entry.systemMessage || entry.body}</div>;
  }
  const isNote = entry.type === 'note';
  const name = entry.posterType === 'agent' ? (entry.agent?.name || 'Staff') : (entry.user?.name || 'You');
  return (
    <div className="thread-entry">
      <div className={`avatar ${isNote ? 'system' : ''}`}>{initials(name)}</div>
      <div className={`thread-body ${isNote ? 'thread-note' : ''}`}>
        <div className="thread-meta">
          <span><strong>{name}</strong> {isNote && <em>(Internal Note)</em>}</span>
          <span>{formatDateTime(entry.createdAt)}</span>
        </div>
        <div className="thread-text">{entry.body}</div>
        {entry.attachments?.length > 0 && (
          <div className="attachments">
            {entry.attachments.map((a, i) => (
              <a className="attachment-chip" key={i} href={uploadUrl(a.path)} target="_blank" rel="noreferrer">
                📎 {a.filename} ({fileSize(a.size)})
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TicketDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [threads, setThreads] = useState([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canReply = can(user, USER_PERMISSIONS.TICKET_REPLY);
  const canDelete = can(user, USER_PERMISSIONS.TICKET_DELETE);

  const load = () => {
    api.get(`/tickets/${number}`)
      .then(({ data }) => { setTicket(data.ticket); setThreads(data.threads); })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [number]);

  const reply = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('message', message);
      files.forEach((f) => fd.append('files', f));
      const { data } = await api.post(`/tickets/${number}/reply`, fd);
      setThreads(data.threads);
      setTicket(data.ticket);
      setMessage('');
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (action) => {
    try {
      await api.post(`/tickets/${number}/${action}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeTicket = async () => {
    if (!window.confirm(`Delete ticket #${number}? This cannot be undone.`)) return;
    try {
      await api.delete(`/tickets/${number}`);
      navigate('/tickets');
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !ticket) return <div className="box"><div className="alert error">{error}</div><Link to="/tickets">Back to My Tickets</Link></div>;
  if (!ticket) return <div className="box muted">Loading…</div>;

  return (
    <>
      <div className="box">
        <div className="box-header">
          <h1>
            #{ticket.number} — {ticket.subject}
            <span className="right">
              <Link to="/tickets" className="btn secondary small">My Tickets</Link>
            </span>
          </h1>
        </div>
        {error && <div className="alert error">{error}</div>}
        <table className="list">
          <tbody>
            <tr><th style={{ width: '150px' }}>Status</th><td><span className="pill" style={{ background: STATUS_COLORS[ticket.status] || '#95a5a6' }}>{ticket.status}</span></td></tr>
            <tr><th>Priority</th><td><span className={`pill priority priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td></tr>
            <tr><th>Department</th><td>{ticket.dept?.name || '—'}</td></tr>
            <tr><th>Help Topic</th><td>{ticket.topic?.topic || '—'}</td></tr>
            <tr><th>Assigned To</th><td>{ticket.agent?.name || ticket.team?.name || 'Unassigned'}</td></tr>
            <tr><th>Created By</th><td>{ticket.createdBy?.name || 'You'}</td></tr>
            <tr><th>Opened</th><td>{formatDateTime(ticket.createdAt)}</td></tr>
            <tr><th>Last Update</th><td>{formatDateTime(ticket.updatedAt)}</td></tr>
            <tr><th>Due Date</th><td>{ticket.dueDate ? formatDateTime(ticket.dueDate) : '—'}</td></tr>
          </tbody>
        </table>
        <div className="buttons mt-10">
          {canReply && (ticket.status !== 'closed' ? (
            <button className="btn secondary small" onClick={() => changeStatus('close')}>Close Ticket</button>
          ) : (
            <button className="btn secondary small" onClick={() => changeStatus('reopen')}>Reopen Ticket</button>
          ))}
          {canDelete && <button className="btn danger small" onClick={removeTicket}>Delete Ticket</button>}
        </div>
      </div>

      <div className="box">
        <div className="box-header"><h1>Ticket Thread</h1></div>
        <div className="thread">
          {threads.map((t) => <ThreadEntry key={t._id} entry={t} />)}
        </div>

        {canReply && ticket.status !== 'closed' && (
          <form onSubmit={reply}>
            <div className="field">
              <label>Post a Reply</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Type your reply…" />
            </div>
            <div className="field">
              <label>Attachments</label>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
            </div>
            <div className="buttons">
              <button type="submit" className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post Reply'}</button>
            </div>
          </form>
        )}
        {canReply && ticket.status === 'closed' && (
          <p className="muted">This ticket is closed. You can reopen it to continue the conversation.</p>
        )}
      </div>
    </>
  );
}
