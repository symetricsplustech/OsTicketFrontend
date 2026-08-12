import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function CompanySettings() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', url: '', logo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get('/admin/company')
      .then((res) => {
        const c = res.data.data;
        console.log(c);
        setForm({
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          url: c.domain || '',
          logo: c.logo || '',
        });
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);
  const onLogoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const { data } = await api.post('/admin/company/logo', fd);
      setForm((f) => ({ ...f, logo: data.url }));
      setMessage('Logo uploaded.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await api.put('/admin/company', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        domain: form.url,
        logo: form.logo,
      });
      setMessage('Company settings saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="box">
      <div className="box-header"><h1>Company Settings</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        <div className="form-panel">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="field">
              <label htmlFor="company-name">Company / Help Desk Name</label>
              <input id="company-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="company-phone">Phone</label>
              <input id="company-phone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="company-email">Email</label>
              <input id="company-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="company-url">Website URL</label>
              <input id="company-url" type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="example.com" />
            </div>
          </div>
        </div>
        <div className="form-panel">
          <h2>Logo</h2>
          {form.logo && (
            <div style={{ marginBottom: 10 }}>
              <img src={form.logo} alt="Company logo" style={{ maxHeight: 70, maxWidth: 220, border: '1px solid var(--admin-border)', borderRadius: 4, padding: 4, background: '#fff' }} />
            </div>
          )}
          <div className="form-row">
            <div className="field">
              <label htmlFor="company-logo-url">Logo URL</label>
              <input id="company-logo-url" type="text" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="/uploads/logo.png" />
            </div>
            <div className="field">
              <label htmlFor="company-logo-file">Upload Logo</label>
              <input id="company-logo-file" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={onLogoFile} />
              <span className="hint">{uploading ? 'Uploading…' : 'Select a logo file from your device.'}</span>
            </div>
          </div>
        </div>
        <div className="buttons"><button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Settings'}</button></div>
      </form>
    </div>
  );
}
