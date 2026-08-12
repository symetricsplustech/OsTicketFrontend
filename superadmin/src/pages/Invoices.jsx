import React, { useEffect, useState } from 'react';
import { api, formatCurrency, formatDate } from '../lib/index.js';

export default function Invoices() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.set('status', status);
    api.get(`/superadmin/invoices?${params}`)
      .then(({ data }) => {
        setItems(data.data);
        setMeta(data.meta);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [page, status]);

  return (
    <>
      <h1>Invoices</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header">
          <h1>Billing History</h1>
        </div>
        <div className="member-picker-toolbar" style={{ border: 'none', padding: '0 0 12px' }}>
          <select className="member-search-by" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <table className="list">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Company</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Period</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="7" className="muted">No invoices.</td></tr>}
            {items.map((inv) => (
              <tr key={inv._id}>
                <td><strong>{inv.invoiceNumber}</strong></td>
                <td>{inv.company?.name || '—'}</td>
                <td>{inv.plan?.name || '—'}</td>
                <td>{formatCurrency(inv.amount, inv.currency)}</td>
                <td><span className={`pill ${inv.status === 'paid' ? 'green' : inv.status === 'failed' ? 'red' : 'orange'}`}>{inv.status}</span></td>
                <td>{formatDate(inv.periodStart)} → {formatDate(inv.periodEnd)}</td>
                <td>{formatDate(inv.paidAt)}</td>
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
    </>
  );
}
