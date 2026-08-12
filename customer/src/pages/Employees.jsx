import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isEmployee } from '../lib/permissions.js';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', permissions: [] };

export default function Employees() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [perms, setPerms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get('/users/employees')
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    api.get('/users/permissions-meta').then(({ data }) => setPerms(data.permissions)).catch(() => {});
    load();
  }, []);

  const togglePerm = (key) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form };
    if (editing && !payload.password) delete payload.password;
    try {
      if (editing) {
        await api.put(`/users/employees/${editing._id}`, payload);
      } else {
        await api.post('/users/employees', payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (emp) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone || '', password: '', permissions: emp.permissions || [] });
    setShowForm(true);
    setError('');
  };

  const toggleStatus = async (emp) => {
    setError('');
    try {
      await api.put(`/users/employees/${emp._id}`, { status: emp.status === 'active' ? 'disabled' : 'active' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (emp) => {
    if (!window.confirm(`Delete employee "${emp.name}"? Their tickets will remain under your account.`)) return;
    setError('');
    try {
      await api.delete(`/users/employees/${emp._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isEmployee(user)) {
    return (
      <div className="box">
        <div className="alert error">You do not have permission to manage employees.</div>
      </div>
    );
  }

  return (
    <div className="box">
      <div className="box-header">
        <h1>My Employees <span className="muted" style={{ fontSize: 12 }}>({items.length})</span></h1>
        <button type="button" className="btn small" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(!showForm); setError(''); }}>
          Add Employee
        </button>
      </div>
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="perm-panel">
          <h2>{editing ? `Edit Employee: ${editing.name}` : 'Add Employee'}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field">
                <label htmlFor="employee-name">Name <span className="req">*</span></label>
                <input id="employee-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="employee-email">Email <span className="req">*</span></label>
                <input id="employee-email" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="employee-password">{editing ? 'New Password (blank to keep)' : 'Password'} {!editing && <span className="req">*</span>}</label>
                <input id="employee-password" type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="employee-phone">Phone</label>
                <input id="employee-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <fieldset className="field">
              <legend>Permissions</legend>
              <span className="hint">Choose what this employee can do in the portal.</span>
              <div className="perm-list">
                {perms.map((p) => (
                  <label key={p.key} className="perm-chip">
                    <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} />
                    {p.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="buttons">
              <button className="btn small" type="submit" disabled={busy}>{(() => {
                if (busy) {
                  return 'Saving…';
                }

                if (editing) {
                  return 'Save Changes';
                }

                return 'Create Employee';
              })()}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <p className="muted">No employees yet. Add your first employee to give them access to the portal.</p>
      ) : (
        <table className="list">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Permissions</th><th>Status</th><th>Joined</th><th style={{ width: 170 }}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((emp) => (
              <tr key={emp._id}>
                <td><strong>{emp.name}</strong></td>
                <td>{emp.email}</td>
                <td>{emp.phone || '—'}</td>
                <td>
                  {emp.permissions.length === 0
                    ? <span className="muted small">No permissions</span>
                    : emp.permissions.map((p) => (
                        <span key={p} className="pill small-pill">{p.replace('ticket_', '').replace('_', ' ')}</span>
                      ))}
                </td>
                <td><span className={`pill ${emp.status === 'active' ? 'status-open' : 'status-closed'}`}>{emp.status}</span></td>
                <td>{formatDateTime(emp.createdAt)}</td>
                <td>
                  <button type="button" className="btn small secondary" onClick={() => startEdit(emp)}>Edit</button>{' '}
                  <button type="button" className="btn small secondary" onClick={() => toggleStatus(emp)}>{emp.status === 'active' ? 'Disable' : 'Enable'}</button>{' '}
                  <button type="button" className="btn small danger" onClick={() => del(emp)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
