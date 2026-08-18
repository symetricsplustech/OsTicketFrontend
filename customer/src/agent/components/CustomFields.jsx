import React from 'react';

export function resolveCustomFields({ customFields = [], forms = [], topicId = '' }) {
  const match = (id) => !id || String(id) === String(topicId);
  const form = forms.find(
    (f) => (f.helpTopic ? match(f.helpTopic._id || f.helpTopic) : false)
  ) || forms.find((f) => f.isDefault && !f.helpTopic);
  if (form && form.fields?.length) {
    return form.fields.filter((f) => f.isActive !== false);
  }
  return customFields.filter((f) => match(f.helpTopic && (f.helpTopic._id || f.helpTopic)));
}

export default function CustomFields({ fields, values, onChange }) {
  if (!fields || fields.length === 0) return null;
  const setValue = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 'Yes' : 'No') : e.target.value;
    onChange({ ...values, [name]: value });
  };
  return (
    <div className="form-panel">
      <h2>Additional Information</h2>
      <div className="form-row">
        {fields.map((f) => (
          <div className="field" key={f._id}>
            <label>{f.label}{f.required && <span className="req"> *</span>}</label>
            {f.type === 'textarea' ? (
              <textarea value={values[f.name] || ''} required={f.required} onChange={setValue(f.name)} placeholder={f.placeholder} rows={3} />
            ) : f.type === 'select' ? (
              <select value={values[f.name] || ''} required={f.required} onChange={setValue(f.name)}>
                <option value="">— Select —</option>
                {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={values[f.name] === 'Yes'} onChange={setValue(f.name)} />
                {f.label}
              </label>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={values[f.name] || ''}
                required={f.required}
                onChange={setValue(f.name)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
