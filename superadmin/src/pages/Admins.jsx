import React, { useEffect, useState } from 'react';
import { api, formatDate } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { name: '', email: '', password: '', role: 'super_admin' };

export default function Admins() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/superadmin/admins')
      .then(({ data }) => setItems(data.data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/superadmin/admins', form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (sa) => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/superadmin/admins/${sa._id}`, { isActive: !sa.isActive });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (sa) => {
    if (!window.confirm(`Remove super admin "${sa.name}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/superadmin/admins/${sa._id}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Super Admins</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header">
          <h1>Platform Administrators</h1>
          <button className="btn" onClick={() => setShowModal(true)}>+ New Super Admin</button>
        </div>
        <table className="list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="7" className="muted">No super admins.</td></tr>}
            {items.map((sa) => (
              <tr key={sa._id}>
                <td>
                  <strong>{sa.name}</strong>
                  {sa._id === user?._id && <span className="plan-badge" style={{ marginLeft: '6px' }}>You</span>}
                </td>
                <td>{sa.email}</td>
                <td><span className="plan-badge">{sa.role}</span></td>
                <td><span className={`pill ${sa.isActive ? 'green' : 'gray'}`}>{sa.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{formatDate(sa.lastLogin)}</td>
                <td>{formatDate(sa.createdAt)}</td>
                <td>
                  <div className="buttons" style={{ margin: 0 }}>
                    <button className="btn small secondary" onClick={() => toggleActive(sa)} disabled={busy || sa._id === user?._id}>
                      {sa.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn small danger" onClick={() => remove(sa)} disabled={busy || sa._id === user?._id}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              New Super Admin
              <button className="btn small secondary" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submit}>
                <div className="field">
                  <label>Name <span className="req">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Password <span className="req">*</span></label>
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="super_admin">Super Admin</option>
                    <option value="support">Platform Support</option>
                  </select>
                </div>
                <div className="buttons">
                  <button type="submit" className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
                  <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
