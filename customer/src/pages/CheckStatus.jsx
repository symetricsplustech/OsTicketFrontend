import React, { useState } from 'react';
import { api, formatDateTime } from '../lib/index.js';

export default function CheckStatus() {
  const [form, setForm] = useState({ email: '', number: '' });
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setTicket(null);
    try {
      const { data } = await api.get('/tickets/check-status', { params: form });
      setTicket(data.ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>Check Ticket Status</h1></div>
      <p>Enter your email address and ticket number to view the status of your ticket.</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email Address <span className="req">*</span></label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label>Ticket Number <span className="req">*</span></label>
          <input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required placeholder="e.g. LK2M3X9ABCDE" />
        </div>
        <div className="buttons">
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Checking…' : 'Check Status'}</button>
        </div>
      </form>

      {ticket && (
        <div className="mt-20">
          <h2>Ticket #{ticket.number}</h2>
          <table className="list">
            <tbody>
              <tr><th style={{ width: '160px' }}>Subject</th><td>{ticket.subject}</td></tr>
              <tr><th>Status</th><td><span className={`pill status-${ticket.status}`}>{ticket.status}</span></td></tr>
              <tr><th>Priority</th><td><span className={`pill priority priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td></tr>
              <tr><th>Department</th><td>{ticket.dept?.name || '—'}</td></tr>
              <tr><th>Help Topic</th><td>{ticket.topic?.topic || '—'}</td></tr>
              <tr><th>Agent</th><td>{ticket.agent?.name || ticket.team?.name || 'Unassigned'}</td></tr>
              <tr><th>Created</th><td>{formatDateTime(ticket.createdAt)}</td></tr>
              <tr><th>Last Updated</th><td>{formatDateTime(ticket.updatedAt)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
