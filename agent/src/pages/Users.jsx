import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDateTime, formatDate } from '../lib/index.js';

export default function Users() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const load = () => {
    api.get('/agent/users', { params: { page, limit: 20, search: search || undefined } })
      .then(({ data }) => { setItems(data.items); setTotal(data.total); setPages(data.pages); })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [page]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/agent/users', form);
      setShowNew(false);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>User Directory <span className="muted">({total})</span></h1>
        <button className="btn small" onClick={() => setShowNew(!showNew)}>Add New User</button>
      </div>
      {error && <div className="alert error">{error}</div>}

      {showNew && (
        <div style={{ border: '1px solid var(--ost-border)', borderRadius: 3, padding: 14, marginBottom: 14, background: '#f8fbfd' }}>
          <form onSubmit={createUser}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="field"><label>Email <span className="req">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="field"><label>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="buttons"><button className="btn small" type="submit">Create User</button></div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="text" placeholder="Search name, email, phone…" value={search} style={{ width: 280 }}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }} />
        <button className="btn secondary small" onClick={() => { setPage(1); load(); }}>Search</button>
      </div>

      <table className="list">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Status</th><th>Joined</th></tr></thead>
        <tbody>
          {items.map((u) => (
            <tr key={u._id}>
              <td><Link to={`/agent/users/${u._id}`}><strong>{u.name}</strong></Link></td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td>{u.isRegistered ? 'Yes' : 'Guest'}</td>
              <td><span className="pill" style={{ background: u.status === 'active' ? '#2f9e44' : '#6c757d' }}>{u.status}</span></td>
              <td>{formatDate(u.createdAt)}</td>
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
