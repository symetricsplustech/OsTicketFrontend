import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/index.js';
import CustomFields, { resolveCustomFields } from '../components/CustomFields.jsx';

export default function NewTicket() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [depts, setDepts] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [forms, setForms] = useState([]);
  const [customValues, setCustomValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', name: '', phone: '',
    subject: '', details: '', priority: 'Normal', topicId: '', deptId: '', source: 'phone',
  });

  useEffect(() => {
    api.get('/tickets/open-form').then(({ data }) => {
      setTopics(data.topics || []);
      setDepts(data.departments || []);
      setCustomFields(data.customFields || []);
      setForms(data.forms || []);
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/agent/tickets', { ...form, customData: JSON.stringify(customValues) });
      navigate(`/agent/tickets/${data.ticket.number}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>Open New Ticket</h1></div>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <fieldset>
          <legend>Customer</legend>
          <div className="form-row">
            <div className="field"><label>Email <span className="req">*</span></label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="customer@example.com" /></div>
            <div className="field"><label>Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Customer name" /></div>
          </div>
          <div className="field"><label>Phone</label>
            <input type="text" value={form.phone} onChange={set('phone')} placeholder="Optional" /></div>
        </fieldset>

        <fieldset>
          <legend>Ticket</legend>
          <div className="field"><label>Subject <span className="req">*</span></label>
            <input type="text" value={form.subject} onChange={set('subject')} required placeholder="Summary of the issue" /></div>
          <div className="field"><label>Details</label>
            <textarea value={form.details} onChange={set('details')} rows={5} placeholder="Describe the issue…" /></div>
          <div className="form-row">
            <div className="field"><label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div className="field"><label>Source</label>
              <select value={form.source} onChange={set('source')}>
                <option value="phone">Phone</option>
                <option value="web">Web</option>
                <option value="email">Email</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field"><label>Help Topic</label>
              <select value={form.topicId} onChange={set('topicId')}>
                <option value="">— Select —</option>
                {topics.map((t) => <option key={t._id} value={t._id}>{t.topic}</option>)}
              </select>
            </div>
            <div className="field"><label>Department</label>
              <select value={form.deptId} onChange={set('deptId')}>
                <option value="">— Auto —</option>
                {depts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <CustomFields
          fields={resolveCustomFields({ customFields, forms, topicId: form.topicId })}
          values={customValues}
          onChange={setCustomValues}
        />

        <div className="buttons">
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create Ticket'}</button>
          <Link className="btn secondary" to="/agent/tickets">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
