import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/index.js';

export default function Organizations() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/agent/orgs', { params: { page, limit: 20, search: search || undefined } })
      .then(({ data }) => { setItems(data.items); setTotal(data.total); setPages(data.pages); })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [page]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/agent/orgs', form);
      setShowNew(false);
      setForm({ name: '', domain: '', phone: '', address: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Organizations <span className="muted">({total})</span></h1>
        <button className="btn small" onClick={() => setShowNew(!showNew)}>Add Organization</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {showNew && (
        <div style={{ border: '1px solid var(--ost-border)', borderRadius: 3, padding: 14, marginBottom: 14, background: '#f8fbfd' }}>
          <form onSubmit={create}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="field"><label>Domain</label>
                <input type="text" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} /></div>
              <div className="field"><label>Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="field"><label>Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="buttons"><button className="btn small" type="submit">Create</button></div>
          </form>
        </div>
      )}
      <table className="list">
        <thead><tr><th>Name</th><th>Domain</th><th>Phone</th><th>Account Manager</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((o) => (
            <tr key={o._id}>
              <td><strong>{o.name}</strong></td>
              <td>{o.domain || '—'}</td>
              <td>{o.phone || '—'}</td>
              <td>{o.accountManager?.name || '—'}</td>
              <td><span className="pill" style={{ background: o.status === 'active' ? '#2f9e44' : '#6c757d' }}>{o.status}</span></td>
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
