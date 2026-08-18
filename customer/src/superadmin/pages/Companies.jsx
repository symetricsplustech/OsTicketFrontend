import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatDate } from '../lib/index.js';

const emptyForm = { name: '', email: '', domain: '', plan: '', billingCycle: 'monthly', trialDays: 14, adminEmail: '', adminPassword: '' };

export default function Companies() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    api.get(`/superadmin/companies?${params}`)
      .then(({ data }) => {
        setItems(data.data);
        setMeta(data.meta);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [page, status]);
  useEffect(() => {
    const t = setTimeout(() => { if (search !== '' || search.length > 0) { setPage(1); load(); } }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api.get('/superadmin/plans').then(({ data }) => setPlans(data.data)).catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/superadmin/companies', form);
      setShowModal(false);
      setForm(emptyForm);
      setPage(1);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Companies</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header">
          <h1>Tenant Management</h1>
          <button className="btn" onClick={() => setShowModal(true)}>+ New Company</button>
        </div>
        <div className="member-picker-toolbar" style={{ border: 'none', padding: '0 0 12px' }}>
          <input
            type="text"
            className="member-search"
            placeholder="Search by name, email, domain or contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="member-search-by" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <table className="list">
          <thead>
            <tr>
              <th>Company</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Users</th>
              <th>Agents</th>
              <th>Tickets</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="8" className="muted">No companies found.</td></tr>}
            {items.map((co) => (
              <tr key={co._id}>
                <td>
                  <strong>{co.name}</strong>
                  <div className="muted small">{co.domain || co.email || '—'}</div>
                </td>
                <td><span className="plan-badge">{co.plan?.name || 'No plan'}</span></td>
                <td><span className={`pill ${co.status === 'active' ? 'green' : co.status === 'suspended' ? 'orange' : co.status === 'trial' ? 'purple' : 'gray'}`}>{co.status}</span></td>
                <td>{co.users ?? '—'}</td>
                <td>{co.agents ?? '—'}</td>
                <td>{co.tickets ?? '—'}</td>
                <td>{formatDate(co.planExpiresAt)}</td>
                <td>
                  <Link className="btn small secondary" to={`/companies/${co._id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {meta.page} of {meta.totalPages || 1}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Create Company
              <button className="btn small secondary" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={create}>
                <div className="field">
                  <label>Company Name <span className="req">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Domain</label>
                    <input type="text" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Plan</label>
                    <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                      <option value="">Default plan</option>
                      {plans.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Billing Cycle</label>
                    <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Trial Days</label>
                    <input type="number" min="0" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="form-panel">
                  <strong>Company Administrator (optional)</strong>
                  <div className="form-row" style={{ marginTop: '8px' }}>
                    <div className="field">
                      <label>Admin Email</label>
                      <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Admin Password</label>
                      <input type="text" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="buttons">
                  <button type="submit" className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create Company'}</button>
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
