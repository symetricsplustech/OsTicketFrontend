import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function TicketStatuses() {
  return (
    <CrudManager
      url="/admin/ticket-statuses"
      title="Ticket Statuses"
      columns={[
        { key: 'name', label: 'Name', render: (s) => <strong>{s.name}</strong> },
        { key: 'key', label: 'Key', render: (s) => <code>{s.key}</code> },
        { key: 'color', label: 'Color', render: (s) => <span className="pill" style={{ background: s.color }}>{s.color}</span> },
        { key: 'isDefault', label: 'Default', render: (s) => s.isDefault ? 'Yes' : '—' },
        { key: 'isActive', label: 'Active', render: (s) => <span className={`pill ${s.isActive ? 'green' : 'gray'}`}>{s.isActive ? 'Active' : 'Disabled'}</span> },
        { key: 'sortOrder', label: 'Order' },
        { key: 'description', label: 'Description' },
      ]}
      fields={[
        { name: 'name', label: 'Status Name', required: true },
        { name: 'key', label: 'Key (unique, lowercase, e.g. pending)', required: true },
        { name: 'color', label: 'Color (hex)', default: '#4a86b0' },
        { name: 'isDefault', label: 'Default Status', type: 'checkbox' },
        { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
        { name: 'sortOrder', label: 'Sort Order', type: 'number', default: 0 },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}
