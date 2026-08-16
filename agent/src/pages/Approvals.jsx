import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';
import { en, } from '../lib/enterprise.js';

export default function Approvals() {
  const [tab, setTab] = useState('mine');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    en.approvals({ limit: 100 }, tab === 'mine').then((d) => setItems(d.items || [])).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const decide = async (id, decision, comment = '') => {
    setBusyId(id);
    setError('');
    try { await en.decideApproval(id, decision, { comment }); load(); } catch (e) { setError(e.message); } finally { setBusyId(''); }
  };

  const typeLabel = (a) => `${a.refType || 'generic'}${a.refNumber ? ` #${a.refNumber}` : ''}`;

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Approvals</h1>
        <div className="tabs-inner et-tabs">
          <button className={`pill et-tab ${tab === 'mine' ? 'et-tab-active' : ''}`} onClick={() => setTab('mine')}>Need my approval</button>
          <button className={`pill et-tab ${tab === 'all' ? 'et-tab-active' : ''}`} onClick={() => setTab('all')}>All approvals</button>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <table className="et-table">
        <thead><tr><th>Ref</th><th>Description</th><th>Requester</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a._id}>
              <td><strong>{typeLabel(a)}</strong></td>
              <td>{a.description || a.title || '—'}</td>
              <td>{a.requester?.name || '—'}</td>
              <td><span className="pill">{a.status}</span></td>
              <td>{formatDateTime(a.createdAt)}</td>
              <td>
                {a.status === 'pending' && tab === 'mine' && (
                  <>
                    <button className="btn btn-small et-ok" disabled={busyId === a._id} onClick={() => decide(a._id, 'approved')}>Approve</button>{' '}
                    <button className="btn btn-small et-bad" disabled={busyId === a._id} onClick={() => decide(a._id, 'rejected', window.prompt('Reason?') || '')}>Reject</button>
                  </>
                )}
                <button className="btn btn-small" disabled={busyId === a._id} onClick={() => en.delegateApproval(a._id, { toAgentId: window.prompt('Agent ID to delegate to') }).then(load).catch((e) => setError(e.message))}>Delegate</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={6} className="muted">No approvals here.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}