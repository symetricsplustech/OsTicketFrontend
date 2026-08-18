import React, { useState } from 'react';
import { en } from '../lib/enterprise.js';
import { formatDateTime } from '../lib/index.js';

export default function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setError('');
    try {
      const d = await en.search(q);
      const map = {};
      for (const r of d.results || []) map[r.type] = r;
      setResults(map);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const Dots = () => <span className="muted">…</span>;

  return (
    <div>
      <h1 className="et-mb">Global search</h1>
      <form className="et-flex et-gap et-mb" onSubmit={run}>
        <input className="field et-grow" autoFocus placeholder="Search tickets, users, organizations, KB…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
      </form>
      {error && <div className="alert">{error}</div>}

      {results?.tickets?.total > 0 && (
        <>
          <h3>Tickets ({results.tickets.total})</h3>
          <table className="et-table">
            <thead><tr><th>#</th><th>Subject</th><th>Customer</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
            <tbody>
              {results.tickets.items.map((t) => (
                <tr key={t.id || t.number}>
                  <td><a href={`/agent/tickets/${t.number}`} className="et-link"><strong>{t.number}</strong></a></td>
                  <td>{t.subject}</td>
                  <td>{t.customer} <span className="muted small">{t.email}</span></td>
                  <td><span className="pill">{t.status}</span></td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate ? formatDateTime(t.dueDate) : '—'}</td>
                </tr>
              ))}
              {results.tickets.items.length === 0 && <tr><td colSpan={6}><Dots /></td></tr>}
            </tbody>
          </table>
        </>
      )}

      {results?.users?.total > 0 && (
        <>
          <h3>Users ({results.users.total})</h3>
          <table className="et-table">
            <tbody>
              {results.users.items.map((u) => (
                <tr key={u.id || u._id}>
                  <td><a href={`/agent/users/${u.id || u._id}`} className="et-link"><strong>{u.name}</strong></a></td>
                  <td>{u.email}</td>
                  <td>{u.organization || '—'}</td>
                  <td>{u.tier || '—'}</td>
                </tr>
              ))}
              {results.users.items.length === 0 && <tr><td><Dots /></td></tr>}
            </tbody>
          </table>
        </>
      )}

      {results?.organizations?.total > 0 && (
        <>
          <h3>Organizations ({results.organizations.total})</h3>
          <table className="et-table">
            <tbody>
              {results.organizations.items.map((o) => (
                <tr key={o.id || o._id}><td><strong>{o.name}</strong></td><td>{o.domain || '—'}</td><td>{o.contracts?.length ? `${o.contracts.length} contract(s)` : '—'}</td></tr>
              ))}
              {results.organizations.items.length === 0 && <tr><td><Dots /></td></tr>}
            </tbody>
          </table>
        </>
      )}

      {results?.kb?.total > 0 && (
        <>
          <h3>Knowledgebase ({results.kb.total})</h3>
          <table className="et-table">
            <tbody>
              {results.kb.items.map((f) => (
                <tr key={f.id || f._id}><td><strong>{f.question}</strong></td><td className="muted">{String(f.answer || '').slice(0, 90)}</td></tr>
              ))}
              {results.kb.items.length === 0 && <tr><td><Dots /></td></tr>}
            </tbody>
          </table>
        </>
      )}

      {results && !Object.values(results).some((r) => r.total > 0) && <div className="muted">No results for “{q}”.</div>}
    </div>
  );
}