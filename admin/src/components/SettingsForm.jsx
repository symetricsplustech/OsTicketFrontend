import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export function SettingsForm({ section, fields, heading, refs }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      setValues(data.settings[section] || {});
      setLoading(false);
    }).catch((err) => { setError(err.message); setLoading(false); });
  }, [section]);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/admin/settings', { section, values });
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="box muted">Loading…</div>;

  return (
    <div className="box">
      <div className="box-header"><h1>{heading}</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        {fields.map((f) => (
          <div className="field" key={f.name}>
            <label>{f.label}</label>
            {f.type === 'select' ? (
              <select value={values[f.name] ?? f.default ?? ''} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea value={values[f.name] ?? f.default ?? ''} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            ) : f.type === 'checkbox' ? (
              <input type="checkbox" checked={!!values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })} />
            ) : (
              <input type={f.type || 'text'} value={values[f.name] ?? f.default ?? ''} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="buttons"><button className="btn" type="submit">Save Settings</button></div>
      </form>
    </div>
  );
}
