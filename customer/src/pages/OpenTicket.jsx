import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import TicketGuide3D from '../components/TicketGuide3D.jsx';
import TicketSuccess3D from '../components/TicketSuccess3D.jsx';
import { can, USER_PERMISSIONS } from '../lib/permissions.js';
import CustomFields, { resolveCustomFields } from '../components/CustomFields.jsx';

export default function OpenTicket() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ topics: [], departments: [] });
  const [emailToTicket, setEmailToTicket] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [forms, setForms] = useState([]);
  const [customValues, setCustomValues] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', topic: '', priority: 'Normal', details: '',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const canCreate = can(user, USER_PERMISSIONS.TICKET_CREATE);

  useEffect(() => {
    api.get('/tickets/open-form').then(({ data }) => {
      setFormData(data);
      setEmailToTicket(data.emailToTicket || '');
      setCustomFields(data.customFields || []);
      setForms(data.forms || []);
      setForm((f) => ({ ...f, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' }));
    }).catch(() => {});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('customData', JSON.stringify(customValues));
      files.forEach((f) => fd.append('files', f));
      const { data } = await api.post('/tickets', fd);
      setResult(data.ticket);
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', topic: '', priority: 'Normal', details: '' });
      setCustomValues({});
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="ticket-success">
        <TicketSuccess3D />
        <div className="box">
          <div className="box-header"><h1>Ticket Opened</h1></div>
          <div className="alert success">
            Your support ticket has been created successfully. A confirmation email has been sent to your email address.
          </div>
          <p>
            <strong>Ticket Number:</strong> <span style={{ fontSize: 16 }}>{result.number}</span>
            <br />
            <strong>Subject:</strong> {result.subject}
            <br />
            <strong>Status:</strong> <span className={`pill status-${result.status}`}>{result.status}</span>
          </p>
          <div className="buttons">
            <Link className="btn" to={`/ticket/${result.number}`}>View Ticket</Link>
            <Link className="btn secondary" to="/open">Open Another Ticket</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="open-ticket-layout">
      <div className="box open-ticket-form">
        <div className="box-header"><h1>Open A New Ticket</h1></div>
        {emailToTicket && (
          <div className="alert info email-to-ticket" style={{ fontSize: 13, lineHeight: 1.6 }}>
            <strong>Prefer email?</strong> Send your request to <a href={`mailto:${emailToTicket}`}><strong>{emailToTicket}</strong></a> —
            a ticket will be created automatically and our team will reply to your email.
          </div>
        )}
        {error && <div className="alert error">{error}</div>}
        {user && !canCreate ? (
          <div className="alert error">Your account does not have permission to create tickets. Please contact your organization administrator.</div>
        ) : (
        <form onSubmit={submit}>
        {!user && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="field">
              <label>Name <span className="req">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Email <span className="req">*</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        )}
        <div className="field">
          <label>Help Topic <span className="req">*</span></label>
          <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required>
            <option value="">Select a Help Topic</option>
            {formData.topics.map((t) => (
              <option key={t._id} value={t._id}>{t.topic}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Issue Summary <span className="req">*</span></label>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
            placeholder="Brief summary of your issue" />
        </div>
        <div className="field">
          <label>Details <span className="req">*</span></label>
          <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} required
            placeholder="Please describe your issue in detail so we can help you faster." />
        </div>
        <div className="field">
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>Low</option><option>Normal</option><option>High</option><option>Emergency</option>
          </select>
        </div>
        <CustomFields
          fields={resolveCustomFields({ customFields, forms, topicId: form.topic })}
          values={customValues}
          onChange={setCustomValues}
        />
        <div className="field">
          <label>Attachments</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
          <span className="hint">Up to 5 files, 5MB each</span>
        </div>
        <div className="buttons">
          <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Submitting…' : 'Create Ticket'}</button>
        </div>
        </form>
        )}
      </div>
      <TicketGuide3D />
    </div>
  );
}
