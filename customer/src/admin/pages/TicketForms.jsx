import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function TicketForms() {
  return (
    <CrudManager
      url="/admin/ticket-forms"
      title="Ticket Forms"
      columns={[
        { key: 'name', label: 'Name', render: (f) => <strong>{f.name}</strong> },
        { key: 'helpTopic', label: 'Help Topic', render: (f) => f.helpTopic?.topic || 'Default / All' },
        { key: 'fields', label: 'Fields', render: (f) => (f.fields || []).map((x) => x.label || x.name || x).join(', ') || '—' },
        { key: 'isDefault', label: 'Default', render: (f) => f.isDefault ? 'Yes' : '—' },
        { key: 'isActive', label: 'Active', render: (f) => <span className={`pill ${f.isActive ? 'green' : 'gray'}`}>{f.isActive ? 'Active' : 'Disabled'}</span> },
        { key: 'description', label: 'Description' },
      ]}
      fields={[
        { name: 'name', label: 'Form Name', required: true },
        { name: 'helpTopic', label: 'Apply To Help Topic', type: 'select', options: [], placeholder: '— Default Form (all topics) —' },
        { name: 'fields', label: 'Fields (multi-select)', type: 'select', options: [], multiple: true },
        { name: 'isDefault', label: 'Use as Default Form', type: 'checkbox' },
        { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      references={{
        helpTopic: { url: '/admin/help-topics', label: 'topic' },
        fields: { url: '/admin/custom-fields', label: (f) => f.label },
      }}
    />
  );
}
