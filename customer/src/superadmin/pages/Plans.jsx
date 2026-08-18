import React, { useEffect, useState } from 'react';
import { api, formatCurrency } from '../lib/index.js';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  priceMonthly: 0,
  priceYearly: 0,
  maxAgents: 5,
  maxUsers: 100,
  storageLimit: 5368709120,
  features: '',
  apiAccess: false,
  prioritySupport: false,
  trialDays: 14,
  isActive: true,
  isDefault: false,
};

export default function Plans() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api.get('/superadmin/plans')
      .then(({ data }) => setItems(data.data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...p,
      features: (p.features || []).join(', '),
    });
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.put(`/superadmin/plans/${editing._id}`, payload);
      } else {
        await api.post('/superadmin/plans', payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete plan "${p.name}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/superadmin/plans/${p._id}`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fmtStorage = (bytes) => {
    if (!bytes) return '—';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb} GB` : `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <>
      <h1>Billing Plans</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header">
          <h1>Plan Management</h1>
          <button className="btn" onClick={openNew}>+ New Plan</button>
        </div>
        <table className="list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Monthly</th>
              <th>Yearly</th>
              <th>Agents</th>
              <th>Users</th>
              <th>Storage</th>
              <th>Trial</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="9" className="muted">No plans.</td></tr>}
            {items.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.name}</strong>
                  <div className="muted small">{p.code}</div>
                  {p.isDefault && <span className="pill purple" style={{ marginTop: '4px' }}>Default</span>}
                </td>
                <td>{p.priceMonthly === 0 ? 'Free' : formatCurrency(p.priceMonthly)}</td>
                <td>{p.priceYearly === 0 ? 'Free' : formatCurrency(p.priceYearly)}</td>
                <td>{p.maxAgents}</td>
                <td>{p.maxUsers}</td>
                <td>{fmtStorage(p.storageLimit)}</td>
                <td>{p.trialDays}d</td>
                <td><span className={`pill ${p.isActive ? 'green' : 'gray'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="buttons" style={{ margin: 0 }}>
                    <button className="btn small secondary" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(p)} disabled={busy}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 620 }}>
            <div className="modal-header">
              {editing ? 'Edit Plan' : 'New Plan'}
              <button className="btn small secondary" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submit}>
                <div className="form-row">
                  <div className="field">
                    <label>Name <span className="req">*</span></label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>Code <span className="req">*</span></label>
                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                  </div>
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Price (Monthly)</label>
                    <input type="number" min="0" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })} />
                  </div>
                  <div className="field">
                    <label>Price (Yearly)</label>
                    <input type="number" min="0" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: Number(e.target.value) })} />
                  </div>
                  <div className="field">
                    <label>Trial Days</label>
                    <input type="number" min="0" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Max Agents</label>
                    <input type="number" min="1" value={form.maxAgents} onChange={(e) => setForm({ ...form, maxAgents: Number(e.target.value) })} />
                  </div>
                  <div className="field">
                    <label>Max Users</label>
                    <input type="number" min="1" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: Number(e.target.value) })} />
                  </div>
                  <div className="field">
                    <label>Storage (bytes)</label>
                    <input type="number" min="0" value={form.storageLimit} onChange={(e) => setForm({ ...form, storageLimit: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="field">
                  <label>Features (comma separated)</label>
                  <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                </div>
                <div className="form-row">
                  <label className="member-option" style={{ border: '1px solid var(--admin-border-light)' }}>
                    <input type="checkbox" checked={form.apiAccess} onChange={(e) => setForm({ ...form, apiAccess: e.target.checked })} />
                    <span>API Access</span>
                  </label>
                  <label className="member-option" style={{ border: '1px solid var(--admin-border-light)' }}>
                    <input type="checkbox" checked={form.prioritySupport} onChange={(e) => setForm({ ...form, prioritySupport: e.target.checked })} />
                    <span>Priority Support</span>
                  </label>
                  <label className="member-option" style={{ border: '1px solid var(--admin-border-light)' }}>
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Active</span>
                  </label>
                  <label className="member-option" style={{ border: '1px solid var(--admin-border-light)' }}>
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                    <span>Default Plan</span>
                  </label>
                </div>
                <div className="buttons">
                  <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save Plan'}</button>
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
