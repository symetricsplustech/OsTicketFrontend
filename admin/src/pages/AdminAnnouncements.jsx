import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', body: '' });

  const load = () => {
    api.get('/agent/announcements').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', form);
      setForm({ title: '', body: '' });
      load();
    } catch (err) { setError(err.message); }
  };

  const del = async (item) => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/admin/announcements/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>Announcements</h1></div>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={add} className="form-panel">
        <div className="field"><label>Title <span className="req">*</span></label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="field"><label>Body <span className="req">*</span></label>
          <textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <div className="buttons"><button className="btn small" type="submit">Add Announcement</button></div>
      </form>
      {items.map((a) => (
        <div key={a._id} style={{ border: '1px solid var(--admin-border-light)', padding: 12, marginBottom: 10 }}>
          <strong>{a.title}</strong>{' '}
          <span className={`pill ${a.isActive ? 'green' : 'gray'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
          <span className="small muted"> · {formatDateTime(a.createdAt)}</span>
          <div className="small mt-10" style={{ whiteSpace: 'pre-wrap' }}>{a.body}</div>
          <div className="mt-10"><button className="btn small danger" onClick={() => del(a)}>Delete</button></div>
        </div>
      ))}
    </div>
  );
}
