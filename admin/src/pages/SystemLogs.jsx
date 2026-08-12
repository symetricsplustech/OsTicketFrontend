import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function SystemLogs() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/logs', { params: { page, limit: 20 } })
      .then(({ data }) => { setItems(data.items); setPages(data.pages); })
      .catch((err) => setError(err.message));
  }, [page]);

  return (
    <div className="box">
      <div className="box-header"><h1>System Logs — Email Log</h1></div>
      {error && <div className="alert error">{error}</div>}
      <table className="list">
        <thead><tr><th>Time</th><th>To</th><th>Event</th><th>Subject</th><th>Status</th></tr></thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan="5" className="muted text-center">No emails logged yet.</td></tr>
          ) : items.map((l) => (
            <tr key={l._id}>
              <td>{formatDateTime(l.createdAt)}</td>
              <td>{l.to}</td>
              <td><span className="pill purple">{l.event}</span></td>
              <td>{l.subject}</td>
              <td><span className={`pill ${l.status === 'sent' ? 'green' : l.status === 'failed' ? 'gray' : 'orange'}`}>{l.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
