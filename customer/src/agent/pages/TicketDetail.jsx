import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatDateTime, formatDate, initials, uploadUrl, fileSize, STATUS_COLORS, timeAgo } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import IntelligencePanel from './IntelligencePanel.jsx';

const ThreadEntry = ({ entry, number, onThreads }) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(entry.body);
  if (entry.type === 'system' || entry.isSystem) {
    return <div className="thread-system">{entry.systemMessage || entry.body}</div>;
  }
  const isNote = entry.type === 'note';
  const name = entry.posterType === 'agent' ? (entry.agent?.name || 'Staff') : (entry.user?.name || 'User');

  const startEdit = () => { setBody(entry.body); setEditing(true); };

  const saveEdit = async () => {
    try {
      const { data } = await api.put(`/agent/tickets/${number}/threads/${entry._id}`, { body });
      onThreads(data.threads);
      setEditing(false);
    } catch (err) {
      window.alert(err.message);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this thread entry?')) return;
    try {
      const { data } = await api.delete(`/agent/tickets/${number}/threads/${entry._id}`);
      onThreads(data.threads);
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="thread-entry">
      <div className={`avatar ${isNote ? 'note' : ''}`}>{initials(name)}</div>
      <div className={`thread-body ${isNote ? 'thread-note' : ''}`}>
        <div className="thread-meta">
          <span><strong>{name}</strong>{entry.posterType === 'user' && <em className="muted"> (Customer)</em>}{isNote && <em> (Internal Note)</em>}</span>
          <span>{formatDateTime(entry.createdAt)}</span>
        </div>
        {editing ? (
          <>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
            <div className="buttons mt-10">
              <button className="btn small" onClick={saveEdit}>Save</button>
              <button className="btn small secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="thread-text">{entry.body}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="btn small secondary" onClick={startEdit}>Edit</button>
              <button className="btn small danger" onClick={remove}>Delete</button>
            </div>
          </>
        )}
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

export default function TicketDetail() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // 'assign' | 'transfer' | 'status' | 'task' | 'fields'
  const [cannedId, setCannedId] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabName, setCollabName] = useState('');
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitIds, setSplitIds] = useState([]);
  const [splitSubject, setSplitSubject] = useState('');
  const [splitPriority, setSplitPriority] = useState('Normal');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSel, setMentionSel] = useState(0);
  const assignRef = useRef(null);

  const load = () => {
    api.get(`/agent/tickets/${number}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.message));
  };

  useEffect(load, [number]);

  const applyThreads = (threads) => setData((d) => ({ ...d, threads }));

  const post = async (url, body, options = {}) => {
    setBusy(true);
    setError('');
    try {
      await api.post(url, body);
      if (options.message) console.log(options.message);
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

  const put = async (url, body) => {
    setBusy(true);
    setError('');
    try {
      await api.put(url, body);
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
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('message', reply);
      files.forEach((f) => fd.append('files', f));
      await api.post(`/agent/tickets/${number}/reply`, fd);
      setReply('');
      setFiles([]);
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
    const canned = data.canned.find((c) => c._id === id);
    if (canned) setReply(canned.response);
    setCannedId('');
  };

  const mergeTicket = () => {
    const targetNumber = window.prompt('Enter the target ticket number to merge this ticket into:');
    if (targetNumber) post(`/agent/tickets/${number}/merge`, { targetNumber, reason: `Merged into #${targetNumber} by agent`, notifyUser: true });
  };

  const toggleSplit = (id) => setSplitIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const doSplit = async () => {
    if (!splitIds.length) { setError('Select at least one thread to split out.'); return; }
    if (!splitSubject.trim()) { setError('Subject is required for the new ticket.'); return; }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/agent/tickets/${number}/split`, { threadIds: splitIds, subject: splitSubject, priority: splitPriority });
      setSplitOpen(false);
      setSplitIds([]);
      setSplitSubject('');
      setSplitPriority('Normal');
      if (data.ticket?.number) navigate(`/agent/tickets/${data.ticket.number}`);
      else load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pauseSla = () => {
    const reason = window.prompt('Reason for pausing the SLA timer:');
    if (reason === null) return;
    post(`/agent/tickets/${number}/sla/pause`, { reason });
  };

  const resumeSla = () => post(`/agent/tickets/${number}/sla/resume`);

  const exportCsv = async () => {
    try {
      const res = await api.get('/agent/tickets/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tickets-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const onReplyChange = (val) => {
    setReply(val);
    const at = val.lastIndexOf('@');
    if (at === -1 || (at > 0 && !/\s/.test(val[at - 1]))) { setMentionOpen(false); return; }
    const m = val.slice(at + 1).match(/^\S*/);
    if (m !== null) {
      setMentionQuery(m[0]);
      setMentionSel(0);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  };

  const insertMention = (name) => {
    const at = reply.lastIndexOf('@');
    if (at === -1) { setReply(reply + '@' + name + ' '); }
    else {
      setReply(reply.slice(0, at) + '@' + name + ' ' + reply.slice(at + 1).replace(/^\S*/, ''));
    }
    setMentionOpen(false);
  };

  if (error && !data) return <div className="box"><div className="alert error">{error}</div><Link to="/agent/tickets">Back to Tickets</Link></div>;
  if (!data) return <div className="box muted">Loading ticket…</div>;

  const { ticket, threads, tasks, canned, agents, teams, depts, topics, statuses = [] } = data;

  const statusColor = (key) => (statuses.find((s) => s.key === key)?.color) || STATUS_COLORS[key];

  const meId = user?._id;
  const isLocked = !!(ticket.lockedBy && ticket.lockExpiresAt > Date.now());
  const lockedByMe = isLocked && String(ticket.lockedBy?._id || ticket.lockedBy) === String(meId);
  const assignedToMe = ticket.agent && String(ticket.agent?._id || ticket.agent) === String(meId);
  const canClaim = !ticket.agent || !assignedToMe;

  const addCollaborator = async (e) => {
    e.preventDefault();
    if (!collabEmail) return;
    if (await post(`/agent/tickets/${number}/collaborators`, { email: collabEmail, name: collabName })) {
      setCollabEmail('');
      setCollabName('');
    }
  };

  const removeCollaborator = async (userId) => {
    if (!window.confirm('Remove this collaborator from the ticket?')) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/agent/tickets/${number}/collaborators/${userId}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && <div className="alert error">{error}</div>}

      <div className="ticket-banner">
        <div className="item"><b>Number</b><span><Link to={`/agent/tickets/${ticket.number}`}>#{ticket.number}</Link></span></div>
        <div className="item"><b>Status</b><span><span className="pill" style={{ background: statusColor(ticket.status) }}>{ticket.status}</span></span></div>
        <div className="item"><b>Priority</b><span><span className={`pill priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></span></div>
        <div className="item"><b>User</b><span>{ticket.user?.name} ({ticket.user?.email})</span></div>
        <div className="item"><b>Department</b><span>{ticket.dept?.name || '—'}</span></div>
        <div className="item"><b>Help Topic</b><span>{ticket.topic?.topic || '—'}</span></div>
        <div className="item"><b>Assigned To</b><span>{ticket.agent?.name || ticket.team?.name || <em className="muted">Unassigned</em>}</span></div>
        <div className="item"><b>SLA / Due</b><span>{ticket.sla?.name || '—'}{ticket.dueDate ? ` · ${formatDateTime(ticket.dueDate)}` : ''}</span></div>
        <div className="item"><b>Opened</b><span>{formatDateTime(ticket.createdAt)}</span></div>
        <div className="item"><b>Source</b><span>{ticket.source}</span></div>
      </div>

      <div className="buttons mb-10">
        {canClaim && (
          <button className="btn" onClick={() => post(`/agent/tickets/${number}/claim`)}>{ticket.agent ? 'Take Over' : 'Claim Ticket'}</button>
        )}
        <button className="btn" onClick={() => setModal('assign')}>Assign</button>
        <button className="btn secondary" onClick={() => setModal('transfer')}>Transfer</button>
        <button className="btn secondary" onClick={() => setModal('status')}>Change Status</button>
        <button className="btn secondary" onClick={() => setModal('fields')}>Edit Fields</button>
        {!isLocked ? (
          <button className="btn secondary" onClick={() => post(`/agent/tickets/${number}/lock`)}>Lock</button>
        ) : lockedByMe ? (
          <button className="btn secondary" onClick={() => post(`/agent/tickets/${number}/unlock`)}>Unlock</button>
        ) : (
          <span className="muted">🔒 Locked by {ticket.lockedBy?.name || 'another agent'}</span>
        )}
        <button className="btn danger" onClick={() => { if (window.confirm('Permanently delete this ticket?')) post(`/agent/tickets/${number}/delete`); }}>Delete</button>
        <button className="btn secondary" onClick={mergeTicket}>Merge</button>
        <button className="btn secondary" onClick={() => setSplitOpen(!splitOpen)}>Split</button>
        <button className="btn secondary" onClick={pauseSla}>Pause SLA</button>
        <button className="btn secondary" onClick={resumeSla}>Resume SLA</button>
        <button className="btn secondary" onClick={exportCsv}>Export CSV</button>
      </div>

      {splitOpen && (
        <div className="box mb-10">
          <div className="box-header"><h1>Split Ticket — move message threads to a new ticket</h1></div>
          <div className="field">
            <label>Select message threads</label>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--ost-border)', borderRadius: 3, padding: 8 }}>
              {threads.filter((t) => t.type === 'message' && t.posterType !== 'system').length === 0 && <p className="muted">No message threads available to split.</p>}
              {threads.filter((t) => t.type === 'message' && t.posterType !== 'system').map((t) => (
                <label key={t._id} style={{ display: 'block', padding: '3px 0' }}>
                  <input type="checkbox" checked={splitIds.includes(t._id)} onChange={() => toggleSplit(t._id)} />{' '}
                  <span className="small muted">{formatDateTime(t.createdAt)}</span> — {String(t.body || '').slice(0, 90)}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="field"><label>New Subject <span className="req">*</span></label>
              <input type="text" value={splitSubject} onChange={(e) => setSplitSubject(e.target.value)} placeholder="Subject for the new ticket" /></div>
            <div className="field"><label>Priority</label>
              <select value={splitPriority} onChange={(e) => setSplitPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div className="buttons">
            <button className="btn small" onClick={doSplit} disabled={busy}>Split Selected Threads</button>
            <button className="btn small secondary" onClick={() => setSplitOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <IntelligencePanel number={number} />

      {Object.keys(ticket.customData || {}).length > 0 && (
        <div className="box">
          <div className="box-header"><h1>Custom Fields</h1></div>
          <div className="form-row" style={{ fontSize: 12.5 }}>
            {Object.entries(ticket.customData).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {v === 'Yes' || v === 'No' ? v : v}</div>
            ))}
          </div>
        </div>
      )}

      <div className="box">
        <div className="box-header"><h1>Collaborators <span className="muted small">(users notified of replies)</span></h1></div>
        {(ticket.collaborators || []).length === 0 ? <p className="muted">No collaborators.</p> : (
          <table className="list">
            <thead><tr><th>Name</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {(ticket.collaborators || []).map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td><button className="btn small danger" onClick={() => removeCollaborator(c._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form className="form-row mt-10" onSubmit={addCollaborator}>
          <div className="field"><label>Name</label><input type="text" value={collabName} onChange={(e) => setCollabName(e.target.value)} placeholder="Optional" /></div>
          <div className="field"><label>Email <span className="req">*</span></label><input type="email" value={collabEmail} onChange={(e) => setCollabEmail(e.target.value)} placeholder="collaborator@example.com" required /></div>
          <div className="field" style={{ alignSelf: 'flex-end' }}><button type="submit" className="btn secondary small" disabled={busy}>Add</button></div>
        </form>
      </div>

      <div className="box">
        <div className="box-header"><h1>Ticket Thread <span className="muted small">({ticket.subject})</span></h1></div>
        <div className="thread">
          {threads.map((t) => <ThreadEntry key={t._id} entry={t} number={number} onThreads={applyThreads} />)}
        </div>

        <form onSubmit={submitReply}>
          <div className="field">
            <label>Reply / Message</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <select value={cannedId} onChange={(e) => useCanned(e.target.value)} style={{ width: 'auto' }}>
                <option value="">Use Canned Response…</option>
                {canned.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea value={reply} onChange={(e) => onReplyChange(e.target.value)} required placeholder="Type your response to the customer… (use @ to mention an agent)" />
              {mentionOpen && agents.filter((a) => a.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 8).length > 0 && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, zIndex: 20, minWidth: 180,
                  background: '#fff', border: '1px solid var(--ost-border)', borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,.15)', overflow: 'hidden',
                }}>
                  {agents.filter((a) => a.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 8).map((a, i) => (
                    <button key={a._id} type="button"
                      onMouseDown={(e) => { e.preventDefault(); insertMention(a.name); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', border: 'none', background: i === mentionSel ? '#eaf4fb' : '#fff', fontSize: 12.5, cursor: 'pointer' }}>
                      {a.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="field">
            <label>Attachments</label>
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
          </div>
          <div className="buttons">
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post Reply'}</button>
          </div>
        </form>
      </div>

      <div className="box">
        <div className="box-header"><h1>Internal Notes</h1></div>
        <form onSubmit={submitNote}>
          <div className="field">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note (visible to agents only)…" />
          </div>
          <div className="buttons">
            <button type="submit" className="btn secondary" disabled={busy}>Add Note</button>
          </div>
        </form>
      </div>

      <div className="box">
        <div className="box-header"><h1>Tasks</h1></div>
        {tasks.length === 0 ? <p className="muted">No tasks for this ticket.</p> : (
          <table className="list">
            <thead><tr><th>Task</th><th>Assigned To</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td><strong>{t.title}</strong><div className="small muted">{t.description}</div></td>
                  <td>{t.assignedTo?.name || '—'}</td>
                  <td>{t.dueDate ? formatDate(t.dueDate) : '—'}</td>
                  <td><span className="pill" style={{ background: t.status === 'closed' ? '#6c757d' : '#e08a2e' }}>{t.status}</span></td>
                  <td>
                    {t.status === 'open' && (
                      <button className="btn small secondary" onClick={() => put(`/agent/tickets/${number}/tasks/${t._id}`, { status: 'closed' })}>Mark Closed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="buttons mt-10">
          <button className="btn secondary small" onClick={() => setModal('task')}>Add Task</button>
        </div>
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

      {modal === 'transfer' && (
        <Modal title="Transfer Department" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => {
              const el = document.getElementById('transfer-dept');
              if (el?.value) post(`/agent/tickets/${number}/transfer`, { deptId: el.value });
            }}>Transfer</button>
            <button className="btn secondary" onClick={() => setModal(null)}>Cancel</button>
          </>}>
          <div className="field"><label>Department</label>
            <select id="transfer-dept" defaultValue="">
              <option value="">Select department…</option>
              {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {modal === 'status' && (
        <Modal title="Change Status" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => {
              const el = document.getElementById('new-status');
              if (el?.value) post(`/agent/tickets/${number}/status`, { status: el.value });
            }}>Update Status</button>
            <button className="btn secondary" onClick={() => setModal(null)}>Cancel</button>
          </>}>
          <div className="field"><label>New Status</label>
            <select id="new-status" defaultValue={ticket.status}>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="overdue">Overdue</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
              {statuses.filter((s) => !['open', 'assigned', 'overdue', 'closed', 'archived'].includes(s.key)).map((s) => (
                <option key={s._id} value={s.key}>{s.name}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {modal === 'task' && (
        <AddTaskModal number={number} onClose={() => setModal(null)} onDone={load} agents={agents} />
      )}

      {modal === 'fields' && (
        <EditFieldsModal number={number} ticket={ticket} onClose={() => setModal(null)} onDone={load} />
      )}
    </>
  );
}

function EditFieldsModal({ number, ticket, onClose, onDone }) {
  const [subject, setSubject] = useState(ticket.subject);
  const [priority, setPriority] = useState(ticket.priority);
  const [dueDate, setDueDate] = useState(ticket.dueDate ? ticket.dueDate.slice(0, 10) : '');
  const [source, setSource] = useState(ticket.source);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.post(`/agent/tickets/${number}/fields`, { subject, priority, dueDate: dueDate || null, source });
      onClose();
      onDone();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Edit Ticket Fields" onClose={onClose}
      footer={<>
        <button className="btn" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </>}>
      <div className="field"><label>Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div className="form-row">
        <div className="field"><label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div className="field"><label>Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="web">Web</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="api">API</option>
          </select>
        </div>
      </div>
      <div className="field"><label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
    </Modal>
  );
}

function AddTaskModal({ number, onClose, onDone, agents }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const save = async () => {
    try {
      await api.post(`/agent/tickets/${number}/tasks`, { title, description, assignedTo: assignedTo || null, dueDate: dueDate || null });
      onClose();
      onDone();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <Modal title="Add Task" onClose={onClose}
      footer={<>
        <button className="btn" onClick={save}>Add Task</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </>}>
      <div className="field"><label>Task Title <span className="req">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="field"><label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="form-row">
        <div className="field"><label>Assign To</label>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">—</option>
            {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
      </div>
    </Modal>
  );
}
