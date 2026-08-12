import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatCurrency, formatDate } from '../lib/index.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/superadmin/dashboard')
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading…</div>;

  const c = data.counts;

  return (
    <>
      <h1>Platform Overview</h1>

      <div className="stat-cards">
        <div className="stat-card"><div className="num">{c.companies}</div><div className="lbl">Total Companies</div></div>
        <div className="stat-card"><div className="num">{c.activeCompanies}</div><div className="lbl">Active</div></div>
        <div className="stat-card"><div className="num">{formatCurrency(c.totalRevenue)}</div><div className="lbl">Lifetime Revenue</div></div>
        <div className="stat-card"><div className="num">{c.pendingInvoices}</div><div className="lbl">Pending Invoices</div></div>
        <div className="stat-card"><div className="num">{c.plans}</div><div className="lbl">Active Plans</div></div>
        <div className="stat-card"><div className="num">{c.tickets}</div><div className="lbl">Tickets</div></div>
        <div className="stat-card"><div className="num">{c.users}</div><div className="lbl">Customers</div></div>
        <div className="stat-card"><div className="num">{c.agents}</div><div className="lbl">Agents</div></div>
      </div>

      <div className="grid-2">
        <div className="box">
          <div className="box-header">
            <h1>Recent Companies</h1>
            <Link to="/companies">View all</Link>
          </div>
          {data.recentCompanies.length === 0 && <div className="muted">No companies yet.</div>}
          {data.recentCompanies.map((co) => (
            <div className="company-row" key={co._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
              <div>
                <strong style={{ color: 'var(--admin-blue-dark)' }}>{co.name}</strong>
                <div className="company-meta">
                  <span className={`pill ${co.status === 'active' ? 'green' : co.status === 'suspended' ? 'orange' : co.status === 'trial' ? 'purple' : 'gray'}`}>{co.status}</span>
                  <span>{co.plan?.name || 'No plan'}</span>
                  <span>Expires: {formatDate(co.planExpiresAt)}</span>
                </div>
              </div>
              <Link className="btn small secondary" to={`/companies/${co._id}`}>Open</Link>
            </div>
          ))}
        </div>

        <div className="box">
          <div className="box-header">
            <h1>Recent Invoices</h1>
            <Link to="/invoices">View all</Link>
          </div>
          {data.recentInvoices.length === 0 && <div className="muted">No invoices yet.</div>}
          {data.recentInvoices.map((inv) => (
            <div className="company-row" key={inv._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
              <div>
                <strong style={{ color: 'var(--admin-blue-dark)' }}>{inv.invoiceNumber}</strong>
                <div className="company-meta">
                  <span>{inv.company?.name || '—'}</span>
                  <span>{formatCurrency(inv.amount, inv.currency)}</span>
                  <span className={`pill ${inv.status === 'paid' ? 'green' : inv.status === 'failed' ? 'red' : 'orange'}`}>{inv.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.companyDistribution.length > 0 && (
        <div className="box">
          <div className="box-header"><h1>Companies by Plan</h1></div>
          {data.companyDistribution.map((d) => (
            <div key={d.plan} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span>{d.plan}</span>
                <strong>{d.count}</strong>
              </div>
              <div className="progress"><span style={{ width: `${Math.max((d.count / (c.companies || 1)) * 100, 4)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
