import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function AdminCanned() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', response: '' });

  const load = () => {
    api.get('/admin/canned').then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/agent/canned', form);
      setForm({ title: '', response: '' });
      load();
    } catch (err) { setError(err.message); }
  };

  const del = async (item) => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/admin/canned/${item._id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>Canned Responses</h1></div>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={add} className="form-panel">
        <div className="field"><label>Title <span className="req">*</span></label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="field"><label>Response <span className="req">*</span></label>
          <textarea required value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} /></div>
        <div className="buttons"><button className="btn small" type="submit">Add Canned Response</button></div>
      </form>
      <table className="list">
        <thead><tr><th>Title</th><th>Response</th><th>Status</th><th style={{ width: 90 }}>Actions</th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c._id}>
              <td><strong>{c.title}</strong></td>
              <td className="small">{c.response}</td>
              <td><span className={`pill ${c.status === 'active' ? 'green' : 'gray'}`}>{c.status}</span></td>
              <td><button className="btn small danger" onClick={() => del(c)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
