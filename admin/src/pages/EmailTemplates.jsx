import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

const FALLBACK_TRIGGERS = [
  { value: 'new_ticket_confirmation', label: 'New ticket created — customer confirmation', recipient: 'user' },
  { value: 'new_ticket_alert', label: 'New ticket created — staff alert', recipient: 'staff' },
  { value: 'new_reply_alert', label: 'Customer replied — staff alert', recipient: 'staff' },
  { value: 'ticket_response', label: 'Staff responded to ticket', recipient: 'user' },
  { value: 'ticket_assigned', label: 'Ticket assigned to agent', recipient: 'agent' },
  { value: 'ticket_closed', label: 'Ticket closed', recipient: 'user' },
  { value: 'welcome_user', label: 'Customer account created', recipient: 'user' },
  { value: 'employee_welcome', label: 'Employee account created', recipient: 'user' },
  { value: 'password_reset', label: 'Password reset requested', recipient: 'user' },
  { value: 'admin_welcome', label: 'Company admin account created', recipient: 'admin' },
  { value: 'company_admin_created', label: 'Company registered on platform', recipient: 'admin' },
];

const FALLBACK_RECIPIENTS = [
  { value: 'user', label: 'Customer' },
  { value: 'agent', label: 'Assigned Agent' },
  { value: 'staff', label: 'All Staff (department)' },
  { value: 'admin', label: 'Company Admin' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  trigger: '',
  recipient: 'user',
  subject: '',
  body: '',
  isActive: true,
};

const recipientLabel = (value, recipients) =>
  (recipients.find((r) => r.value === value) || {}).label || value;

export default function EmailTemplates() {
  const [items, setItems] = useState([]);
  const [triggers, setTriggers] = useState(FALLBACK_TRIGGERS);
  const [recipients, setRecipients] = useState(FALLBACK_RECIPIENTS);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/admin/email-templates')
      .then(({ data }) => {
        setItems(data.items || []);
        if (data.meta?.triggers?.length) setTriggers(data.meta.triggers);
        if (data.meta?.recipients?.length) setRecipients(data.meta.recipients);
      })
      .catch((err) => setError(err.message));
  };
  useEffect(load, []);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      trigger: item.trigger || item.key || '',
      recipient: item.recipient || 'user',
      subject: item.subject || '',
      body: item.body || '',
      isActive: item.isActive !== false,
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editing) {
        const { data } = await api.put(`/admin/email-templates/${editing._id}`, form);
        if (data.overridden) setSuccess(`Company-specific copy of "${data.template.name}" created and updated.`);
        else setSuccess('Template updated.');
      } else {
        await api.post('/admin/email-templates', form);
        setSuccess('Template created.');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/admin/email-templates/${item._id}`, { isActive: !item.isActive });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete template "${item.name}"?`)) return;
    try {
      await api.delete(`/admin/email-templates/${item._id}`);
      setSuccess('Template deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Email Templates</h1>
        <button className="btn small" onClick={openCreate}>Add Template</button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {showForm && (
        <div className="form-panel">
          <h2>{editing ? `Edit Template: ${editing.name}` : 'Add Template'}</h2>
          {editing?.isGlobal && (
            <div className="alert info small">
              This is a system template. Saving creates a company-specific copy you can customize without affecting other companies.
            </div>
          )}
          <form onSubmit={save}>
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              {!editing && (
                <div className="field">
                  <label>Send Notification When <span className="req">*</span></label>
                  <select required value={form.trigger} onChange={(e) => {
                    const t = triggers.find((x) => x.value === e.target.value);
                    setForm((f) => ({ ...f, trigger: e.target.value, recipient: t?.recipient || f.recipient }));
                  }}>
                    <option value="">Select trigger…</option>
                    {triggers.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}
              <div className="field"><label>Recipient</label>
                <select value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })}>
                  {recipients.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select></div>
              <div className="field"><label>Status</label>
                <select value={form.isActive ? 'active' : 'disabled'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select></div>
            </div>
            {!editing && (
              <div className="field"><label>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="When and to whom this email is sent" /></div>
            )}
            <div className="field"><label>Subject <span className="req">*</span></label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="field"><label>Body <span className="req">*</span></label>
              <textarea rows={12} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <p className="small muted">
              Placeholders: {'%{user.name}'}, {'%{ticket.number}'}, {'%{ticket.subject}'}, {'%{ticket.link}'}, {'%{agent.name}'}, {'%{dept.name}'}, {'%{company.name}'}
            </p>
            <div className="buttons mt-10">
              <button className="btn small" type="submit" disabled={saving}>{saving ? 'Saving…' : (editing ? 'Save' : 'Create')}</button>
              <button className="btn small secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="list">
        <thead>
          <tr>
            <th>Template</th>
            <th>Send When (Trigger)</th>
            <th>Recipient</th>
            <th>Status</th>
            <th>Type</th>
            <th style={{ width: 170 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={6} className="small muted">No templates yet. Click “Add Template” to create one.</td></tr>
          )}
          {items.map((t) => (
            <tr key={t._id}>
              <td>
                <strong>{t.name}</strong>
                {t.description && <div className="small muted">{t.description}</div>}
              </td>
              <td className="small">{t.triggerLabel || t.trigger || t.key}</td>
              <td><span className="pill gray">{recipientLabel(t.recipient, recipients)}</span></td>
              <td>
                <button
                  type="button"
                  className={`pill ${t.isActive ? 'green' : 'gray'}`}
                  style={{ border: 0, cursor: 'pointer' }}
                  title={t.isActive ? 'Click to disable' : 'Click to enable'}
                  onClick={() => toggleActive(t)}
                >
                  {t.isActive ? 'Active' : 'Disabled'}
                </button>
              </td>
              <td><span className={`pill ${t.isGlobal ? 'purple' : 'orange'}`}>{t.isGlobal ? 'System' : 'Company'}</span></td>
              <td>
                <button className="btn small secondary" onClick={() => openEdit(t)}>Edit</button>{' '}
                {!t.isGlobal && <button className="btn small danger" onClick={() => del(t)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
