import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function Integrations() {
  return (
    <CrudManager
      url="/admin/integrations"
      title="Plugins &amp; Integrations"
      columns={[
        { key: 'icon', label: '', render: (p) => <span style={{ fontSize: 20 }}>{p.icon || '🧩'}</span> },
        { key: 'name', label: 'Name', render: (p) => <strong>{p.name}</strong> },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category', render: (p) => <span className="pill">{p.category}</span> },
        { key: 'isEnabled', label: 'Status', render: (p) => <span className={`pill ${p.isEnabled ? 'green' : 'gray'}`}>{p.isEnabled ? 'Enabled' : 'Disabled'}</span> },
      ]}
      fields={[
        { name: 'key', label: 'Key (unique, lowercase, e.g. slack)', required: true },
        { name: 'name', label: 'Name', required: true },
        { name: 'icon', label: 'Icon (emoji or URL)' },
        { name: 'category', label: 'Category', type: 'select', default: 'other', options: [
          { value: 'chat', label: 'Chat' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'messaging', label: 'Messaging' },
          { value: 'authentication', label: 'Authentication' },
          { value: 'automation', label: 'Automation' },
          { value: 'other', label: 'Other' },
        ] },
        { name: 'isEnabled', label: 'Enabled', type: 'checkbox' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'config', label: 'Configuration (JSON, e.g. {"webhook_url":"..."})', type: 'textarea', get: (p) => (p.config ? JSON.stringify(p.config, null, 2) : '') },
      ]}
    />
  );
}
