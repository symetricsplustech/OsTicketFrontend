import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function CrudManager({ url, columns, fields, title, extra, references }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [refOptions, setRefOptions] = useState({});

  const load = () => {
    api.get(url).then(({ data }) => setItems(data.items)).catch((err) => setError(err.message));
  };

  useEffect(load, [url]);

  useEffect(() => {
    if (!references) return;
    let cancelled = false;
    Promise.all(
      Object.entries(references).map(async ([field, ref]) => {
        const { data } = await api.get(ref.url);
        const items = data.items || [];
        return [
          field,
          items.map((it) => ({
            value: it._id,
            label: typeof ref.label === 'function' ? ref.label(it) : it[ref.label],
          })),
        ];
      })
    )
      .then((entries) => { if (!cancelled) setRefOptions(Object.fromEntries(entries)); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [references]);

  const startNew = () => {
    const init = {};
    fields.forEach((f) => { init[f.name] = f.multiple ? [] : (f.default || ''); });
    setForm(init);
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (item) => {
    const init = {};
    fields.forEach((f) => {
      if (f.multiple) {
        const raw = f.get ? f.get(item) : (item[f.name] ?? []);
        init[f.name] = (raw || []).map((x) => (x && typeof x === 'object' ? (x._id || '') : x));
      } else {
        init[f.name] = f.get ? f.get(item) : (item[f.name] ?? f.default ?? '');
      }
    });
    setForm(init);
    setEditing(item);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`${url}/${editing._id}`, form);
      } else {
        await api.post(url, form);
      }
      setShowForm(false);
      load();
      if (extra?.onSaved) extra.onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`${url}/${item._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>{title}</h1>
        <button className="btn small" onClick={startNew}>Add New</button>
      </div>
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="form-panel">
          <h2>{editing ? `Edit: ${fields.find((f) => f.name === 'name' || f.name === 'title' || f.name === 'topic')?.get?.(editing) || editing.name || editing.title || editing.topic || ''}` : `Add New ${title}`}</h2>
          <form onSubmit={save}>
            <div className="form-row">
              {fields.map((f) => (
                <div className="field" key={f.name}>
                  <label>{f.label}{f.required && <span className="req"> *</span>}</label>
                  {f.type === 'select' ? (
                    f.multiple ? (
                      <select
                        multiple
                        value={form[f.name] || []}
                        required={f.required}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                          setForm({ ...form, [f.name]: options });
                        }}
                        style={{ minHeight: 120 }}
                      >
                        {(f.options || refOptions[f.name] || []).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <select value={form[f.name] ?? ''} required={f.required} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                        <option value="">{f.placeholder || '— Select —'}</option>
                        {(f.options || refOptions[f.name] || []).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    )
                  ) : f.type === 'textarea' ? (
                    <textarea value={form[f.name] ?? ''} required={f.required} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : f.type === 'checkbox' ? (
                    <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
                  ) : (
                    <input type={f.type || 'text'} value={form[f.name] ?? ''} required={f.required} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div className="buttons">
              <button className="btn small" type="submit">{editing ? 'Save Changes' : 'Create'}</button>
              <button className="btn small secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="list">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            <th style={{ width: 130 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="muted text-center">No records found.</td></tr>
          ) : items.map((item) => (
            <tr key={item._id}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(item) : item[c.key] ?? '—'}</td>)}
              <td>
                <button className="btn small secondary" onClick={() => startEdit(item)}>Edit</button>{' '}
                <button className="btn small danger" onClick={() => remove(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
