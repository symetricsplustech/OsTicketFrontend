import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function CustomFields() {
  return (
    <CrudManager
      url="/admin/custom-fields"
      title="Custom Fields"
      columns={[
        { key: 'label', label: 'Label', render: (f) => <strong>{f.label}</strong> },
        { key: 'name', label: 'Field Name', render: (f) => <code>{f.name}</code> },
        { key: 'type', label: 'Type', render: (f) => <span className="pill">{f.type}</span> },
        { key: 'required', label: 'Required', render: (f) => f.required ? 'Yes' : '—' },
        { key: 'helpTopic', label: 'Help Topic', render: (f) => f.helpTopic?.topic || 'All Topics' },
        { key: 'isActive', label: 'Active', render: (f) => <span className={`pill ${f.isActive ? 'green' : 'gray'}`}>{f.isActive ? 'Active' : 'Disabled'}</span> },
        { key: 'options', label: 'Options', render: (f) => (f.options || []).join(', ') },
      ]}
      fields={[
        { name: 'label', label: 'Label (shown to users)', required: true },
        { name: 'name', label: 'Field Name (key, lowercase, e.g. order_number)', required: true },
        { name: 'type', label: 'Field Type', type: 'select', default: 'text', options: [
          { value: 'text', label: 'Text' },
          { value: 'textarea', label: 'Textarea' },
          { value: 'select', label: 'Dropdown' },
          { value: 'checkbox', label: 'Checkbox' },
          { value: 'number', label: 'Number' },
          { value: 'date', label: 'Date' },
        ] },
        { name: 'required', label: 'Required Field', type: 'checkbox' },
        { name: 'options', label: 'Options (comma separated, for dropdown)', type: 'textarea' },
        { name: 'placeholder', label: 'Placeholder' },
        { name: 'helpTopic', label: 'Restrict to Help Topic', type: 'select', options: [], placeholder: '— All Topics —' },
        { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
        { name: 'sortOrder', label: 'Sort Order', type: 'number', default: 0 },
      ]}
      references={{
        helpTopic: { url: '/admin/help-topics', label: 'topic' },
      }}
      extra={{
        onSaved: () => {},
      }}
    />
  );
}
